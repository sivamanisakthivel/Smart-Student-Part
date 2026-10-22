import os
import sys

# Support both repository imports locally and the backend service root on Vercel.
backend_dir = os.path.abspath(os.path.dirname(__file__))
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, backend_dir)
sys.path.insert(0, root_dir)

# Auto-detect and switch to workspace .venv if system python is used without flask
try:
    import flask
except ImportError:
    venv_python = os.path.join(root_dir, '.venv', 'Scripts', 'python.exe')
    if os.path.exists(venv_python) and os.path.abspath(sys.executable) != os.path.abspath(venv_python):
        print(f"[Info] Switching to virtual environment Python: {venv_python}")
        os.execv(venv_python, [venv_python] + sys.argv)

from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from config import Config
from models.database import db, Admin, Student, Job, Category, Application, SavedJob, OTPVerification
from routes.auth_routes import auth_bp
from routes.job_routes import job_bp
from routes.student_routes import student_bp
from routes.admin_routes import admin_bp
from routes.upload_routes import upload_bp
from utils.auth import hash_password

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React frontend (Vite default localhost:5173 / localhost:3000)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Validate the configured MySQL connection before initializing the ORM.
    db_uri = Config.MYSQL_URI
    engine_options = Config.SQLALCHEMY_ENGINE_OPTIONS
    db_type = 'MySQL'

    try:
        connect_args = {
            'connect_timeout': 5,
            **engine_options.get('connect_args', {}),
        }
        engine_options = {
            key: value for key, value in engine_options.items()
            if key != 'connect_args'
        }
        engine = create_engine(db_uri, connect_args=connect_args, **engine_options)
        with engine.connect():
            pass
        engine.dispose()
    except Exception as db_error:
        if Config.DATABASE_URL or os.getenv('VERCEL') == '1':
            raise RuntimeError(
                'Could not connect to the configured production database. '
                'Check DATABASE_URL and its TLS settings.'
            ) from db_error

        # Fall back to SQLite only for local development.
        db_uri = Config.SQLITE_URI
        engine_options = {}
        db_type = 'SQLite (VS Code Fallback)'

    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = engine_options
    db.init_app(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(upload_bp)

    @app.route('/static/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        from flask import send_from_directory
        uploads_dir = os.path.join(Config.BASE_DIR, 'static', 'uploads')
        return send_from_directory(uploads_dir, filename)

    @app.route('/phpmyadmin')
    def serve_phpmyadmin_report():
        from flask import send_from_directory
        return send_from_directory(Config.BASE_DIR, 'phpmyadmin_report.html')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'project': 'Smart Student Part-Time Job Management System',
            'database': db_type
        }), 200

    # Auto seed initial database tables & sample data
    with app.app_context():
        try:
            db.create_all()
            seed_initial_data()
        except Exception as err:
            print(f"[DB Setup Warning] {err}")

    from flask import request
    @app.after_request
    def auto_export_json_after_request(response):
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH'] and response.status_code < 400:
            try:
                from export_db_to_json import export_sqlite_to_json
                export_sqlite_to_json()
            except Exception as e:
                print(f"[Auto Export Warning] {e}")
        return response

    return app, db_type


def seed_initial_data():
    """Seed initial categories, sample Tamil Nadu jobs, and default admin user if database is empty."""
    # 1. Seed Categories
    if Category.query.count() == 0:
        categories = [
            Category(name='Bakery', icon='FaCookieBite'),
            Category(name='Medical', icon='FaClinicMedical'),
            Category(name='Hotel & Restaurant', icon='FaUtensils'),
            Category(name='Tea & Cafe', icon='FaCoffee')
        ]
        db.session.add_all(categories)
        db.session.commit()

    # 2. Seed Default Admin (admin@jobportal.com / admin123)
    if Admin.query.count() == 0:
        default_admin = Admin(
            username='admin',
            email='admin@jobportal.com',
            password=hash_password('admin123'),
            full_name='System Administrator'
        )
        db.session.add(default_admin)
        db.session.commit()

    # 3. Seed Sample Tamil Nadu Jobs
    if Job.query.filter_by(status='Active').count() == 0:
      
        db.session.add_all(sample_jobs)
        db.session.commit()

        # Seed sample student (siva@example.com / password123)
        sample_student = Student(
            full_name='Siva Kumar',
            email='siva@example.com',
            password=hash_password('password123'),
            phone='9876543210',
            college='Government College of Engineering, Salem',
            department='Computer Science',
            skills='Python, JavaScript, SQL, Communication'
        )
        db.session.add(sample_student)
        db.session.commit()

    try:
        from export_db_to_json import export_sqlite_to_json
        export_sqlite_to_json()
    except Exception as e:
        print(f"[Auto Export Warning] {e}")


# Direct top-level Flask app instance for Vercel Python runtime
_created = create_app()
app = _created[0]
active_db_type = _created[1]

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n=======================================================")
    print(f"[Backend API] Smart Student Job Portal Backend Running!")
    print(f"[Server URL]  http://127.0.0.1:{port}")
    print(f"[Database]    {active_db_type}")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=True)
