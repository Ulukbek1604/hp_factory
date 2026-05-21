"""
Django settings for hp_factory project.
HP Factory - Production of Laptops and PCs.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'secret'
DEBUG = True
ALLOWED_HOSTS = ['*']


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'hp_factory.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hp_factory.wsgi.application'

# ==============================================================
# DATABASE - Microsoft SQL Server
# ==============================================================
# IMPORTANT: Change SERVER to your SQL Server instance name,
# and NAME to your database name (e.g., 'HPFactoryDB').
# Trusted_Connection=yes uses Windows Authentication.
# If you use SQL Server login: remove Trusted_Connection and add USER/PASSWORD.
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'HP_Factory',
        'HOST': '.\\NEWLIST',   # <-- Your SQL Server instance
        'PORT': '',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'Trusted_Connection': 'yes',   # Windows Auth
            'extra_params': 'Encrypt=no;TrustServerCertificate=yes;',
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==============================================================
# БЕЗОПАСНОСТЬ: Настройки хеширования паролей (Практическая 3)
# ==============================================================
# Django позволяет использовать множество алгоритмов. По умолчанию для
# новых паролей будет использоваться первый в списке (Argon2). Остальные
# используются для проверки старых паролей.
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',      # Argon2
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',# bcrypt (совместимый)
    'django.contrib.auth.hashers.ScryptPasswordHasher',      # scrypt
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',      # SHA-256 (по умолч. в Django)
    'core.hashers.SHA384PasswordHasher',                     # SHA-384 (наш кастомный)
    'core.hashers.SHA512PasswordHasher',                     # SHA-512 (наш кастомный)
    'django.contrib.auth.hashers.MD5PasswordHasher',         # MD5 (небезопасно, но в задании)
]

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Asia/Almaty'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==============================================================
# БЕЗОПАСНОСТЬ: Настройки авторизации (Практическая работа №3)
# ==============================================================
# Куда перенаправлять, если @login_required срабатал
LOGIN_URL = '/login/'
# Куда перенаправлять после успешного входа
LOGIN_REDIRECT_URL = '/'
# Куда перенаправлять после выхода
LOGOUT_REDIRECT_URL = '/login/'
# hp_factory/settings.py — добавить явные настройки безопасности
SESSION_COOKIE_SECURE = True    # куки только по HTTPS
SESSION_COOKIE_HTTPONLY = True  # куки недоступны из JavaScript
CSRF_COOKIE_SECURE = True       # CSRF-токен только по HTTPS
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'