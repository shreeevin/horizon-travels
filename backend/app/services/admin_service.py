from app.models import User
from app import db

def get_all_users():
    return User.query.all()

def admin_update_user_password(user_id, new_password):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")
    
    if len(new_password) < 8:
        raise ValueError("New password must be at least 8 characters")
    
    user.set_password(new_password)
    db.session.commit()
    return user