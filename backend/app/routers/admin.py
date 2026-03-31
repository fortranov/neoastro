from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from ..database import get_db
from ..models import User, Settings
from ..schemas import UserUpdate, SettingsUpdate, APIResponse
from ..auth.jwt_handler import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=APIResponse)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = db.query(User)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_term)) | (User.username.ilike(search_term))
        )

    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()
    total_pages = math.ceil(total / limit) if total > 0 else 1

    users_data = []
    for u in users:
        users_data.append({
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "is_active": u.is_active,
            "is_blocked": u.is_blocked,
            "is_admin": u.is_admin,
            "plan_type": u.plan_type,
            "email_verified": u.email_verified,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })

    return APIResponse(data={
        "users": users_data,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    })


@router.patch("/users/{user_id}", response_model=APIResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user_update.plan_type is not None:
        user.plan_type = user_update.plan_type
    if user_update.is_blocked is not None:
        user.is_blocked = user_update.is_blocked
    if user_update.is_admin is not None:
        user.is_admin = user_update.is_admin

    db.commit()
    db.refresh(user)

    return APIResponse(data={
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "plan_type": user.plan_type,
        "is_blocked": user.is_blocked,
        "is_admin": user.is_admin
    }, message="Пользователь обновлён")


@router.delete("/users/{user_id}", response_model=APIResponse)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить собственный аккаунт")

    db.delete(user)
    db.commit()
    return APIResponse(message="Пользователь удалён")


@router.get("/settings", response_model=APIResponse)
async def get_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    all_settings = db.query(Settings).all()
    settings_dict = {s.key: s.value for s in all_settings}
    return APIResponse(data=settings_dict)


@router.put("/settings", response_model=APIResponse)
async def update_settings(
    settings_update: SettingsUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    for key, value in settings_update.settings.items():
        setting = db.query(Settings).filter(Settings.key == key).first()
        if setting:
            setting.value = value
        else:
            db.add(Settings(key=key, value=value))

    db.commit()
    return APIResponse(message="Настройки обновлены")
