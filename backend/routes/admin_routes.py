from flask import Blueprint, request, jsonify
from models.database import db, Admin, Student, Job, Application
from utils.auth import hash_password, verify_password, generate_token, token_required
from utils.mailer import send_status_update_email

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    email_or_username = data.get('email', '').strip()
    password = data.get('password', '')

    if not email_or_username or not password:
        return jsonify({'success': False, 'message': 'Username/Email and password required'}), 400

    admin = Admin.query.filter(
        (Admin.email == email_or_username) | (Admin.username == email_or_username)
    ).first()

    if not admin or not verify_password(admin.password, password):
        return jsonify({'success': False, 'message': 'Invalid admin credentials'}), 401

    token = generate_token(admin.id, role='admin', email=admin.email, full_name=admin.full_name)
    return jsonify({
        'success': True,
        'message': 'Admin login successful!',
        'token': token,
        'user': admin.to_dict()
    }), 200


@admin_bp.route('/dashboard', methods=['GET'])
@admin_bp.route('/stats', methods=['GET'])
@token_required(role_required='admin')
def get_admin_dashboard_stats():
    from models.database import Category

    total_jobs = Job.query.count()
    active_jobs = Job.query.filter_by(status='Active').count()
    total_students = Student.query.count()
    total_apps = Application.query.count()
    pending_apps = Application.query.filter_by(status='Pending').count()
    accepted_apps = Application.query.filter_by(status='Accepted').count()
    rejected_apps = Application.query.filter_by(status='Rejected').count()

    recent_jobs = Job.query.order_by(Job.created_at.desc()).limit(5).all()
    recent_apps = Application.query.order_by(Application.applied_date.desc()).limit(5).all()

    # Category distribution for Bar Chart
    categories = Category.query.all()
    category_distribution = {}
    for c in categories:
        cnt = Job.query.filter_by(category=c.name).count()
        if cnt > 0:
            category_distribution[c.name] = cnt

    application_status_distribution = {
        'Pending': pending_apps,
        'Accepted': accepted_apps,
        'Rejected': rejected_apps
    }

    metrics = {
        'total_jobs': total_jobs,
        'active_jobs': active_jobs,
        'total_students': total_students,
        'total_applications': total_apps,
        'pending_applications': pending_apps,
        'accepted_applications': accepted_apps,
        'rejected_applications': rejected_apps
    }

    return jsonify({
        'success': True,
        'data': {
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_students': total_students,
            'total_applications': total_apps,
            'pending_applications': pending_apps,
            'accepted_applications': accepted_apps,
            'rejected_applications': rejected_apps,
            'application_status_distribution': application_status_distribution,
            'category_distribution': category_distribution,
            'metrics': metrics,
            'recent_jobs': [j.to_dict() for j in recent_jobs],
            'recent_applications': [a.to_dict() for a in recent_apps]
        }
    }), 200


@admin_bp.route('/students', methods=['GET'])
@token_required(role_required='admin')
def get_students():
    search = request.args.get('search', '').strip()
    query = Student.query

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Student.full_name.ilike(search_filter)) |
            (Student.email.ilike(search_filter)) |
            (Student.college.ilike(search_filter)) |
            (Student.department.ilike(search_filter))
        )

    students = query.order_by(Student.id.desc()).all()
    return jsonify({'success': True, 'data': [s.to_dict() for s in students]}), 200


@admin_bp.route('/students/<int:student_id>', methods=['DELETE'])
@token_required(role_required='admin')
def delete_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student not found'}), 404

    try:
        db.session.delete(student)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Student removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error removing student: {str(e)}'}), 500


