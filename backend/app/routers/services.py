from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random
import math
from datetime import datetime, date

from ..database import get_db
from ..models import User, Settings, PlanType
from ..schemas import NatalChartRequest, ForecastRequest, TarotRequest, APIResponse
from ..auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api/services", tags=["services"])

# ---------------------------------------------------------------------------
# Tarot deck (78 cards)
# ---------------------------------------------------------------------------

MAJOR_ARCANA = [
    {"name": "Шут", "suit": "major", "number": 0,
     "meaning_upright": "Новые начинания, невинность, спонтанность, свободный дух",
     "meaning_reversed": "Безрассудство, риск, непродуманные действия, наивность"},
    {"name": "Маг", "suit": "major", "number": 1,
     "meaning_upright": "Воля, мастерство, умение использовать ресурсы, концентрация",
     "meaning_reversed": "Манипуляция, плохое планирование, нереализованный потенциал"},
    {"name": "Верховная Жрица", "suit": "major", "number": 2,
     "meaning_upright": "Интуиция, подсознание, внутренний голос, тайные знания",
     "meaning_reversed": "Скрытые мотивы, поверхностные знания, игнорирование интуиции"},
    {"name": "Императрица", "suit": "major", "number": 3,
     "meaning_upright": "Плодородие, красота, природа, изобилие, материнство",
     "meaning_reversed": "Творческий блок, зависимость, пустота, разбазаривание"},
    {"name": "Император", "suit": "major", "number": 4,
     "meaning_upright": "Власть, стабильность, структура, авторитет, защита",
     "meaning_reversed": "Тирания, жёсткость, негибкость, потеря контроля"},
    {"name": "Иерофант", "suit": "major", "number": 5,
     "meaning_upright": "Традиция, духовность, религия, наставник, соответствие",
     "meaning_reversed": "Бунт, нетрадиционность, новые методы, свобода от ограничений"},
    {"name": "Влюблённые", "suit": "major", "number": 6,
     "meaning_upright": "Любовь, гармония, выбор, ценности, союз",
     "meaning_reversed": "Дисгармония, несоответствие ценностей, неверный выбор"},
    {"name": "Колесница", "suit": "major", "number": 7,
     "meaning_upright": "Победа, воля, контроль, уверенность, дисциплина",
     "meaning_reversed": "Потеря контроля, агрессия, препятствия, нерешительность"},
    {"name": "Сила", "suit": "major", "number": 8,
     "meaning_upright": "Смелость, терпение, внутренняя сила, сострадание",
     "meaning_reversed": "Слабость, неуверенность, страх, отсутствие самодисциплины"},
    {"name": "Отшельник", "suit": "major", "number": 9,
     "meaning_upright": "Одиночество, поиск себя, внутренняя мудрость, размышления",
     "meaning_reversed": "Изоляция, одиночество, замкнутость, потеря пути"},
    {"name": "Колесо Фортуны", "suit": "major", "number": 10,
     "meaning_upright": "Удача, перемены, циклы, судьба, поворотный момент",
     "meaning_reversed": "Неудача, сопротивление переменам, разрыв цикла"},
    {"name": "Справедливость", "suit": "major", "number": 11,
     "meaning_upright": "Справедливость, правда, закон, причина и следствие, честность",
     "meaning_reversed": "Несправедливость, нечестность, уход от ответственности"},
    {"name": "Повешенный", "suit": "major", "number": 12,
     "meaning_upright": "Пауза, жертва, новая перспектива, отпускание",
     "meaning_reversed": "Промедление, сопротивление, бесполезные жертвы"},
    {"name": "Смерть", "suit": "major", "number": 13,
     "meaning_upright": "Конец, трансформация, переход, освобождение",
     "meaning_reversed": "Сопротивление переменам, неспособность отпустить, стагнация"},
    {"name": "Умеренность", "suit": "major", "number": 14,
     "meaning_upright": "Баланс, умеренность, терпение, гармония, исцеление",
     "meaning_reversed": "Дисбаланс, излишества, нетерпение, конфликт"},
    {"name": "Дьявол", "suit": "major", "number": 15,
     "meaning_upright": "Зависимость, материализм, теневое «я», ограничения",
     "meaning_reversed": "Освобождение, восстановление контроля, избавление от оков"},
    {"name": "Башня", "suit": "major", "number": 16,
     "meaning_upright": "Внезапные перемены, хаос, откровение, разрушение старого",
     "meaning_reversed": "Избегание катастроф, страх перемен, затянувшийся кризис"},
    {"name": "Звезда", "suit": "major", "number": 17,
     "meaning_upright": "Надежда, вдохновение, обновление, спокойствие, вера",
     "meaning_reversed": "Отчаяние, разочарование, неверие, потеря надежды"},
    {"name": "Луна", "suit": "major", "number": 18,
     "meaning_upright": "Иллюзии, страхи, подсознание, неопределённость, интуиция",
     "meaning_reversed": "Рассеивание иллюзий, страхи отступают, обретение ясности"},
    {"name": "Солнце", "suit": "major", "number": 19,
     "meaning_upright": "Радость, успех, позитивность, жизненная сила, ясность",
     "meaning_reversed": "Временные неудачи, чрезмерный оптимизм, задержки"},
    {"name": "Суд", "suit": "major", "number": 20,
     "meaning_upright": "Пробуждение, обновление, призыв, отпущение прошлого",
     "meaning_reversed": "Самосомнение, игнорирование призыва, страх перемен"},
    {"name": "Мир", "suit": "major", "number": 21,
     "meaning_upright": "Завершение, интеграция, целостность, достижение",
     "meaning_reversed": "Незавершённость, пустые победы, отсутствие закрытия"},
]

