from app.models import Contact, ContactStatus
from app import db

def create_contact(data):
    contact = Contact(
        name=data['name'],
        email=data['email'],
        subject=data['subject'],
        message=data['message'],
        status=ContactStatus.UNREAD
    )
    
    db.session.add(contact)
    db.session.commit()
    return contact, None

def get_all_contacts(status=None):
    query = Contact.query
    if status:
        query = query.filter_by(status=ContactStatus(status))
    return query.order_by(Contact.created_at.desc()).all()

def get_contact(contact_id):
    contact = Contact.query.get(contact_id)
    if not contact:
        return None, "Contact not found"
    return contact, None

def update_contact(contact_id, data):
    contact = Contact.query.get(contact_id)
    if not contact:
        return None, "Contact not found"
    
    # Only these fields can be updated
    if 'status' in data:
        contact.status = ContactStatus(data['status'])
    
    db.session.commit()
    return contact, None

def delete_contact(contact_id):
    contact = Contact.query.get(contact_id)
    if not contact:
        return None, "Contact not found"
    
    db.session.delete(contact)
    db.session.commit()
    return contact, None