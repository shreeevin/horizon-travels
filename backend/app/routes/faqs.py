from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required
from app.services.faq_service import *
from app.utils.validators import validate_faq_data

faqs_bp = Blueprint('faqs', __name__)

@faqs_bp.route('/all', methods=['GET'])
def get_all():
    faqs = get_all_faqs()
    return jsonify({
        'success': True,
        'data': [{
            'id': faq.id,
            'question': faq.question,
            'answer': faq.answer,
            'status': faq.status.value,
            'created_at': faq.created_at.isoformat()
        } for faq in faqs]
    })

@faqs_bp.route('/detail/<int:faq_id>', methods=['GET'])
def get_detail(faq_id):
    faq, error = get_faq(faq_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    return jsonify({
        'success': True,
        'data': {
            'id': faq.id,
            'question': faq.question,
            'answer': faq.answer,
            'status': faq.status.value,
            'created_at': faq.created_at.isoformat()
        }
    })

@faqs_bp.route('/create', methods=['POST'])
@jwt_required()
@admin_required()
def create():
    data = request.get_json()
    errors = validate_faq_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    faq, error = create_faq(data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'FAQ created successfully',
        'data': {
            'id': faq.id,
            'question': faq.question,
            'status': faq.status.value
        }
    }), 201

@faqs_bp.route('/update/<int:faq_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update(faq_id):
    data = request.get_json()
    errors = validate_faq_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    faq, error = update_faq(faq_id, data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'FAQ updated successfully',
        'data': {
            'id': faq.id,
            'question': faq.question,
            'status': faq.status.value
        }
    })

@faqs_bp.route('/delete/<int:faq_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete(faq_id):
    faq, error = delete_faq(faq_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'FAQ deleted successfully',
        'data': {
            'id': faq.id,
            'question': faq.question
        }
    })