SUIT_MEANINGS = {
    "wands": {
        "suit_ru": "Жезлы",
        "element": "Огонь",
        "theme": "страсть, амбиции, творчество, карьера"
    },
    "cups": {
        "suit_ru": "Кубки",
        "element": "Вода",
        "theme": "эмоции, отношения, интуиция, любовь"
    },
    "swords": {
        "suit_ru": "Мечи",
        "element": "Воздух",
        "theme": "разум, конфликты, истина, общение"
    },
    "pentacles": {
        "suit_ru": "Пентакли",
        "element": "Земля",
        "theme": "деньги, работа, материальный мир, здоровье"
    }
}

MINOR_RANKS = [
    ("Туз", 1, "Новое начало, чистая сила стихии, потенциал",
     "Заблокированный потенциал, ложный старт"),
    ("Двойка", 2, "Баланс, партнёрство, выбор, решение",
     "Несогласие, потеря баланса, промедление"),
    ("Тройка", 3, "Рост, творчество, сотрудничество, экспансия",
     "Разрыв, потеря фокуса, задержки"),
    ("Четвёрка", 4, "Стабильность, спокойствие, основа, отдых",
     "Скука, застой, нежелание двигаться вперёд"),
    ("Пятёрка", 5, "Конфликт, вызов, перемены, преодоление",
     "Разрешение конфликта, избежание потерь"),
    ("Шестёрка", 6, "Гармония, помощь, прогресс, возврат",
     "Зависимость, задержка, отсутствие признания"),
    ("Семёрка", 7, "Испытание, оценка, мистика, стратегия",
     "Тревога, нечестность, уход от вызова"),
    ("Восьмёрка", 8, "Движение, перемены, скорость, мастерство",
     "Препятствия, замедление, повторение"),
    ("Девятка", 9, "Завершение, накопление, почти у цели",
     "Разочарование, отказ на пороге успеха"),
    ("Десятка", 10, "Конец цикла, перегрузка, наследие",
     "Тяжёлый груз, потеря, цикл замкнулся"),
    ("Паж", 11, "Ученичество, любопытство, вестник, возможности",
     "Незрелость, плохие новости, несфокусированность"),
    ("Рыцарь", 12, "Действие, авантюра, движение, импульс",
     "Импульсивность, безрассудство, медлительность"),
    ("Королева", 13, "Зрелость, мастерство элемента, мудрость, забота",
     "Эмоциональная нестабильность, ревность, зависимость"),
    ("Король", 14, "Власть, контроль, мастерство, лидерство",
     "Злоупотребление властью, жёсткость, бесконтрольность"),
]


def build_tarot_deck():
    deck = list(MAJOR_ARCANA)
    for suit_key, suit_info in SUIT_MEANINGS.items():
        for rank_name, rank_num, upright, reversed_ in MINOR_RANKS:
            deck.append({
                "name": f"{rank_name} {suit_info['suit_ru']}",
                "suit": suit_key,
                "number": rank_num,
                "meaning_upright": f"{upright}. Стихия: {suit_info['element']} ({suit_info['theme']})",
                "meaning_reversed": f"{reversed_}. Стихия: {suit_info['element']}"
            })
    return deck


