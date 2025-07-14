from app.models import Booking, BookingStatus, GlobalStatus, ScannedStatus, Transaction, TransactionStatus, TransactionType, User, Avenue, Destination
from sqlalchemy import func
from app import db
from datetime import datetime, timedelta
from sqlalchemy import extract
from calendar import month_name, day_name

def get_user_stats(user_id):
    # Get user-specific booking stats
    stats = db.session.query(
        Booking.status,
        func.count(Booking.id)
    ).filter(
        Booking.user_id == user_id
    ).group_by(Booking.status).all()
    
    status_counts = {status.value: count for status, count in stats}
    
    # Get scanned bookings (assuming confirmed bookings with some flag)
    scanned = db.session.query(
        func.count(Booking.id)
    ).filter(
        Booking.user_id == user_id,
        Booking.status == BookingStatus.CONFIRMED,
        # Add additional conditions for scanned bookings if needed
    ).scalar()
    
    return {
        'total_bookings': sum(status_counts.values()),
        'confirmed_bookings': status_counts.get(BookingStatus.CONFIRMED.value, 0),
        'cancelled_bookings': status_counts.get(BookingStatus.CANCELLED.value, 0),
        'scanned_bookings': scanned
    }

def get_admin_stats():
    # Booking stats
    booking_stats = db.session.query(
        Booking.status,
        func.count(Booking.id)
    ).group_by(Booking.status).all()
    booking_counts = {status.value: count for status, count in booking_stats}
    
    # Transaction stats
    transaction_stats = db.session.query(
        Transaction.type,
        func.sum(Transaction.amount).filter(Transaction.status == TransactionStatus.SUCCESS)
    ).group_by(Transaction.type).all()
    transaction_sums = {type.value: amount for type, amount in transaction_stats}
    
    # Total transactions (count of successful transactions)
    total_transactions = db.session.query(func.count(Transaction.id)).filter(
        Transaction.status == TransactionStatus.SUCCESS
    ).scalar()

    # Counts
    total_users = db.session.query(func.count(User.id)).scalar()
    total_avenues = db.session.query(func.count(Avenue.id)).filter(Avenue.status == GlobalStatus.ACTIVE).scalar()
    total_destinations = db.session.query(func.count(Destination.id)).filter(Destination.status == GlobalStatus.ACTIVE).scalar()
    
    return {
        'total_bookings': sum(booking_counts.values()),
        'total_earnings': transaction_sums.get(TransactionType.PAYMENT.value, 0),
        'total_refunds': transaction_sums.get(TransactionType.REFUND.value, 0),
        'total_profit': (transaction_sums.get(TransactionType.PAYMENT.value, 0) - 
                        transaction_sums.get(TransactionType.REFUND.value, 0)),
        'total_users': total_users,
        'total_avenues': total_avenues,
        'total_destinations': total_destinations,
        'total_transactions': total_transactions,
    }

