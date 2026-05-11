from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from ..database.common.connet_database_postgres import get_db
from ..auth.security   import get_current_user
from ..database.models.postgres_models import MaUser, MVersionControl
from ..version.all_schemas  import VersionCreate, VersionUpdate, VersionResponse

router = APIRouter(prefix="/versions", tags=["Version Control"])

@router.get("/", response_model=List[VersionResponse])
def get_versions(skip: int = 0, 
                limit: int = 100,
                db: Session = Depends(get_db)):
    stmt = select(MVersionControl).offset(skip).limit(limit)
    return db.scalars(stmt).all()   


@router.post("/", response_model=VersionResponse)
def create_version(data: VersionCreate, 
                   current_user: MaUser = Depends(get_current_user), 
                   db: Session = Depends(get_db)):
    new_version = MVersionControl(
        **data.dict(),
        status=1,
        user_create=current_user.user_id,
        user_update=current_user.user_id
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return new_version


@router.put("/{version_id}")
def update_version(version_id: int, 
                   data: VersionUpdate,
                    current_user: MaUser = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    ver = db.get(MVersionControl, version_id)
    if not ver: raise HTTPException(404, "Version not found")
    
    if data.title: ver.title = data.title
    if data.status: ver.status = data.status
    if data.detail: ver.detail = data.detail
    ver.user_update = current_user.user_id
    db.commit()
    return {"message": "Updated successfully"}
