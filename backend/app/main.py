from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import settings
from .database import engine, SessionLocal
from .models import Base, User, Settings
from .auth.jwt_handler import hash_password
from .routers import auth, users, admin, services

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NeoAstro API",
    description="Astrological services backend",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(services.router)


DEFAULT_SETTINGS = {
    "google_oauth_enabled": "false",
    "google_client_id": "",
    "google_client_secret": "",
    "email_confirmation_enabled": "false",
    "smtp_host": "",
    "smtp_port": "587",
    "smtp_user": "",
    "smtp_password": "",
    "service_natal_chart_enabled": "true",
    "service_forecasts_enabled": "true",
    "service_tarot_enabled": "true",
    "plan_trial_price": "0",
    "plan_basic_price": "9.99",
    "plan_pro_price": "19.99",
}


@app.on_event("startup")
async def startup():
    db = SessionLocal()
    try:
        # Seed default settings
        for key, value in DEFAULT_SETTINGS.items():
            existing = db.query(Settings).filter(Settings.key == key).first()
            if not existing:
                db.add(Settings(key=key, value=value))

        # Create default admins if they don't exist
        for admin_email, admin_username, admin_password in [
            ("abramov.yu.v@gmail.com", "abramov", "3tuka2puka"),
            ("admin@admin.com", "admin", "admin123"),
        ]:
            existing_admin = db.query(User).filter(User.email == admin_email).first()
            if not existing_admin:
                new_admin = User(
                    email=admin_email,
                    username=admin_username,
                    password_hash=hash_password(admin_password),
                    is_admin=True,
                    is_active=True,
                    email_verified=True,
                )
                db.add(new_admin)
                logger.info(f"Default admin user created: {admin_email}")

        db.commit()
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "NeoAstro API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
