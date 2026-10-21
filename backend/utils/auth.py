import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    return generate_password_hash(password)

def verify_password(hashed_password, password):
    return check_password_hash(hashed_password, password)

def generate_token(user_id, role='student', email=None, full_name=None):
    payload = {
        'id': user_id,
        'role': role,
        'email': email,
        'full_name': full_name,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(role_required=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            
            if not token:
                return jsonify({'success': False, 'message': 'Authentication token required'}), 401
            
            payload = decode_token(token)
            if not payload:
                return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
            
            if role_required and payload.get('role') != role_required and payload.get('role') != 'admin':
                return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
            
            request.current_user = payload
            return f(*args, **kwargs)
        return decorated
    return decorator
