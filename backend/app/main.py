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

        # Create default admin if none exists
        admin_user = db.query(User).filter(User.is_admin == True).first()
        if not admin_user:
            admin_user = db.query(User).filter(User.email == "admin@admin.com").first()
            if not admin_user:
                admin_user = User(
                    email="admin@admin.com",
                    username="admin",
                    password_hash=hash_password("admin123"),
                    is_admin=True,
                    is_active=True,
                    email_verified=True,
                )
                db.add(admin_user)
                logger.info("Default admin user created: admin@admin.com / admin123")

        db.commit()
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "NeoAstro API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
