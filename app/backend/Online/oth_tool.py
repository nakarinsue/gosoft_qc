from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
# สมมติว่าคุณมีฟังก์ชัน get_db สำหรับเรียก Database Session

from ..database.common.connet_database_postgres import get_db
from .schemas import CounterResponse,CounterUpdate,CounterCreate,CountergetResponse
from ..database.models.postgres_models import Counter,CounterColumn
router = APIRouter(prefix="/option")
from typing import List

@router.get("", response_model=List[CountergetResponse])
def get_counter( db: Session = Depends(get_db)):
    # ใช้ selectinload เพื่อดึงข้อมูลความสัมพันธ์แบบ One-to-Many มาพร้อมกัน (ลดปัญหา N+1 Query)
    stmt = select(Counter)
    db_counter = db.scalars(stmt).all()
    
    if not db_counter:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูล Counter ที่ระบุ")
        
    return db_counter

@router.put("/{counter_id}", response_model=CounterResponse)
def update_counter(counter_id: int, counter_data: CounterUpdate, db: Session = Depends(get_db)):
    # ดึงข้อมูลเดิมออกมาก่อน
    stmt = select(Counter).options(selectinload(Counter.valuecounter)).where(Counter.id == counter_id)
    db_counter = db.scalars(stmt).first()
    
    if not db_counter:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูล Counter ที่ต้องการแก้ไข")
    
    # อัปเดตข้อมูลตารางหลัก (Counter)
    update_dict = counter_data.model_dump(exclude={"valuecounter"})
    for key, value in update_dict.items():
        setattr(db_counter, key, value)
      
    db_counter.valuecounter.clear()
    for col in counter_data.valuecounter:
        new_column = CounterColumn(column_name=col.column_name)
        db_counter.valuecounter.append(new_column)
        
    db.commit()
    db.refresh(db_counter)
    
    return db_counter




@router.post("/", response_model=CounterResponse)
def create_counter(counter_data: CounterCreate, db: Session = Depends(get_db)):
    print(counter_data.model_dump(exclude={"valuecounter"}))
    create_dict = counter_data.model_dump(exclude={"valuecounter"})
    new_counter = Counter(**create_dict)
    for col in counter_data.valuecounter:
        new_column = CounterColumn(column_name=col.column_name)
        new_counter.valuecounter.append(new_column)
        
    db.add(new_counter)
    db.commit()
    
    db.refresh(new_counter)
    
    return new_counter




@router.delete("/{counter_id}")
def delete_counter(counter_id: int, db: Session = Depends(get_db)):
    stmt = select(Counter).where(Counter.id == counter_id)
    db_counter = db.scalars(stmt).first()
    
    if not db_counter:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูล Counter ที่ต้องการลบ")
        
    # ลบแค่ตัวแม่ ตัวลูกจะหายไปด้วยเพราะตั้ง cascade="all, delete-orphan" ไว้ใน Model
    db.delete(db_counter)
    db.commit()
    
    return {"status": "success", "message": f"ลบข้อมูล Counter ID {counter_id} และคอลัมน์ที่เกี่ยวข้องเรียบร้อยแล้ว"}