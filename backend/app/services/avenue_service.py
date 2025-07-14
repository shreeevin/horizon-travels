from app.models import Avenue, Booking, BookingStatus, GlobalStatus, TravelMode
from datetime import time
from sqlalchemy.exc import IntegrityError
from app import db
from datetime import datetime
from sqlalchemy import func

def create_avenue(data):
    # Check if avenue already exists
    existing = Avenue.query.filter_by(
        leave_destination_id=data['leave_destination_id'],
        arrive_destination_id=data['arrive_destination_id'],
        leave_time=time.fromisoformat(data['leave_time']),
        arrive_time=time.fromisoformat(data['arrive_time'])
    ).first()
    
    if existing:
        return None, "Avenue with these details already exists"
    
    try:
        avenue = Avenue(
            leave_destination_id=data['leave_destination_id'],
            arrive_destination_id=data['arrive_destination_id'],
            leave_time=time.fromisoformat(data['leave_time']),
            arrive_time=time.fromisoformat(data['arrive_time']),
            price=float(data['price']),
            status=GlobalStatus(data.get('status', GlobalStatus.INACTIVE.value))
        )
        
        db.session.add(avenue)
        db.session.commit()
        return avenue, None
        
    except IntegrityError:
        db.session.rollback()
        return None, "Invalid destination IDs provided"
    except ValueError as e:
        db.session.rollback()
        return None, str(e)

def get_all_avenues():
    return Avenue.query.order_by(Avenue.leave_time).all()

def get_avenue(avenue_id):
    avenue = Avenue.query.get(avenue_id)
    if not avenue:
        return None, "Avenue not found"
    return avenue, None

def update_avenue(avenue_id, data):
    avenue = Avenue.query.get(avenue_id)
    if not avenue:
        return None, "Avenue not found"
    
    try:
        if 'leave_destination_id' in data:
            avenue.leave_destination_id = data['leave_destination_id']
        
        if 'arrive_destination_id' in data:
            avenue.arrive_destination_id = data['arrive_destination_id']
        
        if 'leave_time' in data:
            avenue.leave_time = time.fromisoformat(data['leave_time'])
        
        if 'arrive_time' in data:
            avenue.arrive_time = time.fromisoformat(data['arrive_time'])
        
        if 'price' in data:
            avenue.price = float(data['price'])
        
        if 'status' in data:
            avenue.status = GlobalStatus(data['status'])

        db.session.commit()
        return avenue, None
        
    except IntegrityError:
        db.session.rollback()
        return None, "Invalid destination IDs provided"
    except ValueError as e:
        db.session.rollback()
        return None, str(e)

def delete_avenue(avenue_id):
    avenue = Avenue.query.get(avenue_id)
    if not avenue:
        return None, "Avenue not found"
    
    db.session.delete(avenue)
    db.session.commit()
    return avenue, None

def get_avenues_by_destinations(leave_id=None, arrive_id=None):
    """Filter avenues by departure and/or arrival destinations"""
    query = Avenue.query
    
    if leave_id:
        query = query.filter_by(leave_destination_id=leave_id)
    if arrive_id:
        query = query.filter_by(arrive_destination_id=arrive_id)
    
    return query.order_by(Avenue.leave_time).all()


def get_available_avenues(data):
    # Validate input
    if not data.get('from'):
        return None, "Departure destination is required"
    
    try:
        journey_date = datetime.fromisoformat(data['date']).date()
    except:
        return None, "Invalid date format (use ISO format)"
    
    if not isinstance(data.get('passenger', 0), int) or data['passenger'] <= 0:
        return None, "Passenger count must be positive integer"
    
    # Base query
    query = Avenue.query.filter_by(status=GlobalStatus.ACTIVE)
    
    # Filter by departure
    query = query.filter(Avenue.leave_destination_id == data['from'])
    
    # Filter by arrival if provided
    if data.get('to'):
        query = query.filter(Avenue.arrive_destination_id == data['to'])
    
    avenues = query.all()
    
    results = []
    today = datetime.now().date()
    days_advance = (journey_date - today).days
    
    # Get requested mode if provided
    requested_mode = data.get('mode')
    if requested_mode:
        try:
            requested_mode = TravelMode(requested_mode)
        except ValueError:
            return None, f"Invalid travel mode. Must be one of: {[m.value for m in TravelMode]}"
    
    for avenue in avenues:
        # Get travel modes supported by both destinations
        departure = avenue.leave_destination
        arrival = avenue.arrive_destination
        
        supported_modes = []
        if departure.air and arrival.air:
            supported_modes.append(TravelMode.AIR)
        if departure.coach and arrival.coach:
            supported_modes.append(TravelMode.COACH)
        if departure.train and arrival.train:
            supported_modes.append(TravelMode.TRAIN)
        
        # Skip if no common modes
        if not supported_modes:
            continue
        
        # If specific mode requested, filter to only that mode
        if requested_mode:
            if requested_mode not in supported_modes:
                continue
            supported_modes = [requested_mode]
        
        # Process each supported travel mode
        for mode in supported_modes:
            # Calculate max seats based on travel mode
            max_seats = {
                TravelMode.AIR: 140,
                TravelMode.COACH: 50,
                TravelMode.TRAIN: 240
            }.get(mode, 140)
            
            # Get confirmed bookings for this avenue on this date for this mode
            booked_seats = db.session.query(
                func.sum(Booking.seat)
            ).filter(
                Booking.avenue_id == avenue.id,
                Booking.date == journey_date,
                Booking.status == BookingStatus.CONFIRMED,
                Booking.mode == mode
            ).scalar() or 0
            
            available_seats = max_seats - booked_seats
            
            if available_seats <= 0:
                continue  # Skip fully booked modes
            
            # Calculate discount based on advance booking
            if days_advance >= 91:
                discount = 30
            elif days_advance >= 80:
                discount = 20
            elif days_advance >= 60:
                discount = 10
            elif days_advance >= 45:
                discount = 5
            else:
                discount = 0
            
            # Calculate prices for each class
            base_price = avenue.price
            if mode == TravelMode.COACH:
                base_price = avenue.price / 3
            elif mode == TravelMode.TRAIN:
                base_price = avenue.price * 3
            
            prices = {
                'economy': base_price * (1 - discount/100),
                'business': base_price * 2 * (1 - discount/100),
                'first': base_price * 3 * (1 - discount/100)
            }
            
            # Calculate available seats by class
            seat_availability = {
                'economy': int(available_seats * 0.6),
                'business': int(available_seats * 0.2),
                'first': int(available_seats * 0.2)
            }
            
            results.append({
                'avenue': avenue,
                'mode': mode,
                'prices': prices,
                'seat_availability': seat_availability,
                'discount': discount,
                'max_seats': max_seats,
                'booked_seats': booked_seats
            })
    
    return results, None