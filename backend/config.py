import os
from dotenv import load_dotenv
from sqlalchemy.engine import URL, make_url

# Load .env file
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config:
    BASE_DIR = BASE_DIR
    SECRET_KEY = os.getenv('SECRET_KEY', 'smart_student_job_system_secret_key_2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'smart_student_job_jwt_secret_key_2026')
    
    DATABASE_URL = os.getenv('DATABASE_URL')
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', '3306'))
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'student_job_db')

    if DATABASE_URL:
        MYSQL_URI = make_url(DATABASE_URL)
        if MYSQL_URI.drivername in ('mysql', 'mysql+pymysql'):
            MYSQL_URI = MYSQL_URI.set(drivername='mysql+pymysql')

        query = dict(MYSQL_URI.query)
        ssl_mode = query.pop('ssl-mode', '').upper()
        if ssl_mode and ssl_mode != 'REQUIRED':
            raise ValueError('DATABASE_URL supports ssl-mode=REQUIRED only')
        MYSQL_URI = MYSQL_URI.set(query=query)
        SQLALCHEMY_ENGINE_OPTIONS = (
            {'connect_args': {'ssl': {'verify_mode': 'none'}}}
            if ssl_mode == 'REQUIRED' else {}
        )
    else:
        MYSQL_URI = URL.create(
            'mysql+pymysql',
            username=MYSQL_USER,
            password=MYSQL_PASSWORD,
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            database=MYSQL_DB,
        )
        SQLALCHEMY_ENGINE_OPTIONS = {}
    
    # On Vercel serverless functions, /tmp is the writable storage directory
    if os.getenv('VERCEL') == '1':
        _dest = '/tmp/student_job.db'
        _src = os.path.join(BASE_DIR, 'student_job.db')
        if not os.path.exists(_dest) and os.path.exists(_src):
            try:
                import shutil
                shutil.copyfile(_src, _dest)
            except Exception:
                pass
        SQLITE_PATH = _dest if os.path.exists(_dest) else _src
    else:
        SQLITE_PATH = os.path.join(BASE_DIR, 'student_job.db')

    SQLITE_URI = f"sqlite:///{SQLITE_PATH}"

    # SMTP Credentials
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_EMAIL = os.getenv('SMTP_EMAIL', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    REQUIRE_REALTIME_OTP = os.getenv('REQUIRE_REALTIME_OTP', 'False').lower() in ('1', 'true', 'yes')

    # Cloudinary Credentials
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', '')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
