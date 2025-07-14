from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required
from app.services.destination_service import *
from app.utils.validators import validate_destination_data

destinations_bp = Blueprint('destinations', __name__)

@destinations_bp.route('/all', methods=['GET'])
def list_destinations():
    active_only = request.args.get('active', 'true').lower() == 'true'
    travel_mode = request.args.get('travel_mode')
    
    if travel_mode:
        destinations = get_destinations_by_travel_mode(travel_mode)
    else:
        destinations = get_all_destinations(active_only)
    
    return jsonify({
        'success': True,
        'data': [{
            'id': dest.id,
            'name': dest.name,
            'modes': {
                'air': dest.air,
                'coach': dest.coach,
                'train': dest.train
            },
            'status': dest.status.value,
            'created_at': dest.created_at.isoformat()
        } for dest in destinations]
    })

@destinations_bp.route('/detail/<int:destination_id>', methods=['GET'])
def get_destination_details(destination_id):
    destination, error = get_destination(destination_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'id': destination.id,
            'name': destination.name,
            'modes': {
                'air': destination.air,
                'coach': destination.coach,
                'train': destination.train
            },
            'status': destination.status.value,
            'created_at': destination.created_at.isoformat()
        }
    })

@destinations_bp.route('/create', methods=['POST'])
@jwt_required()
@admin_required()
def create_destination_endpoint():
    data = request.get_json()
    errors = validate_destination_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    destination, error = create_destination(data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'Destination created successfully',
        'data': {
            'id': destination.id,
            'name': destination.name,
            'status': destination.status.value
        }
    }), 201

@destinations_bp.route('/update/<int:destination_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_destination_endpoint(destination_id):
    data = request.get_json()
    errors = validate_destination_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    destination, error = update_destination(destination_id, data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Destination updated successfully',
        'data': {
            'id': destination.id,
            'name': destination.name,
            'status': destination.status.value
        }
    })

@destinations_bp.route('/delete/<int:destination_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_destination_endpoint(destination_id):
    destination, error = delete_destination(destination_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Destination deactivated successfully',
        'data': {
            'id': destination.id,
            'name': destination.name,
            'status': destination.status.value
        }
    })