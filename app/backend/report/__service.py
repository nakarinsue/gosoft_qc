from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any,List

# สมมติว่ามีการ import models จากไฟล์ของคุณ
from ..database.models.postgres_models import MPromotionHeader, MVersionControl, MFileMaster, TTransaction, MaUser,Minformationimport

def get_promotion_summary(db: Session) -> Dict[str, Any]:
    status_summary = db.query(MVersionControl.detail,Minformationimport.description,MPromotionHeader.reward_type,
        func.count(MPromotionHeader.pro_code).label("total")
    ).join(MFileMaster, MPromotionHeader.file_id == MFileMaster.id
    ).join(Minformationimport, MFileMaster.v_id == Minformationimport.id
    ).join(MVersionControl, Minformationimport.v_id == MVersionControl.id
    ).group_by(MVersionControl.detail,Minformationimport.description,MPromotionHeader.reward_type).all()

    type_summary = db.query(
        MPromotionHeader.pro_type, 
        func.count(MPromotionHeader.id).label("total")
    ).group_by(MPromotionHeader.pro_type).all()

    return {
        "status_chart": [{"version": row.detail, "system": row.description, "reward": row.reward_type, "count": row.total} for row in status_summary],
        "type_chart": [{"type": row.pro_type, "count": row.total} for row in type_summary],
        "total_promotions": sum(row.total for row in status_summary)
    }

def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    total_users = db.query(func.count(MaUser.user_id)).filter(MaUser.is_active == True).scalar()
    total_versions = db.query(func.count(MVersionControl.id)).scalar()
    total_promotions = db.query(func.count(MPromotionHeader.id)).filter(MPromotionHeader.state == 1).scalar()
    total_transactions = db.query(func.count(TTransaction.id)).filter(TTransaction.types == 2).scalar()

    return {
        "summary_cards": {
            "active_users": total_users or 0,
            "total_versions": total_versions or 0,
            "total_promotions": total_promotions or 0,
            "total_transactions": total_transactions or 0
        }
    }

def get_defect_summary(db: Session) -> Dict[str, Any]:
    file_errors = db.query(
        MFileMaster.file_name,
        func.coalesce(func.sum(MFileMaster.e_row), 0).label("total_errors"),
        func.coalesce(func.sum(MFileMaster.r_row), 0).label("total_reads")
    ).group_by(MFileMaster.file_name).having(func.sum(MFileMaster.e_row) > 0).all()

    transaction_defects = db.query(
        TTransaction.store_code,
        func.count(TTransaction.id).label("defect_count")
    ).filter(TTransaction.status != 1).group_by(TTransaction.store_code).all()

    return {
        "file_import_defects": [
            {"file_name": row.file_name, "errors": row.total_errors, "reads": row.total_reads} 
            for row in file_errors
        ],
        "transaction_defects_by_store": [
            {"store_code": row.store_code, "defect_count": row.defect_count} 
            for row in transaction_defects
        ]
    }

def get_version_summary(db: Session) -> Dict[str, Any]:
    version_status = db.query(
        MVersionControl.status,
        func.count(MVersionControl.id).label("total")
    ).group_by(MVersionControl.status).all()

    latest_versions = db.query(MVersionControl).order_by(MVersionControl.date_create.desc()).limit(10).all()

    return {
        "status_summary": [{"status": row.status, "count": row.total} for row in version_status],
        "latest_versions_table": [
            {   
                "sr_no": row.sr_no,
                "title": row.title,
                "date_create": row.date_create,
                "status": row.status
            } for row in latest_versions
        ]
    }
def format_file_master_data(records: List[Any]) -> Dict[int, Any]:
    """
    ฟังก์ชันสำหรับจัดรูปแบบข้อมูลที่ได้จาก Database ให้อยู่ในรูปแบบ Dictionary
    จัดกลุ่มตาม v_id และคำนวณผลรวม (Aggregation) ในรอบเดียวเพื่อประสิทธิภาพสูงสุด
    """
    grouped_data = {}
    
    for row in records:
        v_id = row.v_id
        
        # 1. ถ้ายังไม่มี v_id นี้ ให้สร้างโครงสร้างมารอไว้
        if v_id not in grouped_data:
            grouped_data[v_id] = {
                "id": v_id,
                "date": row.date_create,
                "user": row.username,
                "_temp_files": set(),  # ใช้ Set ชั่วคราวเพื่อเก็บชื่อไฟล์ไม่ให้ซ้ำ
                "_temp_sheets": set(), # ใช้ Set ชั่วคราวเพื่อเก็บชื่อชีทไม่ให้ซ้ำ
                "r_row": 0,
                "w_row": 0,
                "error_row":0,
                "value": []            # เตรียม Array ว่างไว้เก็บไฟล์
            }
            
        # 2. นำตัวเลขของแถวปัจจุบัน ไปบวกสะสมเข้ากับโครงสร้างของ v_id นั้นๆ
        grouped_data[v_id]["_temp_files"].add(row.file_name)
        grouped_data[v_id]["_temp_sheets"].add(row.sheet)
        grouped_data[v_id]["r_row"] += (row.r_row or 0)
        grouped_data[v_id]["w_row"] += (row.w_row or 0)
        grouped_data[v_id]["error_row"] += ((row.r_row or 0)-(row.w_row or 0))

        # 3. เอาข้อมูล Detail ไปต่อท้ายใน Array 'value'
        grouped_data[v_id]["value"].append({
            "index":row.id,
            "file_id":f"{row.id:05d}",
            "file_name": row.file_name,
            "sheet": row.sheet,
            "r_row": row.r_row,
            "w_row": row.w_row,
            "remark":row.description,
            "status": row.status
        })
        
    # 4. แปลงข้อมูลชั่วคราวให้เป็นผลสรุปตามที่คุณต้องการ
    for v_id, data in grouped_data.items():
        # แปลง Set เป็นจำนวนนับ (และลบตัวแปรชั่วคราวทิ้งด้วย .pop())
        data["file_name"] = len(data.pop("_temp_files"))
        data["sheet"] = len(data.pop("_temp_sheets"))
        
    return grouped_data

def get_file_import_in_detail(db: Session,Version_id:int=0) -> Dict[str, Any]:
        info_record = (
            db.query(
                MFileMaster.id,
                MFileMaster.v_id,
                MFileMaster.file_name,
                MFileMaster.sheet,
                MFileMaster.r_row,
                MFileMaster.w_row,
                MFileMaster.status,
                MFileMaster.description,
                MFileMaster.date_create,
                MaUser.username,
                Minformationimport.description.label("Remark")
            )
            .join(Minformationimport, MFileMaster.v_id == Minformationimport.id)
            .join(MaUser, MFileMaster.user_create == MaUser.user_id)
            .distinct() # ใช้ .is_(True) ตามมาตรฐาน
            
        )
        
        if not Version_id == 0:
            info_record.filter(Minformationimport.v_id == Version_id)
        
        # 2. ตรวจสอบผลลัพธ์
        if not info_record:
            return {
            "success": False,
            "message": "No data",
            "data":[]
        }
        
        # 3. จัดรูปแบบข้อมูลเตรียมส่งกลับ
        formatted_data = format_file_master_data(info_record.all())
        
        # 4. คืนค่าตามโครงสร้างเดิมที่คุณต้องการ
        return {
            "success": True,
            "message": "get data successful",
            "data":formatted_data
        }