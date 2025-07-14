from flask import Blueprint, request, jsonify
from app.services.auth_service import register_user, authenticate_user, update_user_password
from app.utils.security import validate_password_change_data, validate_registration_data
from app.utils.security import create_access_token_for_user, get_current_user
from flask_jwt_extended import jwt_required, create_refresh_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    errors = validate_registration_data(data)
    
    if errors:
        return jsonify({'message': 'Oops! Registration failed.', 'errors': errors}), 400
    
    try:
        user = register_user(data)
        access_token = create_access_token_for_user(user)
        refresh_token = create_refresh_token(identity=user.username)

        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.value,
                "avatar": f"https://boring-avatars-api.vercel.app/api/avatar?size=40&variant=beam&name={user.username}",
                "created_at": user.created_at,
            }
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Username and password are required'}), 400
    
    user = authenticate_user(data['username'], data['password'])
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    access_token = create_access_token_for_user(user)
    refresh_token = create_refresh_token(identity=user.username)

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role.value,
            "avatar": f"https://boring-avatars-api.vercel.app/api/avatar?size=40&variant=beam&name={user.username}",
            "created_at": user.created_at,
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_info():
    user = get_current_user()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role.value,
        "avatar": f"https://boring-avatars-api.vercel.app/api/avatar?size=40&variant=beam&name={user.username}",
        "created_at": user.created_at,
    }), 200

@auth_bp.route('/update-password', methods=['POST'])
@jwt_required()
def update_password():
    user = get_current_user()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    errors = validate_password_change_data(data)
    
    if errors:
        return jsonify({'message': 'Oops! Validation failed.', 'errors': errors}), 400
    
    try:
        updated_user = update_user_password(
            user,
            data['current_password'],
            data['new_password']
        )
        
        # Create new token since password changed
        new_token = create_access_token_for_user(updated_user)
        refresh_token = create_refresh_token(identity=user.username)
        
        return jsonify({
            'message': 'Password updated successfully',
            'access_token': new_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.value,
                "avatar": f"https://boring-avatars-api.vercel.app/api/avatar?size=40&variant=beam&name={user.username}",
                "created_at": user.created_at,
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Failed to update password'}), 500