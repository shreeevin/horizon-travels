from app.models import LegalPage, GlobalStatus
from app import db

def create_legal_page(data):
    existing = LegalPage.query.filter_by(slug=data['slug']).first()
    if existing:
        return None, "Slug already exists"
    
    page = LegalPage(
        name=data['name'],
        slug=data['slug'],
        content=data['content'],
        status=GlobalStatus(data.get('status', GlobalStatus.INACTIVE.value))
    )
    db.session.add(page)
    db.session.commit()
    return page, None

def get_all_legal_pages():
    return LegalPage.query.order_by(LegalPage.created_at.desc()).all()

def get_legal_page(page_id):
    page = LegalPage.query.get(page_id)
    if not page:
        return None, "Legal page not found"
    return page, None

def get_legal_page_by_slug(slug):
    page = LegalPage.query.filter_by(slug=slug).first()
    if not page:
        return None, "Legal page not found"
    return page, None

def update_legal_page(page_id, data):
    page = LegalPage.query.get(page_id)
    if not page:
        return None, "Legal page not found"
    
    if 'slug' in data:
        existing = LegalPage.query.filter(
            LegalPage.slug == data['slug'],
            LegalPage.id != page_id
        ).first()
        if existing:
            return None, "Slug already in use by another page"
    
    page.name = data.get('name', page.name)
    page.slug = data.get('slug', page.slug)
    page.content = data.get('content', page.content)
    
    if 'status' in data:
        page.status = GlobalStatus(data['status'])
    
    db.session.commit()
    return page, None

def delete_legal_page(page_id):
    page = LegalPage.query.get(page_id)
    if not page:
        return None, "Legal page not found"
    
    db.session.delete(page)
    db.session.commit()
    return page, None