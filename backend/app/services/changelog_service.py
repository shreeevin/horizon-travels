from app.models import ChangeLog, GlobalStatus
from app import db

def create_changelog(data):
    existing = ChangeLog.query.filter_by(version=data['version']).first()
    if existing:
        return None, "ChangeLog with this version already exists"
    
    changelog = ChangeLog(
        name=data['name'],
        content=data['content'],
        version=data['version'],
        status=GlobalStatus(data.get('status', GlobalStatus.INACTIVE.value))
    )
    
    db.session.add(changelog)
    db.session.commit()
    return changelog, None

def get_all_changelogs(status=None):
    query = ChangeLog.query.order_by(ChangeLog.created_at.desc())
    if status:
        query = query.filter_by(status=GlobalStatus(status))
    return query.all()

def get_changelog(changelog_id):
    changelog = ChangeLog.query.get(changelog_id)
    if not changelog:
        return None, "ChangeLog not found"
    return changelog, None

def update_changelog(changelog_id, data):
    changelog = ChangeLog.query.get(changelog_id)
    if not changelog:
        return None, "ChangeLog not found"
    
    if 'version' in data:
        # Check if new version conflicts with others
        if ChangeLog.query.filter(ChangeLog.version == data['version'], ChangeLog.id != changelog_id).first():
            return None, "Another changelog with this version already exists"
        changelog.version = data['version']
    
    if 'name' in data:
        changelog.name = data['name']
    if 'content' in data:
        changelog.content = data['content']
    if 'status' in data:
        changelog.status = GlobalStatus(data['status'])
    
    db.session.commit()
    return changelog, None

def delete_changelog(changelog_id):
    changelog = ChangeLog.query.get(changelog_id)
    if not changelog:
        return None, "ChangeLog not found"
    
    db.session.delete(changelog)
    db.session.commit()
    return changelog, None