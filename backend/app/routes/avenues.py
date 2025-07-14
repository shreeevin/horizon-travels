from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required
from app.services.avenue_service import *
from app.utils.validators import validate_avenue_data

avenues_bp = Blueprint('avenues', __name__)

@avenues_bp.route('/all', methods=['GET'])
def list_avenues():
    leave_id = request.args.get('leave_id')
    arrive_id = request.args.get('arrive_id')
    
    avenues = get_avenues_by_destinations(leave_id, arrive_id) if any([leave_id, arrive_id]) else get_all_avenues()
    
    return jsonify({
        'success': True,
        'data': [{
            'id': avenue.id,
            'leave_destination': {
                'id': avenue.leave_destination_id,
                'name': avenue.leave_destination.name,
                'modes': {
                    'air': avenue.leave_destination.air,
                    'coach': avenue.leave_destination.coach,
                    'train': avenue.leave_destination.train
                },
                'status': avenue.leave_destination.status.value,
                'created_at': avenue.leave_destination.created_at.isoformat()
            },
            'arrive_destination': {
                'id': avenue.arrive_destination_id,
                'name': avenue.arrive_destination.name,
                'modes': {
                    'air': avenue.arrive_destination.air,
                    'coach': avenue.arrive_destination.coach,
                    'train': avenue.arrive_destination.train
                },
                'status': avenue.arrive_destination.status.value,
                'created_at': avenue.arrive_destination.created_at.isoformat()
            },
            'leave_time': avenue.leave_time.isoformat(),
            'arrive_time': avenue.arrive_time.isoformat(),
            'price': {
                'air': 0 if not avenue.leave_destination.air or not avenue.arrive_destination.air else avenue.price,
                'coach': 0 if not avenue.leave_destination.coach or not avenue.arrive_destination.coach else avenue.price / (1/3),
                'train': 0 if not avenue.leave_destination.train or not avenue.arrive_destination.train else avenue.price * 3
            },
            'seats': {
                'air': 140,
                'coach': 50,
                'train': 240
            },
            'status': avenue.status.value,
            'created_at': avenue.created_at.isoformat()
        } for avenue in avenues]
    })

@avenues_bp.route('/detail/<int:avenue_id>', methods=['GET'])
def get_avenue_details(avenue_id):
    avenue, error = get_avenue(avenue_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'id': avenue.id,
            'leave_destination': {
                'id': avenue.leave_destination_id,
                'name': avenue.leave_destination.name,
                'modes': {
                    'air': avenue.leave_destination.air,
                    'coach': avenue.leave_destination.coach,
                    'train': avenue.leave_destination.train
                },
                'status': avenue.leave_destination.status.value,
                'created_at': avenue.leave_destination.created_at.isoformat()
            },
            'arrive_destination': {
                'id': avenue.arrive_destination_id,
                'name': avenue.arrive_destination.name,
                'modes': {
                    'air': avenue.arrive_destination.air,
                    'coach': avenue.arrive_destination.coach,
                    'train': avenue.arrive_destination.train
                },
                'status': avenue.arrive_destination.status.value,
                'created_at': avenue.arrive_destination.created_at.isoformat()
            },
            'leave_time': avenue.leave_time.isoformat(),
            'arrive_time': avenue.arrive_time.isoformat(),
            'price': {
                'air': 0 if not avenue.leave_destination.air or not avenue.arrive_destination.air else avenue.price,
                'coach': 0 if not avenue.leave_destination.coach or not avenue.arrive_destination.coach else avenue.price / (1/3),
                'train': 0 if not avenue.leave_destination.train or not avenue.arrive_destination.train else avenue.price * 3
            },
            'status': avenue.status.value,
            'created_at': avenue.created_at.isoformat()
        }
    })

@avenues_bp.route('/create', methods=['POST'])
@jwt_required()
@admin_required()
def create_avenue_endpoint():
    data = request.get_json()
    errors = validate_avenue_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    avenue, error = create_avenue(data)
    if error:
        return jsonify({
            'success': False,
            'message': error,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'Avenue created successfully',
        'data': {
            'id': avenue.id,
            'leave_destination_id': avenue.leave_destination_id,
            'arrive_destination_id': avenue.arrive_destination_id,
            'price': avenue.price
        }
    }), 201

@avenues_bp.route('/update/<int:avenue_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_avenue_endpoint(avenue_id):
    data = request.get_json()
    errors = validate_avenue_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    avenue, error = update_avenue(avenue_id, data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Avenue updated successfully',
        'data': {
            'id': avenue.id,
            'leave_destination_id': avenue.leave_destination_id,
            'arrive_destination_id': avenue.arrive_destination_id,
            'price': avenue.price
        }
    })

@avenues_bp.route('/delete/<int:avenue_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_avenue_endpoint(avenue_id):
    avenue, error = delete_avenue(avenue_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Avenue deleted successfully',
        'data': {
            'id': avenue.id,
            'leave_destination_id': avenue.leave_destination_id,
            'arrive_destination_id': avenue.arrive_destination_id
        }
    })


@avenues_bp.route('/available', methods=['POST'])
def get_available_avenues_endpoint():
    data = request.get_json()

    # Validate required fields
    if not data.get('from'):
        return jsonify({
            'success': False,
            'error': 'Departure destination is required'
        }), 400
    
    if not data.get('date'):
        return jsonify({
            'success': False,
            'error': 'Journey date is required'
        }), 400
    
    try:
        journey_date = datetime.fromisoformat(data['date']).date()
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Invalid date format (use ISO format)'
        }), 400
    
    if not isinstance(data.get('passenger', 0), int) or data['passenger'] <= 0:
        return jsonify({
            'success': False,
            'error': 'Passenger count must be positive integer'
        }), 400
    
    # Get available avenues
    results, error = get_available_avenues(data)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'data': [{
            'id': result['avenue'].id,
            'leave_destination': {
                'id': result['avenue'].leave_destination.id,
                'name': result['avenue'].leave_destination.name,
                'modes': {
                    'air': result['avenue'].leave_destination.air,
                    'coach': result['avenue'].leave_destination.coach,
                    'train': result['avenue'].leave_destination.train
                },
                'status': result['avenue'].leave_destination.status.value,
                'created_at': result['avenue'].leave_destination.created_at.isoformat()
            },
            'arrive_destination': {
                'id': result['avenue'].arrive_destination.id,
                'name': result['avenue'].arrive_destination.name,
                'modes': {
                    'air': result['avenue'].arrive_destination.air,
                    'coach': result['avenue'].arrive_destination.coach,
                    'train': result['avenue'].arrive_destination.train
                },
                'status': result['avenue'].arrive_destination.status.value,
                'created_at': result['avenue'].arrive_destination.created_at.isoformat()
            },
            'leave_time': result['avenue'].leave_time.isoformat(),
            'arrive_time': result['avenue'].arrive_time.isoformat(),
            'travel_mode': result['mode'].value,
            'prices': result['prices'],
            'seat_availability': result['seat_availability'],
            'discount': result['discount'],
            'max_seats': result['max_seats'],
            'booked_seats': result['booked_seats']
        } for result in results]
    })