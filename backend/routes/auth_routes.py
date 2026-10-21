import json
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from backend.models.database import db, Student, Admin, OTPVerification
from backend.utils.auth import hash_password, verify_password, generate_token, token_required
from backend.utils.mailer import generate_otp_code, send_otp_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()
    college = data.get('college', '').strip()
    department = data.get('department', '').strip()
    skills = data.get('skills', '').strip()

    if not (full_name and email and password and phone and college and department):
        return jsonify({'success': False, 'message': 'All required fields must be filled'}), 400

    existing_student = Student.query.filter_by(email=email).first()
    if existing_student:
        return jsonify({'success': False, 'message': 'Email address is already registered. Please sign in.'}), 400

    # Generate 6-digit Registration OTP
    otp_code = generate_otp_code()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    # Invalidate previous unexpired registration OTPs for this email
    OTPVerification.query.filter_by(email=email, purpose='register').delete()

    otp_record = OTPVerification(
        email=email,
        otp_code=otp_code,
        purpose='register',
        attempts=0,
        expires_at=expires_at
    )
    db.session.add(otp_record)
    db.session.commit()

    # Dispatch realtime email OTP
    sent, msg = send_otp_email(email, otp_code, student_name=full_name, purpose='Register')
    if not sent:
        return jsonify({'success': False, 'message': msg}), 500

    return jsonify({
        'success': True,
        'message': f'6-Digit OTP sent to {email}. Valid for 5 minutes.',
        'require_otp': True,
        'purpose': 'register',
        'email': email,
        'dev_otp': otp_code # Dev auto-fill helper
    }), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    student = Student.query.filter_by(email=email).first()
    if not student:
        return jsonify({'success': False, 'message': 'No account found with this email. Please register first.'}), 401

    if not verify_password(student.password, password):
        return jsonify({'success': False, 'message': 'Incorrect password. Please try again.'}), 401

    # Generate 6-digit Login OTP
    otp_code = generate_otp_code()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    # Invalidate previous unexpired login OTPs for this email
    OTPVerification.query.filter_by(email=email, purpose='login').delete()

    otp_record = OTPVerification(
        email=email,
        otp_code=otp_code,
        purpose='login',
        attempts=0,
        expires_at=expires_at
    )
    db.session.add(otp_record)
    db.session.commit()

    # Dispatch realtime email OTP
    sent, msg = send_otp_email(email, otp_code, student_name=student.full_name, purpose='Login')
    if not sent:
        return jsonify({'success': False, 'message': msg}), 500

    return jsonify({
        'success': True,
        'message': f'6-Digit OTP sent to {email}. Valid for 5 minutes.',
        'require_otp': True,
        'purpose': 'login',
        'email': email,
        'dev_otp': otp_code # Dev auto-fill helper
    }), 200


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    otp_code = data.get('otp_code', '').strip()
    purpose = data.get('purpose', 'login').strip().lower()
    reg_data = data.get('registration_data')
    if not isinstance(reg_data, dict):
        reg_data = {}

    if not email or not otp_code:
        return jsonify({'success': False, 'message': 'Email and OTP code are required'}), 400

    clean_email = email.strip().lower()

    # Case-insensitive query for latest OTP record matching email & purpose
    record = OTPVerification.query.filter(
        db.func.lower(OTPVerification.email) == clean_email,
        OTPVerification.purpose == purpose
    ).order_by(OTPVerification.id.desc()).first()

    if not record:
        # Fallback query matching email across any purpose
        record = OTPVerification.query.filter(
            db.func.lower(OTPVerification.email) == clean_email
        ).order_by(OTPVerification.id.desc()).first()

    if not record:
        return jsonify({'success': False, 'message': 'No active OTP request found for this email. Please click Resend OTP.'}), 404

    # Check max attempts (Max 3)
    if record.attempts >= 3:
        return jsonify({'success': False, 'message': 'Maximum OTP attempts exceeded. Please request a new OTP.'}), 400

    # Check expiry
    if datetime.utcnow() > record.expires_at:
        return jsonify({'success': False, 'message': 'OTP has expired. Please click Resend OTP.'}), 400

    # Validate OTP code
    if record.otp_code != otp_code:
        record.attempts += 1
        db.session.commit()
        remaining = 3 - record.attempts
        return jsonify({
            'success': False,
            'message': f'Invalid OTP code. {remaining} attempt(s) remaining.'
        }), 400

    # Delete verified OTP
    db.session.delete(record)
    db.session.commit()

    # Handle Registration Verification Flow
    if purpose == 'register' or reg_data.get('full_name'):
        student = Student.query.filter_by(email=email).first()
        if not student:
            if not reg_data.get('full_name'):
                return jsonify({'success': False, 'message': 'Registration data missing. Please register again.'}), 400
            
            hashed_pw = hash_password(reg_data.get('password', ''))
            student = Student(
                full_name=reg_data.get('full_name', '').strip(),
                email=email,
                password=hashed_pw,
                phone=reg_data.get('phone', '').strip(),
                college=reg_data.get('college', '').strip(),
                department=reg_data.get('department', '').strip(),
                skills=reg_data.get('skills', '').strip()
            )
            db.session.add(student)
            db.session.commit()

        token = generate_token(student.id, role='student', email=student.email, full_name=student.full_name)
        return jsonify({
            'success': True,
            'message': 'Registration verified and account created successfully!',
            'token': token,
            'user': student.to_dict()
        }), 200

    # Handle Login Verification Flow
    student = Student.query.filter_by(email=email).first()
    if not student:
        return jsonify({'success': False, 'message': 'Student profile not found'}), 404

    token = generate_token(student.id, role='student', email=student.email, full_name=student.full_name)

    return jsonify({
        'success': True,
        'message': 'Login successful!',
        'token': token,
        'user': student.to_dict()
    }), 200


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    purpose = data.get('purpose', 'login').strip().lower()

    if not email:
        return jsonify({'success': False, 'message': 'Email address required'}), 400

    student = Student.query.filter_by(email=email).first()
    student_name = student.full_name if student else "Student"

    # Generate new OTP
    otp_code = generate_otp_code()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    OTPVerification.query.filter_by(email=email, purpose=purpose).delete()

    otp_record = OTPVerification(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        attempts=0,
        expires_at=expires_at
    )
    db.session.add(otp_record)
    db.session.commit()

    sent, msg = send_otp_email(email, otp_code, student_name=student_name, purpose=purpose)

    return jsonify({
        'success': True,
        'message': f'A new 6-digit OTP has been sent to {email}.',
        'data': {
            'email': email,
            'purpose': purpose,
            'dev_otp': otp_code
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required()
def get_current_user():
    user_data = request.current_user
    role = user_data.get('role')
    user_id = user_data.get('id')

    if role == 'admin':
        admin = Admin.query.get(user_id)
        if not admin:
            return jsonify({'success': False, 'message': 'Admin not found'}), 404
        return jsonify({'success': True, 'data': admin.to_dict(), 'role': 'admin'}), 200

    student = Student.query.get(user_id)
    if not student:
        return jsonify({'success': False, 'message': 'Student profile not found'}), 404

    return jsonify({'success': True, 'data': student.to_dict(), 'role': 'student'}), 200