TAROT_DECK = build_tarot_deck()

# ---------------------------------------------------------------------------
# Zodiac helpers
# ---------------------------------------------------------------------------

ZODIAC_SIGNS = [
    ("Козерог", 270), ("Водолей", 300), ("Рыбы", 330),
    ("Овен", 0), ("Телец", 30), ("Близнецы", 60),
    ("Рак", 90), ("Лев", 120), ("Дева", 150),
    ("Весы", 180), ("Скорпион", 210), ("Стрелец", 240),
]

ZODIAC_BY_DATE = [
    (date(2000, 3, 21), date(2000, 4, 19), "Овен"),
    (date(2000, 4, 20), date(2000, 5, 20), "Телец"),
    (date(2000, 5, 21), date(2000, 6, 20), "Близнецы"),
    (date(2000, 6, 21), date(2000, 7, 22), "Рак"),
    (date(2000, 7, 23), date(2000, 8, 22), "Лев"),
    (date(2000, 8, 23), date(2000, 9, 22), "Дева"),
    (date(2000, 9, 23), date(2000, 10, 22), "Весы"),
    (date(2000, 10, 23), date(2000, 11, 21), "Скорпион"),
    (date(2000, 11, 22), date(2000, 12, 21), "Стрелец"),
    (date(2000, 12, 22), date(2001, 1, 19), "Козерог"),
    (date(2000, 1, 20), date(2000, 2, 18), "Водолей"),
    (date(2000, 2, 19), date(2000, 3, 20), "Рыбы"),
]


def get_zodiac_sign(birth_date: str) -> str:
    try:
        dt = datetime.strptime(birth_date, "%Y-%m-%d")
        month, day = dt.month, dt.day
        # (month, day) ranges
        ranges = [
            ((3, 21), (4, 19), "Овен"),
            ((4, 20), (5, 20), "Телец"),
            ((5, 21), (6, 20), "Близнецы"),
            ((6, 21), (7, 22), "Рак"),
            ((7, 23), (8, 22), "Лев"),
            ((8, 23), (9, 22), "Дева"),
            ((9, 23), (10, 22), "Весы"),
            ((10, 23), (11, 21), "Скорпион"),
            ((11, 22), (12, 21), "Стрелец"),
            ((12, 22), (12, 31), "Козерог"),
            ((1, 1), (1, 19), "Козерог"),
            ((1, 20), (2, 18), "Водолей"),
            ((2, 19), (3, 20), "Рыбы"),
        ]
        for (sm, sd), (em, ed), sign in ranges:
            if (month == sm and day >= sd) or (month == em and day <= ed):
                return sign
        return "Козерог"
    except Exception:
        return "Неизвестно"


def degrees_to_zodiac(degrees: float) -> tuple[str, float]:
    """Convert ecliptic longitude to zodiac sign and degree within sign."""
    deg = degrees % 360
    signs = ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
             "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"]
    idx = int(deg / 30)
    sign_deg = deg % 30
    return signs[idx], round(sign_deg, 2)


# ---------------------------------------------------------------------------
# Natal chart calculation (using ephem if available, fallback to simplified)
# ---------------------------------------------------------------------------

