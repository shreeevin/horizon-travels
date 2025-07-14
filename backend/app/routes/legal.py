from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required
from app.services.legal_service import *
from app.utils.validators import validate_legal_page_data

legal_pages_bp = Blueprint('legal_pages', __name__)

@legal_pages_bp.route('/pages', methods=['GET'])
def list_legal_pages():
    pages = get_all_legal_pages()
    return jsonify({
        'success': True,
        'pages': [{
            'id': page.id,
            'name': page.name,
            'slug': page.slug,
            'status': page.status.value,
            'content': page.content,
            'created_at': page.created_at.isoformat()
        } for page in pages]
    })

@legal_pages_bp.route('/page/<slug>', methods=['GET'])
def get_page_by_slug(slug):
    page, error = get_legal_page_by_slug(slug)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    return jsonify({
        'success': True,
        'data': {
            'id': page.id,
            'name': page.name,
            'slug': page.slug,
            'content': page.content,
            'status': page.status.value,
            'created_at': page.created_at.isoformat()
        }
    })

@legal_pages_bp.route('/detail/<int:page_id>', methods=['GET'])
def get_page_by_id(page_id):
    page, error = get_legal_page(page_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    return jsonify({
        'success': True,
        'data': {
            'id': page.id,
            'name': page.name,
            'slug': page.slug,
            'content': page.content,
            'status': page.status.value,
            'created_at': page.created_at.isoformat()
        }
    })

@legal_pages_bp.route('/create', methods=['POST'])
@jwt_required()
@admin_required()
def create_page():
    data = request.get_json()
    errors = validate_legal_page_data(data)
    if errors:
        return jsonify({
            'success': False,
            'message': 'Validation failed',
            'errors': errors
        }), 400
    
    page, error = create_legal_page(data)
    if error:
        return jsonify({
            'success': False,
            'message': 'Failed to create legal page',
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'Legal page created successfully',
        'data': {
            'id': page.id,
            'name': page.name,
            'slug': page.slug,
            'status': page.status.value
        }
    }), 201

@legal_pages_bp.route('/update/<int:page_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_page(page_id):
    data = request.get_json()
    errors = validate_legal_page_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    page, error = update_legal_page(page_id, data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Legal page updated successfully',
        'data': {
            'id': page.id,
            'name': page.name,
            'slug': page.slug,
            'status': page.status.value
        }
    })

@legal_pages_bp.route('/delete/<int:page_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_page(page_id):
    page, error = delete_legal_page(page_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Legal page deleted successfully',
        'data': {
            'id': page.id,
            'name': page.name
        }
    })