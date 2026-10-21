import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config:
    BASE_DIR = BASE_DIR
    SECRET_KEY = os.getenv('SECRET_KEY', 'smart_student_job_system_secret_key_2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'smart_student_job_jwt_secret_key_2026')
    
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = os.getenv('MYSQL_PORT', '3306')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'student_job_db')

    # Construct SQLAlchemy Database URIs (supports DATABASE_URL / MySQL / SQLite fallback)
    DATABASE_URL = os.getenv('DATABASE_URL')
    MYSQL_URI = DATABASE_URL if DATABASE_URL else f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    
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