@admin_bp.route('/jobs', methods=['GET', 'POST'])
@token_required(role_required='admin')
def manage_jobs():
    if request.method == 'GET':
        jobs = Job.query.order_by(Job.id.desc()).all()
        return jsonify({'success': True, 'data': [j.to_dict() for j in jobs]}), 200

    # POST - Create new job
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    company_name = data.get('company_name', '').strip()
    location = data.get('location', '').strip()
    job_type = data.get('job_type', 'Part-Time').strip()
    salary = data.get('salary', '').strip()
    category = data.get('category', '').strip()
    image_url = data.get('image_url', '').strip()
    description = data.get('description', '').strip()
    requirements = data.get('requirements', '').strip()

    if not (title and company_name and location and salary and category):
        return jsonify({'success': False, 'message': 'Please fill all required job fields'}), 400

    new_job = Job(
        title=title,
        company_name=company_name,
        location=location,
        job_type=job_type,
        salary=salary,
        category=category,
        image_url=image_url,
        description=description,
        requirements=requirements,
        status='Active'
    )

    try:
        db.session.add(new_job)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Job posted successfully!', 'data': new_job.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error creating job: {str(e)}'}), 500


@admin_bp.route('/jobs/<int:job_id>', methods=['PUT', 'DELETE'])
@token_required(role_required='admin')
def modify_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'message': 'Job position not found'}), 404

    if request.method == 'DELETE':
        try:
            db.session.delete(job)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Job position deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error deleting job: {str(e)}'}), 500

    # PUT Update
    data = request.get_json() or {}
    job.title = data.get('title', job.title).strip()
    job.company_name = data.get('company_name', job.company_name).strip()
    job.location = data.get('location', job.location).strip()
    job.job_type = data.get('job_type', job.job_type).strip()
    job.salary = data.get('salary', job.salary).strip()
    job.category = data.get('category', job.category).strip()
    job.image_url = data.get('image_url', job.image_url).strip()
    job.description = data.get('description', job.description).strip()
    job.requirements = data.get('requirements', job.requirements).strip()
    job.status = data.get('status', job.status).strip()

    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Job updated successfully!', 'data': job.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error updating job: {str(e)}'}), 500


@admin_bp.route('/applications', methods=['GET'])
@token_required(role_required='admin')
def get_all_applications():
    apps = Application.query.order_by(Application.applied_date.desc()).all()
    return jsonify({'success': True, 'data': [a.to_dict() for a in apps]}), 200


@admin_bp.route('/applications/<int:app_id>/status', methods=['PUT'])
@token_required(role_required='admin')
def update_application_status(app_id):
    application = Application.query.get(app_id)
    if not application:
        return jsonify({'success': False, 'message': 'Application record not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').strip()

    if new_status not in ['Pending', 'Accepted', 'Rejected']:
        return jsonify({'success': False, 'message': 'Invalid status. Must be Pending, Accepted, or Rejected'}), 400

    application.status = new_status

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error updating application status: {str(e)}'}), 500

    # Safely dispatch email notification (non-blocking on failure)
    try:
        if application.student_rel and application.job_rel:
            send_status_update_email(
                to_email=application.student_rel.email,
                student_name=application.student_rel.full_name,
                job_title=application.job_rel.title,
                company_name=application.job_rel.company_name,
                status=new_status
            )
    except Exception as mail_err:
        print(f"[Status Email Warning] Failed to send email notification: {mail_err}")

    return jsonify({
        'success': True,
        'message': f'Application status updated to {new_status}',
        'data': application.to_dict()
    }), 200


@admin_bp.route('/db-report', methods=['GET'])
def get_db_report_info():
    import os, sqlite3
    from config import Config
    
    db_path = Config.SQLITE_PATH
    exists = os.path.exists(db_path)
    file_size_bytes = os.path.getsize(db_path) if exists else 0
    file_size_kb = round(file_size_bytes / 1024, 2)
    
    tables_summary = {}
    if exists:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_')]
        for t in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            tables_summary[t] = cursor.fetchone()[0]
            
    return jsonify({
        'success': True,
        'db_location': db_path,
        'exists': exists,
        'file_size_kb': file_size_kb,
        'tables_count': len(tables_summary),
        'tables': tables_summary
    }), 200
