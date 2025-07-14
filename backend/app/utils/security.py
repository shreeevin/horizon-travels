import re
from flask_jwt_extended import create_access_token, get_jwt_identity
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask import jsonify

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims['role'] != 'admin':
                return jsonify({'message': 'Admin access required'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def create_access_token_for_user(user):
    additional_claims = {
        'user_id': user.id,
        'role': user.role.value,
        'email': user.email
    }
    return create_access_token(identity=user.username, additional_claims=additional_claims)

def get_current_user():
    from app.models import User
    username = get_jwt_identity()
    return User.query.filter_by(username=username).first()

def get_current_user_id():
    from app.models import User
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    return user.id

def validate_registration_data(data):
    errors = {}
    
    if not data.get('username'):
        errors['username'] = 'Username is required'
    elif len(data['username']) < 4:
        errors['username'] = 'Username must be at least 4 characters'
    
    if not data.get('email'):
        errors['email'] = 'Email is required'
    elif not re.match(r'[^@]+@[^@]+\.[^@]+', data['email']):
        errors['email'] = 'Invalid email format'
    
    if not data.get('password'):
        errors['password'] = 'Password is required'
    elif len(data['password']) < 8:
        errors['password'] = 'Password must be at least 8 characters'
    
    return errors

def validate_password_change_data(data):
    errors = {}
    
    if not data.get('current_password'):
        errors['current_password'] = 'Current password is required'
    
    if not data.get('new_password'):
        errors['new_password'] = 'New password is required'
    elif len(data['new_password']) < 8:
        errors['new_password'] = 'New password must be at least 8 characters'
    
    return errors