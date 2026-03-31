# NeoAstro

Полнофункциональный астрологический сервис с натальными картами, прогнозами и раскладами Таро.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLite (SQLAlchemy), Python 3.11+
- **Auth**: JWT + Google OAuth (опционально)

## Быстрый старт

### Backend

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или: venv\Scripts\activate  # Windows

# Установить зависимости
pip install -r requirements.txt

# Настроить окружение
cp .env.example .env
# Отредактируйте .env при необходимости

# Запустить сервер
uvicorn app.main:app --reload --port 8000
```

Backend будет доступен на http://localhost:8000
API документация: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Настроить окружение
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Запустить dev сервер
npm run dev
```

Frontend будет доступен на http://localhost:3000

## Учётная запись администратора по умолчанию

При первом запуске автоматически создаётся администратор:

- **Email**: admin@admin.com
- **Пароль**: admin123

> **ВАЖНО**: Смените пароль администратора сразу после первого входа!

## Структура проекта

```
astro/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, startup
│   │   ├── config.py        # Настройки (pydantic-settings)
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # User, Settings models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth/
│   │   │   ├── jwt_handler.py   # JWT + password hashing
│   │   │   └── email_handler.py # SMTP email
│   │   └── routers/
│   │       ├── auth.py      # /api/auth/*
│   │       ├── users.py     # /api/users/*
│   │       ├── admin.py     # /api/admin/*
│   │       └── services.py  # /api/services/*
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/             # Next.js App Router pages
    │   ├── components/      # UI, layout, service components
    │   ├── lib/             # API client, utils
    │   └── contexts/        # AuthContext
    ├── package.json
    └── .env.example
```

## Тарифные планы

| Сервис              | Пробный | Базовый | Про |
|---------------------|---------|---------|-----|
| Натальная карта     | ✓       | ✓       | ✓   |
| Прогнозы            | ✗       | ✓       | ✓   |
| Расклады Таро       | ✗       | ✗       | ✓   |

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` — регистрация
- `POST /login` — вход (возвращает JWT)
- `GET /me` — текущий пользователь
- `GET /google` — редирект на Google OAuth
- `GET /google/callback` — обработка OAuth callback
- `POST /verify-email?token=` — верификация email
- `GET /settings-public` — публичные настройки

### Users (`/api/users`)
- `GET /profile` — профиль (auth required)

### Admin (`/api/admin`)
- `GET /users` — список пользователей (paginated)
- `PATCH /users/{id}` — обновить пользователя
- `DELETE /users/{id}` — удалить пользователя
- `GET /settings` — настройки
- `PUT /settings` — обновить настройки

### Services (`/api/services`)
- `POST /natal-chart` — расчёт натальной карты
- `POST /forecast` — получить прогноз
- `POST /tarot` — расклад Таро

## Настройки Google OAuth

1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Настройте OAuth 2.0 credentials
3. Добавьте redirect URI: `http://localhost:8000/api/auth/google/callback`
4. В панели администратора включите Google OAuth и введите Client ID и Secret

## Настройки Email (SMTP)

Для отправки писем верификации настройте SMTP в панели администратора:
- Host, Port, User, Password
- Включите "Требовать подтверждение email"

## Астрологические расчёты

Бэкенд использует библиотеку `ephem` для точных астрономических расчётов.
Если `ephem` недоступен, автоматически используется упрощённый алгоритм на основе средних долгот планет.

## Колода Таро

Включена полная колода из 78 карт:
- 22 карты Старшего Аркана
- 56 карт Младшего Аркана (4 масти по 14 карт)

Все карты с русскими названиями и значениями.
