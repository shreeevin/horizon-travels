from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.utils.security import admin_required, get_current_user_id
from app.services.stats_service import get_admin_booking_stats, get_admin_ticket_stats, get_admin_transaction_stats, get_monthly_sales_stats, get_top_customers_stats, get_user_stats, get_admin_stats

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_stats_endpoint():
    user_id = get_current_user_id()
    stats = get_user_stats(user_id)
    
    return jsonify({
        'success': True,
        'data': [
            {
                'label': 'Total bookings',
                'value': stats['total_bookings'],
                'type': 'count'
            },
            {
                'label': 'Confirmed bookings',
                'value': stats['confirmed_bookings'],
                'type': 'count'
            },
            {
                'label': 'Cancelled bookings',
                'value': stats['cancelled_bookings'],
                'type': 'count'
            },
            {
                'label': 'Scanned bookings',
                'value': stats['scanned_bookings'],
                'type': 'count'
            }
        ]
    })

@stats_bp.route('/admin', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_stats_endpoint():
    stats = get_admin_stats()
    
    return jsonify({
        'success': True,
        'data': [
            {
                'label': 'Total bookings',
                'value': stats['total_bookings'],
                'type': 'count'
            },
            {
                'label': 'Earnings amount',
                'value': f"£ {stats['total_earnings']:.2f}",
                'type': 'currency'
            },
            {
                'label': 'Refund amount',
                'value': f"£ {stats['total_refunds']:.2f}",
                'type': 'currency'
            },
            {
                'label': 'Profit amount',
                'value': f"£ {stats['total_profit']:.2f}",
                'type': 'currency'
            },
            {
                'label': 'Total transactions',
                'value': stats['total_transactions'],
                'type': 'count'
            },
            {
                'label': 'Total users',
                'value': stats['total_users'],
                'type': 'count'
            },
            {
                'label': 'Total avenues',
                'value': stats['total_avenues'],
                'type': 'count'
            },
            {
                'label': 'Total destinations',
                'value': stats['total_destinations'],
                'type': 'count'
            }
        ]
    })

@stats_bp.route('/admin/bookings', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_booking_stats_endpoint():
    time_range = request.args.get('time_range', default=None)
    stats = get_admin_booking_stats(time_range)
    
    return jsonify({
        'success': True,
        'time_range': time_range if time_range else 'week',
        'data': stats
    })

@stats_bp.route('/admin/tickets', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_ticket_stats_endpoint():
    time_range = request.args.get('time_range', default=None)
    stats = get_admin_ticket_stats(time_range)
    
    return jsonify({
        'success': True,
        'time_range': time_range if time_range else 'week',
        'data': stats
    })

@stats_bp.route('/admin/transactions', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_transaction_stats_endpoint():
    time_range = request.args.get('time_range', default=None)
    stats = get_admin_transaction_stats(time_range)
    
    return jsonify({
        'success': True,
        'time_range': time_range if time_range else 'week',
        'data': stats
    })

@stats_bp.route('/admin/monthly-sales', methods=['GET'])
@jwt_required()
@admin_required()
def get_monthly_sales_stats_endpoint():
    stats = get_monthly_sales_stats()
    data = [{
        'label': month,
        'value': amount,
        'type': 'currency'
    } for month, amount in stats.items()]
    
    return jsonify({
        'success': True,
        'data': data
    })

@stats_bp.route('/admin/top-customers', methods=['GET'])
@jwt_required()
@admin_required()
def get_top_customers_stats_endpoint():
    limit = request.args.get('limit', default=5, type=int)
    stats = get_top_customers_stats(limit)
    data = [{
        'label': f"{customer['username']} (Bookings: {customer['booking_count']})",
        'value': customer['total_spent'],
        'type': 'currency'
    } for customer in stats]
    
    return jsonify({
        'success': True,
        'data': data
    })