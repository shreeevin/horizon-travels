from app.models import Booking, SeatClass, Transaction, BookingStatus, TransactionStatus, TransactionType, TravelMode
from app import db
from datetime import datetime, timezone, date, timedelta
import secrets

def create_booking(data):
    try:
        booking = Booking(
            identifier=f"BK-{secrets.token_hex(8)}",
            avenue_id=data['avenue_id'],
            user_id=data['user_id'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            mode=TravelMode(data['mode']),
            type=SeatClass(data['type']),
            seat=data['seat'],
            price=data['price'],
            status=BookingStatus.CONFIRMED,
        )
        
        db.session.add(booking)
        db.session.commit()
        return booking, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)

def get_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return None, "Booking not found"
    return booking, None

def update_booking_status(booking_id, new_status):
    booking = Booking.query.get(booking_id)
    if not booking:
        return None, "Booking not found"
    
    try:
        booking.status = BookingStatus(new_status)
        booking.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return booking, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)

def cancel_booking(booking_id):
    booking, error = get_booking(booking_id)
    if error:
        return None, error

    try:
        existing_refund = next(
            (t for t in booking.transactions 
                if t.type == TransactionType.REFUND), 
            None
        )
        if existing_refund:
            return None, "Refund already in progress"

        # Update booking status
        booking.status = BookingStatus.CANCELLED
        booking.updated_at = datetime.now(timezone.utc)

        # Find successful payment
        successful_payment = next(
            (t for t in booking.transactions 
                if t.status == TransactionStatus.SUCCESS and t.type == TransactionType.PAYMENT), 
            None
        )

        if successful_payment:
            today = date.today()
            days_before = ((booking.date) - today).days

            if days_before > 60:
                refund_percentage = 1.0  # 100%
            elif 40 <= days_before <= 50:
                refund_percentage = 0.6  # 60%
            else:
                refund_percentage = 0.0  # 0%

            refund_amount = successful_payment.amount * refund_percentage

            print(f"days_before: {days_before}")
            print(f"refund_amount: {refund_amount}")
            print(f"successful_payment: {successful_payment}")
            print(f"booking.price: {booking.price}")

            if refund_amount > 0:
                refund = Transaction(
                    identifier=f"RF-{secrets.token_hex(8)}",
                    booking_id=booking.id,
                    amount=refund_amount,
                    payment_method=successful_payment.payment_method,
                    status=TransactionStatus.SUCCESS,
                    type=TransactionType.REFUND
                )
                db.session.add(refund)

        db.session.commit()
        return booking, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)

def get_user_bookings(user_id):
    return Booking.query.filter_by(user_id=user_id).order_by(Booking.date.desc()).all()

def get_all_bookings(status=None, user_id=None):
    query = Booking.query
    
    if status:
        query = query.filter_by(status=BookingStatus(status))
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    return query.order_by(Booking.created_at.desc()).all()