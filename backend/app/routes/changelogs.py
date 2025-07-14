from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required
from app.services.changelog_service import *
from app.utils.validators import validate_changelog_data

changelogs_bp = Blueprint('changelogs', __name__)

@changelogs_bp.route('/all', methods=['GET'])
def list_changelogs():
    status = request.args.get('status')
    changelogs = get_all_changelogs(status)
    
    return jsonify({
        'success': True,
        'data': [{
            'id': changelog.id,
            'name': changelog.name,
            'content': changelog.content,
            'version': changelog.version,
            'status': changelog.status.value,
            'created_at': changelog.created_at.isoformat()
        } for changelog in changelogs]
    })

@changelogs_bp.route('/detail/<int:changelog_id>', methods=['GET'])
def get_changelog_details(changelog_id):
    changelog, error = get_changelog(changelog_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'id': changelog.id,
            'name': changelog.name,
            'content': changelog.content,
            'version': changelog.version,
            'status': changelog.status.value,
            'created_at': changelog.created_at.isoformat()
        }
    })

@changelogs_bp.route('/create', methods=['POST'])
@jwt_required()
@admin_required()
def create_changelog_endpoint():
    data = request.get_json()
    errors = validate_changelog_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    changelog, error = create_changelog(data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'ChangeLog created successfully',
        'data': {
            'id': changelog.id,
            'name': changelog.name,
            'version': changelog.version,
            'status': changelog.status.value
        }
    }), 201

@changelogs_bp.route('/update/<int:changelog_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_changelog_endpoint(changelog_id):
    data = request.get_json()
    errors = validate_changelog_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    changelog, error = update_changelog(changelog_id, data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'ChangeLog updated successfully',
        'data': {
            'id': changelog.id,
            'name': changelog.name,
            'version': changelog.version,
            'status': changelog.status.value
        }
    })

@changelogs_bp.route('/delete/<int:changelog_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_changelog_endpoint(changelog_id):
    changelog, error = delete_changelog(changelog_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'ChangeLog deleted successfully',
        'data': {
            'id': changelog.id,
            'name': changelog.name
        }
    })