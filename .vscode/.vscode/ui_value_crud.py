from sqlalchemy.orm import Session
import app.backend.database.models.postgres_models as  models
import app.backend.schemas.version_ui as schemas
def get_ui_value(db: Session, value_id: int):
    return db.query(models.UIValue).filter(models.UIValue.id == value_id).first()

def get_ui_values(db: Session, skip: int = 0, limit: int = 100, group_name: str |None= None):
    query = db.query(models.UIValue)
    if group_name:
        query = query.filter(models.UIValue.group_name == group_name)
    return query.order_by(models.UIValue.group_name, models.UIValue.order_index).offset(skip).limit(limit).all()

def create_ui_value(db: Session, value: schemas.UIValueCreate):
    db_value = models.UIValue(**value.dict())
    db.add(db_value)
    db.commit()
    db.refresh(db_value)
    return db_value

def update_ui_value(db: Session, value_id: int, value_data: schemas.UIValueUpdate):
    db_value = get_ui_value(db, value_id)
    if not db_value:
        return None
    
    update_data = value_data.dict(exclude_unset=True) # อัปเดตเฉพาะฟิลด์ที่ส่งมา
    for key, val in update_data.items():
        setattr(db_value, key, val)
        
    db.commit()
    db.refresh(db_value)
    return db_value

def delete_ui_value(db: Session, value_id: int):
    db_value = get_ui_value(db, value_id)
    if db_value:
        db.delete(db_value)
        db.commit()
        return True
    return False