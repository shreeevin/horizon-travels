from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required
from app.services.admin_service import get_all_users, admin_update_user_password
from app.utils.validators import validate_admin_password_update

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required()
def list_users():
    users = get_all_users()
    return jsonify({
        'users': [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role.value,
            "avatar": f"https://boring-avatars-api.vercel.app/api/avatar?size=40&variant=beam&name={user.username}",
            "created_at": user.created_at,
        } for user in users]
    }), 200

@admin_bp.route('/update-password', methods=['POST'])
@jwt_required()
@admin_required()
def admin_password_update():
    data = request.get_json()
    errors = validate_admin_password_update(data)
    
    if errors:
        return jsonify({'message': 'Oops! Validation failed.', 'errors': errors}), 400
    
    try:
        user = admin_update_user_password(
            data['user_id'],
            data['new_password']
        )
        
        return jsonify({
            'message': 'Password updated successfully',
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