from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required
from app.services.contact_service import *
from app.utils.validators import validate_contact_data

contacts_bp = Blueprint('contacts', __name__)

@contacts_bp.route('/all', methods=['GET'])
@jwt_required()
@admin_required()
def list_contacts():
    status = request.args.get('status')
    contacts = get_all_contacts(status)
    
    return jsonify({
        'success': True,
        'data': [{
            'id': contact.id,
            'name': contact.name,
            'email': contact.email,
            'subject': contact.subject,
            'message': contact.message,
            'status': contact.status.value,
            'created_at': contact.created_at.isoformat()
        } for contact in contacts]
    })

@contacts_bp.route('/detail/<int:contact_id>', methods=['GET'])
@jwt_required()
@admin_required()
def get_contact_details(contact_id):
    contact, error = get_contact(contact_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'id': contact.id,
            'name': contact.name,
            'email': contact.email,
            'subject': contact.subject,
            'message': contact.message,
            'status': contact.status.value,
            'created_at': contact.created_at.isoformat()
        }
    })

@contacts_bp.route('/create', methods=['POST'])
def create_contact_endpoint():
    data = request.get_json()
    errors = validate_contact_data(data, is_update=False)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    contact, error = create_contact(data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'Contact message submitted successfully',
        'data': {
            'id': contact.id,
            'name': contact.name,
            'email': contact.email
        }
    }), 201

@contacts_bp.route('/update/<int:contact_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_contact_endpoint(contact_id):
    data = request.get_json()
    errors = validate_contact_data(data, is_update=True)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    contact, error = update_contact(contact_id, data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Contact updated successfully',
        'data': {
            'id': contact.id,
            'status': contact.status.value
        }
    })

@contacts_bp.route('/delete/<int:contact_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_contact_endpoint(contact_id):
    contact, error = delete_contact(contact_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Contact deleted successfully',
        'data': {
            'id': contact.id
        }
    })