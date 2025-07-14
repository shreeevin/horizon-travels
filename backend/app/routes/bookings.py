from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.booking_service import *
from app.utils.validators import validate_booking_data
from app.utils.security import admin_required, get_current_user_id
from app.services.transaction_service import create_transaction

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/create', methods=['POST'])
@jwt_required()
def create_booking_endpoint():
    data = request.get_json()
    errors = validate_booking_data(data)
    if errors:
        return jsonify({
            'success': False,
            'errors': errors
        }), 400
    
    # Add current user ID
    data['user_id'] = get_current_user_id()
    booking, error = create_booking(data)
    
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    transactionData = {
        'booking_id': booking.id,
        'amount': booking.price,
        'payment_method': data['payment']
    }

    transaction, transactionerror = create_transaction(transactionData)
    
    if transactionerror:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'Booking created successfully with transaction ' + transaction.identifier,
        'data': {
            'id': booking.id,
            'identifier': booking.identifier,
            'status': booking.status.value,
            'date': booking.date.isoformat(),
            'mode': booking.mode.value,
            'type': booking.type.value,
            'seat': booking.seat,
            'price': booking.price,
            'ticket': booking.ticket.value,
            'created_at': booking.created_at.isoformat(),
            'updated_at': booking.updated_at.isoformat(),
            
            'user': {
                'id': booking.user.id,
                'username': booking.user.username,
                'email': booking.user.email,
                'role': booking.user.role.value,
            },
            'avenue': {
                'id': booking.avenue.id,
                'from': booking.avenue.leave_destination.name,
                'to': booking.avenue.arrive_destination.name,
                'leave_time': booking.avenue.leave_time.isoformat(),
                'arrive_time': booking.avenue.arrive_time.isoformat(),
                'price': booking.avenue.price,
            },
            'transactions': [
                {
                    'id': t.id,
                    'identifier': t.identifier,
                    'amount': t.amount,
                    'status': t.status.value,
                    'payment_method': t.payment_method.value,
                    'type': t.type.value,
                    'created_at': t.created_at.isoformat()
                } for t in booking.transactions
            ]
        }
    }), 201


@bookings_bp.route('/cancel/<int:booking_id>', methods=['POST'])
@jwt_required()
@admin_required()
def cancel_booking_endpoint(booking_id):
    booking, error = cancel_booking(booking_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'Booking cancelled successfully',
        'data': {
            'id': booking.id,
            'status': booking.status.value,
        }
    })

@bookings_bp.route('/user/cancel/<int:booking_id>', methods=['POST'])
@jwt_required()
def cancel_user_booking_endpoint(booking_id):
    booking_find, error_find = get_booking(booking_id)
    if error_find:
        return jsonify({
            'success': False,
            'error': error
        }), 404
    
    # Verify ownership
    if booking_find.user_id != get_current_user_id():
        return jsonify({
            'success': False,
            'error': 'Unauthorized access to booking'
        }), 403
    
    booking, error = cancel_booking(booking_id)
    if error:
        return jsonify({
            'success': False,
            'error': error
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'Booking cancelled successfully',
        'data': {
            'id': booking.id,
            'status': booking.status.value,
        }
    })

