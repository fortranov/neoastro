from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Optional
import httpx
import logging

from ..database import get_db
from ..models import User, Settings
from ..schemas import UserRegister, UserLogin, Token, APIResponse
from ..auth.jwt_handler import (
    hash_password, verify_password, create_access_token,
    create_email_verification_token, verify_email_token,
    get_current_user
)
from ..auth.email_handler import send_verification_email
from ..config import settings as app_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_setting(db: Session, key: str, default: str = "") -> str:
    s = db.query(Settings).filter(Settings.key == key).first()
    return s.value if s else default


@router.post("/register", response_model=APIResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check existing
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    email_confirmation_enabled = get_setting(db, "email_confirmation_enabled", "false") == "true"

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        email_verified=not email_confirmation_enabled
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    message = "Регистрация успешна"
    if email_confirmation_enabled:
        token = create_email_verification_token(user_data.email)
        send_verification_email(user_data.email, token)
        message = "Регистрация успешна. Проверьте вашу почту для подтверждения email."

    return APIResponse(
        data={"id": new_user.id, "email": new_user.email, "username": new_user.username},
        message=message
    )


@router.post("/login", response_model=APIResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Аккаунт заблокирован")

    email_confirmation_enabled = get_setting(db, "email_confirmation_enabled", "false") == "true"
    if email_confirmation_enabled and not user.email_verified:
        raise HTTPException(status_code=403, detail="Подтвердите ваш email перед входом")

    token = create_access_token({"sub": str(user.id)})
    return APIResponse(
        data={"access_token": token, "token_type": "bearer", "is_admin": user.is_admin},
        message="Вход выполнен успешно"
    )


@router.get("/google")
async def google_login(db: Session = Depends(get_db)):
    google_enabled = get_setting(db, "google_oauth_enabled", "false") == "true"
    if not google_enabled:
        raise HTTPException(status_code=400, detail="Google OAuth не включён")

    client_id = get_setting(db, "google_client_id") or app_settings.GOOGLE_CLIENT_ID
    if not client_id:
        raise HTTPException(status_code=400, detail="Google Client ID не настроен")

    redirect_uri = app_settings.GOOGLE_REDIRECT_URI
    scope = "openid email profile"
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&access_type=offline"
    )
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    client_id = get_setting(db, "google_client_id") or app_settings.GOOGLE_CLIENT_ID
    client_secret = get_setting(db, "google_client_secret") or app_settings.GOOGLE_CLIENT_SECRET

    if not client_id or not client_secret:
        raise HTTPException(status_code=400, detail="Google OAuth не настроен")

    # Exchange code for token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": app_settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Ошибка авторизации через Google")

        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        # Get user info
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        userinfo = userinfo_resp.json()

    google_id = userinfo.get("sub")
    email = userinfo.get("email")
    name = userinfo.get("name", email.split("@")[0])

    # Find or create user
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
            user.email_verified = True
        else:
            # Create unique username
            base_username = name.replace(" ", "_").lower()[:20]
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                email=email,
                username=username,
                google_id=google_id,
                email_verified=True
            )
            db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token({"sub": str(user.id)})
    frontend_url = app_settings.FRONTEND_URL
    return RedirectResponse(f"{frontend_url}/auth/callback?token={jwt_token}")


@router.post("/verify-email", response_model=APIResponse)
async def verify_email(token: str, db: Session = Depends(get_db)):
    email = verify_email_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Недействительный или истёкший токен")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.email_verified = True
    db.commit()
    return APIResponse(message="Email успешно подтверждён")


@router.get("/me", response_model=APIResponse)
async def get_me(current_user: User = Depends(get_current_user)):
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


@router.get("/settings-public", response_model=APIResponse)
async def get_public_settings(db: Session = Depends(get_db)):
    """Public settings for frontend (no auth required)."""
    google_enabled = get_setting(db, "google_oauth_enabled", "false") == "true"
    email_confirmation = get_setting(db, "email_confirmation_enabled", "false") == "true"
    return APIResponse(data={
        "google_oauth_enabled": google_enabled,
        "email_confirmation_enabled": email_confirmation
    })
