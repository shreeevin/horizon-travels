from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required
from app.services.transaction_service import *
from app.utils.validators import validate_transaction_status

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/all', methods=['GET'])
@jwt_required()
@admin_required()
def list_transactions():
    status = request.args.get('status')
    booking_id = request.args.get('booking_id')
    
    transactions = get_all_transactions(status=status, booking_id=booking_id)
    
    return jsonify({
        'success': True,
        'data': [{
            'id': t.id,
            'identifier': t.identifier,
            'booking_id': t.booking_id,
            'amount': t.amount,
            'payment_method': t.payment_method.value,
            'status': t.status.value,
            'type': t.type.value,
            'created_at': t.created_at.isoformat(),
            'booking': {
                'id': t.booking.id,
                'identifier': t.booking.identifier,
                'status': t.booking.status.value,
                'date': t.booking.date.isoformat(),
                'mode': t.booking.mode.value,
                'type': t.booking.type.value,
                'seat': t.booking.seat,
                'price': t.booking.price,
                'ticket': t.booking.ticket.value,
                'created_at': t.booking.created_at.isoformat(),
                'updated_at': t.booking.updated_at.isoformat(),
                
                'user': {
                    'id': t.booking.user.id,
                    'username': t.booking.user.username,
                    'email': t.booking.user.email,
                    'role': t.booking.user.role.value,
                },
                'avenue': {
                    'id': t.booking.avenue.id,
                    'leave_time': t.booking.avenue.leave_time.isoformat(),
                    'arrive_time': t.booking.avenue.arrive_time.isoformat(),
                    'price': t.booking.avenue.price,
                    'leave_destination': {
                        'id': t.booking.avenue.leave_destination.id,
                        'name': t.booking.avenue.leave_destination.name,
                        'modes': {
                            'air': t.booking.avenue.leave_destination.air,
                            'coach': t.booking.avenue.leave_destination.coach,
                            'train': t.booking.avenue.leave_destination.train
                        },
                        'status': t.booking.avenue.leave_destination.status.value,
                        'created_at': t.booking.avenue.leave_destination.created_at.isoformat()
                    },
                    'arrive_destination': {
                        'id': t.booking.avenue.arrive_destination.id,
                        'name': t.booking.avenue.arrive_destination.name,
                        'modes': {
                            'air': t.booking.avenue.arrive_destination.air,
                            'coach': t.booking.avenue.arrive_destination.coach,
                            'train': t.booking.avenue.arrive_destination.train
                        },
                        'status': t.booking.avenue.arrive_destination.status.value,
                        'created_at': t.booking.avenue.arrive_destination.created_at.isoformat()
                    }
                },
            }
        } for t in transactions]
    })