@bookings_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_bookings_endpoint():
    user_id = get_current_user_id()
    bookings = get_user_bookings(user_id)    
    return jsonify({
        'success': True,
        'data': [ 
            {
                'id': b.id,
                'identifier': b.identifier,
                'status': b.status.value,
                'date': b.date.isoformat(),
                'mode': b.mode.value,
                'type': b.type.value,
                'seat': b.seat,
                'price': b.price,
                'ticket': b.ticket.value,
                'created_at': b.created_at.isoformat(),
                'updated_at': b.updated_at.isoformat(),

                'user': {
                    'id': b.user.id,
                    'username': b.user.username,
                    'email': b.user.email,
                    'role': b.user.role.value,
                },
                'avenue': {
                    'id': b.avenue.id,
                    'leave_time': b.avenue.leave_time.isoformat(),
                    'arrive_time': b.avenue.arrive_time.isoformat(),
                    'price': b.avenue.price,
                    'leave_destination': {
                        'id': b.avenue.leave_destination.id,
                        'name': b.avenue.leave_destination.name,
                        'modes': {
                            'air': b.avenue.leave_destination.air,
                            'coach': b.avenue.leave_destination.coach,
                            'train': b.avenue.leave_destination.train
                        },
                        'status': b.avenue.leave_destination.status.value,
                        'created_at': b.avenue.leave_destination.created_at.isoformat()
                    },
                    'arrive_destination': {
                        'id': b.avenue.arrive_destination.id,
                        'name': b.avenue.arrive_destination.name,
                        'modes': {
                            'air': b.avenue.arrive_destination.air,
                            'coach': b.avenue.arrive_destination.coach,
                            'train': b.avenue.arrive_destination.train
                        },
                        'status': b.avenue.arrive_destination.status.value,
                        'created_at': b.avenue.arrive_destination.created_at.isoformat()
                    }
                },
                'transactions': [
                    {
                        'id': t.id,
                        'identifier': t.identifier,
                        'amount': t.amount,
                        'status': t.status.value,
                        'payment_method': t.payment_method.value,
                        'type': t.type.value,
                        'created_at': t.created_at.isoformat()
                    } for t in b.transactions
                ]
            } for b in bookings
        ]
    })


@bookings_bp.route('/all', methods=['GET'])
@jwt_required()
@admin_required()
def get_all_bookings_admin():
    status = request.args.get('status')
    user_id = request.args.get('user_id')
    
    bookings = get_all_bookings(status=status, user_id=user_id)
    
    return jsonify({
        'success': True,
        'data': [ 
            {
                'id': b.id,
                'identifier': b.identifier,
                'status': b.status.value,
                'date': b.date.isoformat(),
                'mode': b.mode.value,
                'type': b.type.value,
                'seat': b.seat,
                'price': b.price,
                'ticket': b.ticket.value,
                'created_at': b.created_at.isoformat(),
                'updated_at': b.updated_at.isoformat(),

                'user': {
                    'id': b.user.id,
                    'username': b.user.username,
                    'email': b.user.email,
                    'role': b.user.role.value,
                },
                'avenue': {
                    'id': b.avenue.id,
                    'leave_time': b.avenue.leave_time.isoformat(),
                    'arrive_time': b.avenue.arrive_time.isoformat(),
                    'price': b.avenue.price,
                    'leave_destination': {
                        'id': b.avenue.leave_destination.id,
                        'name': b.avenue.leave_destination.name,
                        'modes': {
                            'air': b.avenue.leave_destination.air,
                            'coach': b.avenue.leave_destination.coach,
                            'train': b.avenue.leave_destination.train
                        },
                        'status': b.avenue.leave_destination.status.value,
                        'created_at': b.avenue.leave_destination.created_at.isoformat()
                    },
                    'arrive_destination': {
                        'id': b.avenue.arrive_destination.id,
                        'name': b.avenue.arrive_destination.name,
                        'modes': {
                            'air': b.avenue.arrive_destination.air,
                            'coach': b.avenue.arrive_destination.coach,
                            'train': b.avenue.arrive_destination.train
                        },
                        'status': b.avenue.arrive_destination.status.value,
                        'created_at': b.avenue.arrive_destination.created_at.isoformat()
                    }
                },
                'transactions': [
                    {
                        'id': t.id,
                        'identifier': t.identifier,
                        'amount': t.amount,
                        'status': t.status.value,
                        'payment_method': t.payment_method.value,
                        'type': t.type.value,
                        'created_at': t.created_at.isoformat()
                    } for t in b.transactions
                ]
            } for b in bookings
        ]
    })