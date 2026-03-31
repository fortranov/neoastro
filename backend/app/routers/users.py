from fastapi import APIRouter, Depends
from ..models import User
from ..schemas import APIResponse
from ..auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/profile", response_model=APIResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return APIResponse(data={
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "is_active": current_user.is_active,
        "is_blocked": current_user.is_blocked,
        "is_admin": current_user.is_admin,
        "plan_type": current_user.plan_type,
        "email_verified": current_user.email_verified,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    })
