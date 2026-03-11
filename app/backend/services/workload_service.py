import pandas as pd
from app.backend.schemas.all_schemas import requserassign
from sqlalchemy.orm import Session
from app.backend.models.postgres._base_on import MPromotionHeader,MFileMaster,MPromotionBucketEntity
from sqlalchemy import func
from typing import Dict, List, Any
from collections import defaultdict

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

def get_workload_data(db: Session,Version:int =0):
    info_record = (
        db.query(
            MFileMaster.file_name,
            MFileMaster.sheet,
            MFileMaster.id,
            MPromotionHeader.start_date,
            func.count(MPromotionBucketEntity.entity_code).label("entcount") 
        )
        .join(MPromotionHeader, MFileMaster.id == MPromotionHeader.file_id)
        .join(MPromotionBucketEntity, MPromotionHeader.id == MPromotionBucketEntity.pro_id) 
        .filter(MPromotionHeader.user_assign.is_(None))
        .filter(MFileMaster.v_id != Version if Version == 0 else MFileMaster.v_id == Version)
        .group_by(
            MFileMaster.file_name,
            MFileMaster.sheet,
            MFileMaster.id,
            MPromotionHeader.start_date
        )
        .all()
    )
    
    if not info_record:
        return []
        
    return [
        {
            "WORKSHEET": row.file_name,
            "SHEET": row.sheet,
            "START_DATE": str(row.start_date), # ป้องกัน Error การส่ง Date ผ่าน JSON
            "VALUE": row.entcount,
            "sheet_id":row.id,
            "ASSIGNED_TO": None # ค่าเริ่มต้นเมื่อยังไม่ Assign
        }
        for row in info_record
    ]

class WorkloadDistributor:
    def __init__(self, data):
        """
        Initialize ด้วยข้อมูลในรูปแบบ List of Dictionaries
        """
        self.raw_data = pd.DataFrame(data)
        self.distributed_df = None

    def distribute_strict_balance(self, user_ids:requserassign|None =None):
        """
        user_ids: List ของ ID ผู้ใช้งาน เช่น [1, 2, 3] หรือ ['1', '2', '3']
        """
        if not user_ids :
            return [], 0, {}
        elif not user_ids.id:
            return [], 0, {}

        sorted_df = self.raw_data.sort_values(by='VALUE', ascending=False).reset_index(drop=True)
        
        bins = [[] for _ in range(len(user_ids.id))]
        bin_sums = [0] * len(user_ids.id)
        
        for _, row in sorted_df.iterrows():
            min_idx = bin_sums.index(min(bin_sums))
            item = row.to_dict()
            item['ASSIGNED_TO'] = str(user_ids.id[min_idx]) 
            
            bins[min_idx].append(item)
            bin_sums[min_idx] += item['VALUE']
            
        flat_list = [item for sublist in bins for item in sublist]
        self.distributed_df = pd.DataFrame(flat_list)
        diff = max(bin_sums) - min(bin_sums)
        summary = {str(user_ids.id[i]): bin_sums[i] for i in range(len(user_ids.id))}
        
        return flat_list, diff, summary

    def get_json_data(self):
        """ สำหรับส่งออกข้อมูลไปใช้ใน React / Electron """
        if self.distributed_df is not None:
            return self.distributed_df.to_dict(orient='records')
        return []