from app.models import User
from app import db

def register_user(data):
    if User.query.filter_by(username=data['username']).first():
        raise Exception('Username already exists')
    
    if User.query.filter_by(email=data['email']).first():
        raise Exception('Email already exists')
    
    user = User(
        username=data['username'],
        email=data['email']
    )

    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return user

def authenticate_user(username, password):
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        return user
    return None

def update_user_password(user, current_password, new_password):
    if not user.check_password(current_password):
        raise ValueError("Current password is incorrect")
    
    if len(new_password) < 8:
        raise ValueError("New password must be at least 8 characters")
    
    user.set_password(new_password)
    db.session.commit()
    
    return user