def get_time_periods(time_range):
    now = datetime.now()
    if time_range == 'week':
        # Last 7 days (Sunday to Saturday)
        start_date = now - timedelta(days=now.weekday() + 1)  # Start from previous Sunday
        periods = [
            (start_date + timedelta(days=i)).strftime('%A') 
            for i in range(7)
        ]
    elif time_range == 'month':
        # Current month weeks (Week 1 to Week 4/5)
        first_day = now.replace(day=1)
        last_day = (now.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        total_weeks = (last_day.day - 1) // 7 + 1
        periods = [f"Week {i+1}" for i in range(total_weeks)]
    elif time_range == 'year':
        # All 12 months
        periods = [month_name[i] for i in range(1, 13)]
    else:
        # Default to week if no range specified
        time_range = 'week'
        start_date = now - timedelta(days=now.weekday() + 1)
        periods = [
            (start_date + timedelta(days=i)).strftime('%A') 
            for i in range(7)
        ]
    
    return time_range, periods

def get_admin_booking_stats(time_range=None):
    time_range, periods = get_time_periods(time_range)
    results = []
    
    for period in periods:
        if time_range == 'week':
            # Day of week filter
            day_num = list(day_name).index(period)
            stats = db.session.query(
                Booking.status,
                func.count(Booking.id)
            ).filter(
                extract('dow', Booking.created_at) == day_num
            ).group_by(Booking.status).all()
        elif time_range == 'month':
            # Week of month filter
            week_num = int(period.split(' ')[1])
            stats = db.session.query(
                Booking.status,
                func.count(Booking.id)
            ).filter(
                extract('week', Booking.created_at) == extract('week', datetime.now()) - (4 - week_num)
            ).group_by(Booking.status).all()
        elif time_range == 'year':
            # Month filter
            month_num = list(month_name).index(period)
            stats = db.session.query(
                Booking.status,
                func.count(Booking.id)
            ).filter(
                extract('month', Booking.created_at) == month_num
            ).group_by(Booking.status).all()
        
        completed = sum(count for status, count in stats if status == BookingStatus.CONFIRMED)
        cancelled = sum(count for status, count in stats if status == BookingStatus.CANCELLED)
        
        results.append({
            'period': period,
            'completed': completed,
            'cancelled': cancelled
        })
    
    return results

def get_admin_ticket_stats(time_range=None):
    time_range, periods = get_time_periods(time_range)
    results = []
    
    for period in periods:
        if time_range == 'week':
            day_num = list(day_name).index(period)
            stats = db.session.query(
                Booking.ticket,
                func.count(Booking.id)
            ).filter(
                Booking.status == BookingStatus.CONFIRMED,
                extract('dow', Booking.created_at) == day_num
            ).group_by(Booking.ticket).all()
        elif time_range == 'month':
            week_num = int(period.split(' ')[1])
            stats = db.session.query(
                Booking.ticket,
                func.count(Booking.id)
            ).filter(
                Booking.status == BookingStatus.CONFIRMED,
                extract('week', Booking.created_at) == extract('week', datetime.now()) - (4 - week_num)
            ).group_by(Booking.ticket).all()
        elif time_range == 'year':
            month_num = list(month_name).index(period)
            stats = db.session.query(
                Booking.ticket,
                func.count(Booking.id)
            ).filter(
                Booking.status == BookingStatus.CONFIRMED,
                extract('month', Booking.created_at) == month_num
            ).group_by(Booking.ticket).all()
        
        scanned = sum(count for ticket, count in stats if ticket == ScannedStatus.SCANNED)
        unscanned = sum(count for ticket, count in stats if ticket == ScannedStatus.UNSCANNED)
        
        results.append({
            'period': period,
            'scanned': scanned,
            'unscanned': unscanned
        })
    
    return results

def get_admin_transaction_stats(time_range=None):
    time_range, periods = get_time_periods(time_range)
    results = []
    
    for period in periods:
        if time_range == 'week':
            day_num = list(day_name).index(period)
            stats = db.session.query(
                Transaction.type,
                func.sum(Transaction.amount)
            ).filter(
                Transaction.status == TransactionStatus.SUCCESS,
                extract('dow', Transaction.created_at) == day_num
            ).group_by(Transaction.type).all()
        elif time_range == 'month':
            week_num = int(period.split(' ')[1])
            stats = db.session.query(
                Transaction.type,
                func.sum(Transaction.amount)
            ).filter(
                Transaction.status == TransactionStatus.SUCCESS,
                extract('week', Transaction.created_at) == extract('week', datetime.now()) - (4 - week_num)
            ).group_by(Transaction.type).all()
        elif time_range == 'year':
            month_num = list(month_name).index(period)
            stats = db.session.query(
                Transaction.type,
                func.sum(Transaction.amount)
            ).filter(
                Transaction.status == TransactionStatus.SUCCESS,
                extract('month', Transaction.created_at) == month_num
            ).group_by(Transaction.type).all()
        
        payment = sum(amount for type, amount in stats if type == TransactionType.PAYMENT)
        refund = sum(amount for type, amount in stats if type == TransactionType.REFUND)
        
        results.append({
            'period': period,
            'payment': payment,
            'refund': refund
        })
    
    return results

def get_monthly_sales_stats():
    """Get monthly sales breakdown for the current year"""
    current_year = datetime.now().year
    
    # Get monthly sales data
    monthly_stats = db.session.query(
        extract('month', Booking.created_at).label('month'),
        func.sum(Booking.price).label('total_sales')
    ).filter(
        Booking.status == BookingStatus.CONFIRMED,
        extract('year', Booking.created_at) == current_year
    ).group_by('month').order_by('month').all()
    
    # Format as month names with sales
    result = {
        month_name[int(month)]: float(total_sales) 
        for month, total_sales in monthly_stats
    }
    
    # Ensure all months are present (even with 0 sales)
    for i in range(1, 13):
        month = month_name[i]
        if month not in result:
            result[month] = 0.0
    
    return result

def get_top_customers_stats(limit=5):
    """Get top customers by spending"""
    top_customers = db.session.query(
        User.id,
        User.username,
        func.count(Booking.id).label('booking_count'),
        func.sum(Booking.price).label('total_spent')
    ).join(
        Booking, Booking.user_id == User.id
    ).filter(
        Booking.status == BookingStatus.CONFIRMED
    ).group_by(
        User.id, User.username
    ).order_by(
        func.sum(Booking.price).desc()
    ).limit(limit).all()
    
    return [{
        'user_id': user_id,
        'username': username,
        'booking_count': booking_count,
        'total_spent': float(total_spent)
    } for user_id, username, booking_count, total_spent in top_customers]