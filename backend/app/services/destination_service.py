from app.models import Avenue, Destination, GlobalStatus
from sqlalchemy import func
from app import db

def create_destination(data):
    # Check if destination already exists
    existing = Destination.query.filter_by(name=data['name']).first()
    if existing:
        return None, "Destination with this name already exists"
    
    destination = Destination(
        name=data['name'],
        air=data.get('air', False),
        coach=data.get('coach', False),
        train=data.get('train', False),
        status=GlobalStatus(data.get('status', GlobalStatus.INACTIVE.value))
    )
    
    db.session.add(destination)
    db.session.commit()
    return destination, None

def get_all_destinations(active_only=True):
    query = Destination.query
    if active_only:
        query = query.filter_by(status=GlobalStatus.ACTIVE)
    return query.order_by(Destination.created_at.desc()).all()

def get_destination(destination_id):
    destination = Destination.query.get(destination_id)
    if not destination:
        return None, "Destination not found"
    return destination, None

def update_destination(destination_id, data):
    destination = Destination.query.get(destination_id)
    if not destination:
        return None, "Destination not found"
    
    if 'name' in data:
        existing = Destination.query.filter(
            Destination.name == data['name'],
            Destination.id != destination_id
        ).first()
        if existing:
            return None, "Destination name is already in use by another destination"
        
    if 'air' in data:
        destination.air = data.get('air', False)

    if 'coach' in data:
        destination.coach = data.get('coach', False)

    if 'train' in data:
        destination.train = data.get('train', False)

    if 'status' in data:
        destination.status = GlobalStatus(data['status'])

    db.session.commit()
    return destination, None

def delete_destination(destination_id):
    # Retrieve the destination by ID
    destination = Destination.query.get(destination_id)
    if not destination:
        return None, "Destination not found"
    
    # Check if destination is used in any avenues as leave or arrive destination
    from app.models import Avenue
    avenues_count = Avenue.query.filter(
        (Avenue.leave_destination_id == destination_id) | 
        (Avenue.arrive_destination_id == destination_id)
    ).count()
    
    if avenues_count > 0:
        return None, "Cannot delete destination as it's being used in existing avenues"
    
    # If no related avenues, delete the destination
    db.session.delete(destination)
    db.session.commit()
    
    return destination, None

def get_destinations_by_travel_mode(travel_mode, active_only=True):
    """Get destinations available for a specific travel mode"""
    query = Destination.query
    
    if travel_mode == 'air':
        query = query.filter_by(air=True)
    elif travel_mode == 'coach':
        query = query.filter_by(coach=True)
    elif travel_mode == 'train':
        query = query.filter_by(train=True)
    else:
        return []
    
    if active_only:
        query = query.filter_by(status=GlobalStatus.ACTIVE)
    
    return query.order_by(Destination.name).all()