def calculate_natal_chart_ephem(request: NatalChartRequest) -> dict:
    import ephem
    observer = ephem.Observer()
    observer.lat = str(request.latitude)
    observer.lon = str(request.longitude)
    observer.date = f"{request.birth_date} {request.birth_time}:00"

    planets_map = {
        "Солнце": ephem.Sun(),
        "Луна": ephem.Moon(),
        "Меркурий": ephem.Mercury(),
        "Венера": ephem.Venus(),
        "Марс": ephem.Mars(),
        "Юпитер": ephem.Jupiter(),
        "Сатурн": ephem.Saturn(),
        "Уран": ephem.Uranus(),
        "Нептун": ephem.Neptune(),
        "Плутон": ephem.Pluto(),
    }

    planets_data = {}
    for name, planet in planets_map.items():
        planet.compute(observer)
        ecl = ephem.Ecliptic(planet, epoch=observer.date)
        lon_deg = math.degrees(ecl.lon)
        sign, deg = degrees_to_zodiac(lon_deg)
        planets_data[name] = {
            "sign": sign,
            "degree": deg,
            "longitude": round(lon_deg, 4)
        }

    # Whole sign houses based on ascendant
    # Calculate ascendant
    try:
        ecl_asc = ephem.Ecliptic(ephem.Sun(), epoch=observer.date)
        # Simple LST-based ascendant approximation
        lst = float(observer.sidereal_time())
        asc_deg = math.degrees(lst) % 360
    except Exception:
        asc_deg = 0.0

    asc_sign, asc_deg_in_sign = degrees_to_zodiac(asc_deg)
    signs_order = ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
                   "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"]
    asc_idx = signs_order.index(asc_sign) if asc_sign in signs_order else 0

    houses = {}
    for i in range(1, 13):
        house_sign = signs_order[(asc_idx + i - 1) % 12]
        houses[f"Дом {i}"] = house_sign

    # Calculate major aspects between planets
    planet_lons = {name: d["longitude"] for name, d in planets_data.items()}
    aspects = []
    aspect_types = [
        (0, 10, "Соединение"),
        (60, 8, "Секстиль"),
        (90, 8, "Квадрат"),
        (120, 8, "Трин"),
        (180, 10, "Оппозиция"),
    ]
    planet_names = list(planet_lons.keys())
    for i in range(len(planet_names)):
        for j in range(i + 1, len(planet_names)):
            p1, p2 = planet_names[i], planet_names[j]
            diff = abs(planet_lons[p1] - planet_lons[p2]) % 360
            if diff > 180:
                diff = 360 - diff
            for angle, orb, aspect_name in aspect_types:
                if abs(diff - angle) <= orb:
                    aspects.append({
                        "planet1": p1,
                        "planet2": p2,
                        "aspect": aspect_name,
                        "orb": round(abs(diff - angle), 2)
                    })

    return {
        "name": request.name,
        "birth_date": request.birth_date,
        "birth_time": request.birth_time,
        "birth_place": request.birth_place,
        "ascendant": {"sign": asc_sign, "degree": round(asc_deg_in_sign, 2)},
        "planets": planets_data,
        "houses": houses,
        "aspects": aspects
    }


def calculate_natal_chart_simple(request: NatalChartRequest) -> dict:
    """Simplified natal chart without ephem."""
    try:
        dt = datetime.strptime(f"{request.birth_date} {request.birth_time}", "%Y-%m-%d %H:%M")
    except ValueError:
        dt = datetime.strptime(request.birth_date, "%Y-%m-%d")

    # Julian Day Number approximation
    y, m, d = dt.year, dt.month, dt.day
    h = dt.hour + dt.minute / 60.0
    jd = (367 * y - int(7 * (y + int((m + 9) / 12)) / 4) +
          int(275 * m / 9) + d + 1721013.5 + h / 24.0)
    T = (jd - 2451545.0) / 36525.0  # Julian centuries from J2000

    # Approximate mean longitudes
    sun_L = (280.46646 + 36000.76983 * T) % 360
    moon_L = (218.3165 + 481267.8813 * T) % 360
    mercury_L = (252.2509 + 149472.6674 * T) % 360
    venus_L = (181.9798 + 58517.8156 * T) % 360
    mars_L = (355.4330 + 19140.2993 * T) % 360
    jupiter_L = (34.3515 + 3034.9057 * T) % 360
    saturn_L = (50.0774 + 1222.1138 * T) % 360
    uranus_L = (314.0550 + 428.4882 * T) % 360
    neptune_L = (304.3487 + 218.4862 * T) % 360
    pluto_L = (238.9508 + 145.1781 * T) % 360

    planets_raw = {
        "Солнце": sun_L, "Луна": moon_L, "Меркурий": mercury_L,
        "Венера": venus_L, "Марс": mars_L, "Юпитер": jupiter_L,
        "Сатурн": saturn_L, "Уран": uranus_L, "Нептун": neptune_L, "Плутон": pluto_L
    }

    planets_data = {}
    for name, lon in planets_raw.items():
        sign, deg = degrees_to_zodiac(lon)
        planets_data[name] = {"sign": sign, "degree": deg, "longitude": round(lon % 360, 4)}

    # Ascendant from LMST approximation
    lon_deg = request.longitude
    # Local sidereal time approx
    gmst = (100.4606184 + 36000.7700536 * T + 0.000387933 * T * T) % 360
    lmst = (gmst + lon_deg) % 360
    # Obliquity
    epsilon = 23.4393 - 0.013 * T
    # Ascendant
    epsilon_rad = math.radians(epsilon)
    lmst_rad = math.radians(lmst)
    lat_rad = math.radians(request.latitude)
    asc_rad = math.atan2(math.cos(lmst_rad),
                         -(math.sin(lmst_rad) * math.cos(epsilon_rad) +
                           math.tan(lat_rad) * math.sin(epsilon_rad)))
    asc_deg = (math.degrees(asc_rad) + 360) % 360
    asc_sign, asc_in_sign = degrees_to_zodiac(asc_deg)

    signs_order = ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
                   "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"]
    asc_idx = signs_order.index(asc_sign) if asc_sign in signs_order else 0
    houses = {f"Дом {i}": signs_order[(asc_idx + i - 1) % 12] for i in range(1, 13)}

    # Aspects
    aspects = []
    aspect_types = [(0, 10, "Соединение"), (60, 8, "Секстиль"),
                    (90, 8, "Квадрат"), (120, 8, "Трин"), (180, 10, "Оппозиция")]
    planet_names = list(planets_data.keys())
    for i in range(len(planet_names)):
        for j in range(i + 1, len(planet_names)):
            p1, p2 = planet_names[i], planet_names[j]
            diff = abs(planets_data[p1]["longitude"] - planets_data[p2]["longitude"]) % 360
            if diff > 180:
                diff = 360 - diff
            for angle, orb, aspect_name in aspect_types:
                if abs(diff - angle) <= orb:
                    aspects.append({
                        "planet1": p1, "planet2": p2,
                        "aspect": aspect_name, "orb": round(abs(diff - angle), 2)
                    })

    return {
        "name": request.name,
        "birth_date": request.birth_date,
        "birth_time": request.birth_time,
        "birth_place": request.birth_place,
        "ascendant": {"sign": asc_sign, "degree": round(asc_in_sign, 2)},
        "planets": planets_data,
        "houses": houses,
        "aspects": aspects
    }


