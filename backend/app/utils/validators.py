from datetime import datetime, time
from app.models import BookingStatus, ContactStatus, GlobalStatus, SeatClass, TransactionStatus, TravelMode

def validate_admin_password_update(data):
    errors = {}
    
    if not data.get('user_id'):
        errors['user_id'] = 'User ID is required'
    
    if not data.get('new_password'):
        errors['new_password'] = 'New password is required'
    elif len(data['new_password']) < 8:
        errors['new_password'] = 'Password must be at least 8 characters'
    
    return errors

def validate_legal_page_data(data, is_update=False):
    errors = {}
    
    if not is_update and not data.get('slug'):
        errors['slug'] = 'Slug is required'
    
    if not data.get('name'):
        errors['name'] = 'Page name is required'
    
    if not data.get('status'):
        errors['status'] = 'Page status is required'

    if 'status' in data:
        try:
            GlobalStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in GlobalStatus]}"

    if not data.get('content'):
        errors['content'] = 'Content is required'
    
    return errors

def validate_faq_data(data):
    errors = {}
    
    if not data.get('question'):
        errors['question'] = 'Question is required'
    elif len(data['question']) > 100:
        errors['question'] = 'Question must be less than 100 characters'
        
    if not data.get('answer'):
        errors['answer'] = 'Answer is required'
        
    if not data.get('status'):
        errors['status'] = 'Faq status is required'

    if 'status' in data:
        try:
            GlobalStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in GlobalStatus]}"

    return errors

def validate_destination_data(data):
    errors = {}
    
    if not data.get('name'):
        errors['name'] = 'Name is required'
    elif len(data['name']) > 100:
        errors['name'] = 'Name must be less than 100 characters'
    
    # Validate at least one travel mode is selected
    if not any(data.get(mode, False) for mode in ['air', 'coach', 'train']):
        errors['travel_modes'] = 'At least one travel mode must be selected'
    
    if not data.get('status'):
        errors['status'] = 'Destination status is required'

    if 'status' in data:
        try:
            GlobalStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in GlobalStatus]}"
    
    return errors

def validate_avenue_data(data):
    errors = {}
    
    if not data.get('leave_destination_id'):
        errors['leave_destination_id'] = 'Departure destination is required'
    
    if not data.get('arrive_destination_id'):
        errors['arrive_destination_id'] = 'Arrival destination is required'
    elif data.get('leave_destination_id') and data['arrive_destination_id'] == data['leave_destination_id']:
        errors['arrive_destination_id'] = 'Arrival must be different from departure'
    
    if not data.get('leave_time'):
        errors['leave_time'] = 'Departure time is required'
    else:
        try:
            time.fromisoformat(data['leave_time'])
        except ValueError:
            errors['leave_time'] = 'Invalid time format (use HH:MM:SS)'
    
    if not data.get('arrive_time'):
        errors['arrive_time'] = 'Arrival time is required'
    else:
        try:
            time.fromisoformat(data['arrive_time'])
        except ValueError:
            errors['arrive_time'] = 'Invalid time format (use HH:MM:SS)'
    
    if not data.get('price'):
        errors['price'] = 'Price is required'
    else:
        try:
            price = float(data['price'])
            if price <= 0:
                errors['price'] = 'Price must be positive'
        except ValueError:
            errors['price'] = 'Invalid price amount'
    
    if not data.get('status'):
        errors['status'] = 'Destination status is required'

    if 'status' in data:
        try:
            GlobalStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in GlobalStatus]}"
            
    return errors

def validate_contact_data(data, is_update=False):
    errors = {}
    
    if not is_update:  # Only validate these for creation
        if not data.get('name'):
            errors['name'] = 'Name is required'
        elif len(data['name']) > 100:
            errors['name'] = 'Name must be less than 100 characters'
            
        if not data.get('email'):
            errors['email'] = 'Email is required'
        elif len(data['email']) > 100:
            errors['email'] = 'Email must be less than 100 characters'
        elif '@' not in data['email']:
            errors['email'] = 'Invalid email format'
            
        if not data.get('subject'):
            errors['subject'] = 'Subject is required'
        elif len(data['subject']) > 100:
            errors['subject'] = 'Subject must be less than 100 characters'

        if not data.get('message'):
            errors['message'] = 'Message is required'
    
    if is_update and 'status' in data:
        try:
            ContactStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in ContactStatus]}"
    
    return errors

def validate_changelog_data(data):
    errors = {}
    
    if not data.get('name'):
        errors['name'] = 'Name is required'
    elif len(data['name']) > 100:
        errors['name'] = 'Name must be less than 100 characters'
        
    if not data.get('content'):
        errors['content'] = 'Content is required'
        
    if not data.get('version'):
        errors['version'] = 'Version is required'
    elif len(data['version']) > 50:
        errors['version'] = 'Version must be less than 50 characters'
    
    if 'status' in data:
        try:
            GlobalStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in GlobalStatus]}"
    
    return errors
def validate_booking_data(data):
    errors = {}
    
    if not data.get('avenue_id'):
        errors['avenue_id'] = 'Avenue is required'
    
    # if not data.get('user_id'):
    #     errors['user_id'] = 'User is required'
    
    if not data.get('date'):
        errors['date'] = 'Date is required'
    else:
        try:
            datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            errors['date'] = 'Invalid date format (YYYY-MM-DD)'
    
    if not data.get('mode'):
        errors['mode'] = 'Travel mode is required'
    else:
        try:
            TravelMode(data['mode'])
        except ValueError:
            errors['mode'] = f"Invalid travel mode. Must be one of: {[m.value for m in TravelMode]}"
    
    if not data.get('type'):
        errors['type'] = 'Seat class is required'
    else:
        try:
            SeatClass(data['type'])
        except ValueError:
            errors['type'] = f"Invalid seat class. Must be one of: {[s.value for s in SeatClass]}"
    
    if not data.get('seat'):
        errors['seat'] = 'Seat number is required'
    elif not isinstance(data['seat'], int) or data['seat'] <= 0:
        errors['seat'] = 'Seat must be a positive integer'
    
    if not data.get('price'):
        errors['price'] = 'Price is required'
    elif not isinstance(data['price'], (int, float)) or data['price'] <= 0:
        errors['price'] = 'Price must be a positive number'
    
    return errors

def validate_booking_status(data):
    errors = {}
    
    if not data.get('status'):
        errors['status'] = 'Status is required'
    else:
        try:
            BookingStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in BookingStatus]}"
    
    return errors

def validate_transaction_filters(data):
    errors = {}
    
    if 'status' in data:
        try:
            TransactionStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in TransactionStatus]}"
    
    if 'booking_id' in data and not isinstance(data['booking_id'], int):
        errors['booking_id'] = 'Booking ID must be an integer'
    
    return errors

def validate_transaction_status(data):
    errors = {}
    
    if not data.get('status'):
        errors['status'] = 'Status is required'
    else:
        try:
            TransactionStatus(data['status'])
        except ValueError:
            errors['status'] = f"Invalid status. Must be one of: {[s.value for s in TransactionStatus]}"
    
    return errors