from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import or_, desc, asc
from backend.models.database import db, Job, Application, SavedJob, Category, Student
from backend.utils.auth import token_required

job_bp = Blueprint('jobs', __name__, url_prefix='/api')

@job_bp.route('/jobs', methods=['GET'])
def get_jobs():
    search = request.args.get('search', '').strip()
    location = request.args.get('location', '').strip()
    category = request.args.get('category', '').strip()
    job_type = request.args.get('job_type', '').strip()
    sort_by = request.args.get('sort_by', 'latest').strip()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 9))

    query = Job.query.filter(or_(Job.status == 'Active', Job.status.is_(None)))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_filter),
                Job.company_name.ilike(search_filter),
                Job.description.ilike(search_filter),
                Job.category.ilike(search_filter)
            )
        )

    if location and location.lower() != 'all':
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if category and category.lower() != 'all':
        query = query.filter(Job.category.ilike(f"%{category}%"))

    if job_type and job_type.lower() != 'all':
        query = query.filter(Job.job_type.ilike(f"%{job_type}%"))

    # Sorting options
    if sort_by == 'title':
        query = query.order_by(asc(Job.title))
    elif sort_by == 'salary':
        query = query.order_by(desc(Job.salary))
    else: # latest
        query = query.order_by(desc(Job.created_at))

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'success': True,
        'data': [j.to_dict() for j in paginated.items],
        'total': paginated.total,
        'page': page,
        'pages': paginated.pages,
        'per_page': per_page
    }), 200


@job_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job_detail(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'message': 'Job not found'}), 404
    return jsonify({'success': True, 'data': job.to_dict()}), 200


@job_bp.route('/jobs/<int:job_id>/apply', methods=['POST'])
@token_required()
def apply_job(job_id):
    if request.current_user.get('role') != 'student':
        return jsonify({'success': False, 'message': 'Only registered students can apply for jobs.'}), 403

    user_id = request.current_user['id']
    data = request.get_json() or {}

    student = Student.query.get(user_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student profile not found. Please register first.'}), 404

    # Check if structured application form fields are provided
    if any(k in data for k in ['phone', 'college', 'availability', 'why_suitable', 'skills_note']):
        full_name = data.get('full_name', '').strip()
        phone = data.get('phone', '').strip()
        college = data.get('college', '').strip()
        availability = data.get('availability', '').strip()
        why_suitable = data.get('why_suitable', '').strip()
        skills_note = data.get('skills_note', '').strip()

        # Strict validation: ALL fields are mandatory. No field can be empty!
        if not full_name:
            return jsonify({'success': False, 'message': 'Full name cannot be empty. Please fill in your name.'}), 400
        if not phone:
            return jsonify({'success': False, 'message': 'Mobile number cannot be empty. Please fill in your mobile number.'}), 400
        if len(phone) < 10:
            return jsonify({'success': False, 'message': 'Please enter a valid 10-digit mobile number.'}), 400
        if not college:
            return jsonify({'success': False, 'message': 'College & Department cannot be empty. Please fill in this field.'}), 400
        if not availability:
            return jsonify({'success': False, 'message': 'Shift availability cannot be empty. Please select your shift.'}), 400
        if not why_suitable:
            return jsonify({'success': False, 'message': 'Why suitable field cannot be empty. Please explain why you are suitable.'}), 400
        if not skills_note:
            return jsonify({'success': False, 'message': 'Key skills & experience note cannot be empty. Please fill in this field.'}), 400

        # Update student mobile and college in DB if updated
        if phone:
            student.phone = phone
        if college and not student.college:
            student.college = college

        cover_note = f"Shift: {availability} | Why Suitable: {why_suitable} | Experience: {skills_note}"
    else:
        cover_note = data.get('cover_note', '').strip()
        if not cover_note:
            return jsonify({'success': False, 'message': 'Application form cannot be empty. All fields are required.'}), 400

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'message': 'Job not found'}), 404

    if job.status and job.status.strip().lower() != 'active':
        return jsonify({'success': False, 'message': 'This job position is currently closed.'}), 400

    # If application already exists, update cover note & timestamp seamlessly
    existing_app = Application.query.filter_by(job_id=job_id, student_id=user_id).first()
    if existing_app:
        existing_app.cover_note = cover_note
        existing_app.applied_date = datetime.utcnow()
        if existing_app.status == 'Rejected':
            existing_app.status = 'Pending'
        try:
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Application submitted successfully!',
                'data': existing_app.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error updating application: {str(e)}'}), 500

    application = Application(
        job_id=job_id,
        student_id=user_id,
        status='Pending',
        cover_note=cover_note
    )

    try:
        db.session.add(application)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Application submitted successfully!',
            'data': application.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error submitting application: {str(e)}'}), 500


@job_bp.route('/jobs/<int:job_id>/save', methods=['POST'])
@token_required(role_required='student')
def toggle_save_job(job_id):
    user_id = request.current_user['id']

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'message': 'Job not found'}), 404

    existing_saved = SavedJob.query.filter_by(student_id=user_id, job_id=job_id).first()

    if existing_saved:
        db.session.delete(existing_saved)
        db.session.commit()
        return jsonify({'success': True, 'saved': False, 'message': 'Job removed from saved list'}), 200

    new_saved = SavedJob(student_id=user_id, job_id=job_id)
    db.session.add(new_saved)
    db.session.commit()
    return jsonify({'success': True, 'saved': True, 'message': 'Job saved successfully!'}), 201


@job_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    res = []
    for c in categories:
        c_dict = c.to_dict()
        c_dict['count'] = Job.query.filter_by(category=c.name, status='Active').count()
        res.append(c_dict)
    return jsonify({'success': True, 'data': res}), 200