# ---------------------------------------------------------------------------
# Forecast templates
# ---------------------------------------------------------------------------

FORECAST_TEMPLATES = {
    "Овен": {
        "daily": [
            "Сегодня звёзды дарят вам мощный заряд энергии, {name}. Марс, ваш правитель, активирует вашу внутреннюю силу. Действуйте решительно, но избегайте конфликтов в первой половине дня. Вечером возможна приятная встреча.",
            "Луна в вашем секторе партнёрства указывает на важные переговоры. Ваша прямолинейность сегодня будет оценена по достоинству. Финансовые дела складываются благоприятно — доверяйте своему первому импульсу.",
        ],
        "weekly": [
            "Эта неделя наполнена динамичной энергией для Овнов. В начале недели Меркурий поддерживает деловые переговоры и новые контакты. Середина недели может принести неожиданные финансовые возможности — будьте готовы к смелым шагам. К выходным энергия снижается, уделите время восстановлению.",
        ],
        "monthly": [
            "Этот месяц открывает новый цикл в вашей жизни, Овен. Солнце освещает путь к профессиональным достижениям — вас ждут признание и продвижение. Венера благоволит романтическим встречам в середине месяца. Завершение месяца требует внимания к здоровью и бытовым вопросам.",
        ],
    },
    "Телец": {
        "daily": [
            "Венера, ваш правитель, создаёт гармоничный фон для всего дня. Красота, искусство и приятные ощущения будут вашими спутниками. Финансовый интуиция обострена — доверяйте ей в денежных вопросах.",
            "Сегодня Луна активирует ваш сектор ценностей. Хороший день для планирования бюджета, изучения инвестиций или приятных покупок. В отношениях царит спокойствие и взаимопонимание.",
        ],
        "weekly": [
            "Стабильность — ключевое слово этой недели для Тельцов. Сатурн укрепляет ваши позиции в профессиональной сфере. Финансовые вопросы требуют внимания в середине недели — возможны как расходы, так и приятные поступления. Выходные идеальны для отдыха на природе.",
        ],
        "monthly": [
            "Месяц обещает быть плодотворным для Тельцов в материальном плане. Юпитер расширяет ваши горизонты в карьере, а Венера привлекает в жизнь красоту и гармонию. Середина месяца благоприятна для романтики. Завершите начатые проекты до новолуния.",
        ],
    },
    "Близнецы": {
        "daily": [
            "Меркурий, ваш правитель, летит на крыльях вдохновения сегодня. Общение, переписка и переговоры принесут отличные результаты. Ваш ум особенно остёр — используйте это для решения сложных задач.",
            "Сегодня звёзды благоволят путешествиям и новым знакомствам. Ваша природная гибкость поможет справиться с неожиданными ситуациями. В вечернее время возможны интересные интеллектуальные дискуссии.",
        ],
        "weekly": [
            "Неделя полна коммуникаций и интересных встреч для Близнецов. Меркурий активизирует все виды связей — деловых и личных. В середине недели возможна важная информация, которая изменит ваши планы. Будьте гибкими и открытыми к переменам.",
        ],
        "monthly": [
            "Этот месяц насыщен событиями и переменами для Близнецов. Марс придаёт энергию вашим коммуникативным способностям. Первая половина месяца идеальна для новых проектов и партнёрств. Луна в конце месяца призывает к глубокой рефлексии.",
        ],
    },
    "Рак": {
        "daily": [
            "Луна, ваш правитель, усиливает вашу интуицию сегодня. Доверяйте своему «шестому чувству» во всех делах. Домашняя обстановка требует внимания — уютный вечер в кругу близких принесёт радость.",
            "Сегодня ваши эмоции обострены, и это дар, а не бремя. Ваша эмпатия поможет в переговорах и разрешении конфликтов. Финансовый сектор стабилен — хороший день для сбережений.",
        ],
        "weekly": [
            "Неделя акцентирует домашние и семейные дела для Раков. Луна проходит через чувствительные точки вашей карты, усиливая эмоциональную сферу. В середине недели возможны важные разговоры с близкими. Профессиональная сфера требует терпения до конца недели.",
        ],
        "monthly": [
            "Месяц погружает Раков в глубины чувств и интуиции. Нептун усиливает творческие способности и духовные искания. Карьерный прорыв возможен в середине месяца при поддержке Юпитера. Берегите своё здоровье в конце месяца.",
        ],
    },
    "Лев": {
        "daily": [
            "Солнце, ваш правитель, ярко светит сегодня. Ваша харизма на пике — используйте это для публичных выступлений и важных презентаций. Творческие проекты получат мощный импульс. Позвольте себе блистать!",
            "Сегодня энергия Солнца наполняет вас уверенностью и магнетизмом. Романтические встречи обещают быть незабываемыми. В профессиональной сфере ваш авторитет растёт.",
        ],
        "weekly": [
            "Грандиозная неделя для Львов! Солнце освещает все ваши начинания. Первые дни идеальны для карьерных манёвров и демонстрации своих талантов. Любовная сфера расцветает к середине недели. Выходные принесут заслуженное признание.",
        ],
        "monthly": [
            "Этот месяц — ваше время блистать, Лев! Солнце в благоприятных аспектах открывает двери к успеху и признанию. Первая половина насыщена деловыми победами, вторая — романтическими переживаниями. Завершение месяца призывает к благодарности и щедрости.",
        ],
    },
    "Дева": {
        "daily": [
            "Меркурий направляет вашу аналитическую силу на решение практических задач. Сегодня идеальный день для планирования, систематизации и наведения порядка. Здоровье требует внимания — прислушайтесь к сигналам тела.",
            "Ваша природная точность сегодня особенно ценна. Рабочие проекты требующие детального анализа будут завершены с блеском. Вечером возможна встреча, которая изменит ваши взгляды.",
        ],
        "weekly": [
            "Продуктивная неделя для Дев во всех сферах. Меркурий ускоряет мыслительные процессы и коммуникации. Деловые переговоры в начале недели принесут плоды. Середина недели — время для заботы о здоровье. К выходным ситуация с финансами проясняется.",
        ],
        "monthly": [
            "Месяц ставит в центр внимания здоровье, работу и служение для Дев. Юпитер расширяет профессиональные возможности. В личной жизни возможны важные осознания и решения. Новолуние в середине месяца открывает новую страницу.",
        ],
    },
    "Весы": {
        "daily": [
            "Венера, ваш правитель, создаёт гармонию вокруг вас сегодня. Все переговоры и партнёрства находятся под счастливой звездой. Ваш дипломатический талант поможет разрешить давние конфликты.",
            "Сегодня баланс и справедливость — ваши ключевые темы. Важные решения принимайте взвешенно, учитывая все стороны. В творчестве и эстетике сегодня особый подъём.",
        ],
        "weekly": [
            "Неделя акцентирует партнёрства и отношения для Весов. Венера благоволит романтическим встречам в начале недели. Деловые партнёрства требуют пересмотра в середине. К выходным гармония восстановится.",
        ],
        "monthly": [
            "Месяц посвящён отношениям и поиску равновесия для Весов. Сатурн укрепляет долгосрочные союзы. Первая половина идеальна для переговоров и заключения договоров. Вторая половина — время творческого самовыражения.",
        ],
    },
    "Скорпион": {
        "daily": [
            "Плутон усиливает вашу проницательность до максимума сегодня. Вы видите суть вещей там, где другие видят лишь поверхность. Трансформация начинается изнутри — позвольте ей произойти.",
            "Сегодня энергия Марса наполняет вас страстью и решимостью. Финансовые операции требуют осторожности. В интимной сфере возможны глубокие переживания и открытия.",
        ],
        "weekly": [
            "Интенсивная неделя для Скорпионов. Плутон продолжает трансформировать глубинные пласты вашей жизни. В начале недели — важные финансовые решения. Середина — время психологических откровений. К выходным энергия достигает пика.",
        ],
        "monthly": [
            "Этот месяц несёт глубокое преобразование для Скорпионов. Плутон в трансформирующем аспекте открывает скрытые ресурсы. Финансовые партнёрства достигают решающей точки. Конец месяца — мощный катарсис и обновление.",
        ],
    },
    "Стрелец": {
        "daily": [
            "Юпитер, ваш правитель, расширяет горизонты сегодня. Путешествия, философские размышления и высшее образование находятся под счастливой звездой. Удача сопровождает вас весь день.",
            "Сегодня ваш оптимизм заразителен! Люди тянутся к вам за вдохновением. Отличный день для учёбы, преподавания или дальних поездок. Финансовая удача улыбается смелым.",
        ],
        "weekly": [
            "Вдохновляющая неделя для Стрельцов! Юпитер благоволит расширению во всех направлениях. В начале недели — возможности для роста в карьере. Середина идеальна для обучения. К выходным — приключения и новые открытия.",
        ],
        "monthly": [
            "Юпитер щедро одаривает Стрельцов в этот месяц. Возможности для роста и расширения появляются повсюду. Путешествия первой половины месяца принесут ценный опыт. Вторая половина — время духовного поиска.",
        ],
    },
    "Козерог": {
        "daily": [
            "Сатурн, ваш правитель, награждает терпение и труд сегодня. Ваша дисциплина привлекает внимание важных людей. Карьерные амбиции получают поддержку — делайте смелые шаги.",
            "Сегодня звёзды вознаграждают упорство. Долгосрочные проекты приближаются к завершению. В личной жизни возможно серьёзное решение, которое откроет новую главу.",
        ],
        "weekly": [
            "Неделя акцентирует профессиональные достижения для Козерогов. Сатурн в благоприятном аспекте поддерживает карьерный рост. Начало недели — время для важных деловых решений. Конец недели принесёт заслуженное признание.",
        ],
        "monthly": [
            "Месяц карьерных завоеваний для Козерогов. Сатурн укрепляет вашу профессиональную репутацию. Первая половина идеальна для новых деловых начинаний. В середине — важные решения в личной жизни. Завершение месяца — подведение итогов.",
        ],
    },
    "Водолей": {
        "daily": [
            "Уран, ваш правитель, приносит неожиданные открытия сегодня. Ваша оригинальность мышления решает задачи, которые поставили в тупик других. Технологии и инновации находятся под счастливой звездой.",
            "Сегодня день новаторских идей и социальных связей. Ваши друзья и единомышленники сыграют важную роль. Неожиданное событие изменит ваши планы — примите его с открытым сердцем.",
        ],
        "weekly": [
            "Революционная неделя для Водолеев! Уран активизирует вашу уникальность. В начале недели — прорывные идеи в профессиональной сфере. Середина — время для социальных проектов. К выходным — неожиданный поворот событий.",
        ],
        "monthly": [
            "Месяц инноваций и социальных преобразований для Водолеев. Уран ускоряет события, приближая вас к будущему. Первая половина идеальна для технологических проектов. Вторая — для гуманитарных инициатив.",
        ],
    },
    "Рыбы": {
        "daily": [
            "Нептун, ваш правитель, окутывает день мистическим флёром. Ваша интуиция говорит громче обычного — доверяйте ей. Творческое вдохновение достигает пика. Медитация утром установит благоприятный тон.",
            "Сегодня границы между мирами истончаются. Сны и знаки несут важные послания. Творческие и духовные практики приносят глубокое удовлетворение. Берегите своё энергетическое поле.",
        ],
        "weekly": [
            "Мистическая неделя для Рыб. Нептун усиливает интуицию и духовные переживания. Начало недели — время медитации и внутренней работы. Середина — творческий подъём. К выходным — важное духовное осознание.",
        ],
        "monthly": [
            "Месяц духовного погружения и творческого расцвета для Рыб. Нептун открывает доступ к глубинным пластам сознания. Первая половина — время мечты и интуиции. Вторая — воплощение мечт в реальность.",
        ],
    },
}


