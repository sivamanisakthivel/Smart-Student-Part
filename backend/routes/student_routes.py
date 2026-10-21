from flask import Blueprint, request, jsonify
from backend.models.database import db, Student, Job, Application, SavedJob
from backend.utils.auth import token_required

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

@student_bp.route('/dashboard', methods=['GET'])
@token_required(role_required='student')
def get_dashboard_stats():
    user_id = request.current_user['id']
    student = Student.query.get(user_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student profile not found'}), 404

    applications = Application.query.filter_by(student_id=user_id).all()
    total_apps = len(applications)
    pending_apps = len([a for a in applications if a.status == 'Pending'])
    accepted_apps = len([a for a in applications if a.status == 'Accepted'])
    rejected_apps = len([a for a in applications if a.status == 'Rejected'])

    saved_jobs = SavedJob.query.filter_by(student_id=user_id).all()
    saved_count = len(saved_jobs)

    # Compute profile completion percentage
    filled_fields = 0
    total_fields = 6
    if student.full_name: filled_fields += 1
    if student.email: filled_fields += 1
    if student.phone: filled_fields += 1
    if student.college: filled_fields += 1
    if student.department: filled_fields += 1
    if student.skills: filled_fields += 1

    profile_completion = int((filled_fields / total_fields) * 100)

    # Recommended jobs based on student's department or skills
    recommended = Job.query.filter_by(status='Active').order_by(Job.id.desc()).limit(4).all()

    # Recent applications (last 5)
    recent_apps = Application.query.filter_by(student_id=user_id).order_by(Application.applied_date.desc()).limit(5).all()

    return jsonify({
        'success': True,
        'data': {
            'student': student.to_dict(),
            'profile_completion': profile_completion,
            'metrics': {
                'total_applications': total_apps,
                'pending_applications': pending_apps,
                'accepted_applications': accepted_apps,
                'rejected_applications': rejected_apps,
                'saved_jobs': saved_count
            },
            'recommended_jobs': [j.to_dict() for j in recommended],
            'recent_applications': [a.to_dict() for a in recent_apps]
        }
    }), 200


@student_bp.route('/applications', methods=['GET'])
@token_required(role_required='student')
def get_student_applications():
    user_id = request.current_user['id']
    apps = Application.query.filter_by(student_id=user_id).order_by(Application.applied_date.desc()).all()
    return jsonify({
        'success': True,
        'data': [a.to_dict() for a in apps]
    }), 200


@student_bp.route('/saved-jobs', methods=['GET'])
@token_required(role_required='student')
def get_saved_jobs():
    user_id = request.current_user['id']
    saved = SavedJob.query.filter_by(student_id=user_id).order_by(SavedJob.saved_at.desc()).all()
    return jsonify({
        'success': True,
        'data': [s.to_dict() for s in saved if s.job_rel]
    }), 200


@student_bp.route('/profile', methods=['GET', 'PUT'])
@token_required(role_required='student')
def manage_profile():
    user_id = request.current_user['id']
    student = Student.query.get(user_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student not found'}), 404

    if request.method == 'GET':
        return jsonify({'success': True, 'data': student.to_dict()}), 200

    # PUT update
    data = request.get_json() or {}
    student.full_name = data.get('full_name', student.full_name).strip()
    student.phone = data.get('phone', student.phone).strip()
    student.college = data.get('college', student.college).strip()
    student.department = data.get('department', student.department).strip()
    student.skills = data.get('skills', student.skills).strip()

    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully!',
            'data': student.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error updating profile: {str(e)}'}), 500
