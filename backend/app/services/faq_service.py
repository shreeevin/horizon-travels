from app.models import FAQ, GlobalStatus
from app import db

def create_faq(data):
    faq = FAQ(
        question=data['question'],
        answer=data['answer'],
        status=GlobalStatus(data.get('status', GlobalStatus.INACTIVE.value))
    )
    db.session.add(faq)
    db.session.commit()
    return faq, None

def get_all_faqs():
    return FAQ.query.order_by(FAQ.created_at.asc()).all()

def get_faq(faq_id):
    faq = FAQ.query.get(faq_id)
    if not faq:
        return None, "FAQ not found"
    return faq, None

def update_faq(faq_id, data):
    faq = FAQ.query.get(faq_id)
    if not faq:
        return None, "FAQ not found"
    
    faq.question = data.get('question', faq.question)
    faq.answer = data.get('answer', faq.answer)
    
    if 'status' in data:
        faq.status = GlobalStatus(data['status'])
    
    db.session.commit()
    return faq, None

def delete_faq(faq_id):
    faq = FAQ.query.get(faq_id)
    if not faq:
        return None, "FAQ not found"
    
    db.session.delete(faq)
    db.session.commit()
    return faq, None