def get_setting_from_db(db: Session, key: str, default: str = "") -> str:
    s = db.query(Settings).filter(Settings.key == key).first()
    return s.value if s else default


def check_service_access(service: str, plan_type: str, db: Session) -> bool:
    """Check if service is enabled and user has access based on plan."""
    service_key = f"service_{service}_enabled"
    enabled = get_setting_from_db(db, service_key, "true") == "true"
    if not enabled:
        return False

    # Plan access control
    if service == "natal_chart":
        return True  # All plans
    elif service == "forecasts":
        return plan_type in ("basic", "pro")
    elif service == "tarot":
        return plan_type == "pro"
    return False


@router.post("/natal-chart", response_model=APIResponse)
async def natal_chart(
    request: NatalChartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_service_access("natal_chart", current_user.plan_type, db):
        raise HTTPException(status_code=403, detail="Сервис недоступен или отключён")

    try:
        result = calculate_natal_chart_ephem(request)
    except ImportError:
        result = calculate_natal_chart_simple(request)
    except Exception as e:
        result = calculate_natal_chart_simple(request)

    return APIResponse(data=result, message="Натальная карта рассчитана")


@router.post("/forecast", response_model=APIResponse)
async def forecast(
    request: ForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_service_access("forecasts", current_user.plan_type, db):
        raise HTTPException(
            status_code=403,
            detail="Прогнозы доступны для тарифов Basic и Pro"
        )

    sign = get_zodiac_sign(request.birth_date)
    period = request.period if request.period in ("daily", "weekly", "monthly") else "daily"

    templates = FORECAST_TEMPLATES.get(sign, {})
    period_texts = templates.get(period, [])

    if period_texts:
        text = random.choice(period_texts)
        text = text.replace("{name}", current_user.username)
    else:
        text = f"Звёзды наблюдают за вами, {current_user.username}. Этот период несёт перемены и возможности для роста."

    period_names = {"daily": "ежедневный", "weekly": "недельный", "monthly": "месячный"}

    return APIResponse(data={
        "zodiac_sign": sign,
        "period": period,
        "period_name": period_names.get(period, period),
        "forecast": text,
        "generated_at": datetime.utcnow().isoformat()
    }, message="Прогноз получен")


@router.post("/tarot", response_model=APIResponse)
async def tarot_reading(
    request: TarotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not check_service_access("tarot", current_user.plan_type, db):
        raise HTTPException(
            status_code=403,
            detail="Таро доступно для тарифа Pro"
        )

    spread_sizes = {
        "one_card": 1,
        "three_card": 3,
        "celtic_cross": 10
    }
    spread_type = request.spread_type if request.spread_type in spread_sizes else "one_card"
    num_cards = spread_sizes[spread_type]

    drawn = random.sample(TAROT_DECK, num_cards)
    cards_result = []
    for card in drawn:
        is_reversed = random.random() < 0.3  # 30% chance reversed
        cards_result.append({
            "name": card["name"],
            "suit": card["suit"],
            "is_reversed": is_reversed,
            "meaning": card["meaning_reversed"] if is_reversed else card["meaning_upright"],
            "orientation": "Перевёрнутая" if is_reversed else "Прямая"
        })

    # Position names for spreads
    position_names = {
        "one_card": ["Карта дня"],
        "three_card": ["Прошлое", "Настоящее", "Будущее"],
        "celtic_cross": [
            "Настоящее", "Вызов", "Прошлое", "Будущее", "Основа",
            "Высшее Я", "Самовосприятие", "Окружение", "Надежды и страхи", "Итог"
        ]
    }

    positions = position_names.get(spread_type, [])
    for i, card in enumerate(cards_result):
        if i < len(positions):
            card["position"] = positions[i]

    spread_names = {
        "one_card": "Одна карта",
        "three_card": "Три карты",
        "celtic_cross": "Кельтский крест"
    }

    return APIResponse(data={
        "question": request.question,
        "spread_type": spread_type,
        "spread_name": spread_names.get(spread_type, spread_type),
        "cards": cards_result,
        "drawn_at": datetime.utcnow().isoformat()
    }, message="Расклад выполнен")
