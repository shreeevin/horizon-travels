from app import db
from datetime import datetime
from passlib.hash import pbkdf2_sha256
from enum import Enum
from datetime import datetime, timezone
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class UserRole(Enum):
    MEMBER = 'member'
    ADMIN = 'admin'

class ContactStatus(Enum):
    UNREAD = 'unread'
    READ = 'read'

class TravelMode(Enum):
    AIR = 'air'
    COACH = 'coach'
    TRAIN = 'train'

class SeatClass(Enum):
    ECONOMY = 'economy'
    BUSINESS = 'business'
    FIRST = 'first'

class BookingStatus(Enum):
    CONFIRMED = 'confirmed'
    CANCELLED = 'cancelled'
    PENDING = 'pending'

class ScannedStatus(Enum):
    SCANNED = 'scanned'
    UNSCANNED = 'unscanned'

class PaymentMethod(Enum):
    PAYPAL = 'paypal'
    REVOLUT = 'revolut'
    STRIPE = 'stripe'
    
class GlobalStatus(Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'

class TransactionStatus(Enum):
    SUCCESS = 'success'
    FAILED = 'failed'
    PENDING = 'pending'

class TransactionType(Enum):
    PAYMENT = 'payment'
    REFUND = 'refund'

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = pbkdf2_sha256.hash(password)

    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.password_hash)

    def is_admin(self):
        return self.role == UserRole.ADMIN

    def __repr__(self):
        return f'<User {self.username}>'
    
class LegalPage(db.Model):
    __tablename__ = 'legal_pages'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum(GlobalStatus), default=GlobalStatus.INACTIVE, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<LegalPage {self.name}>'
    
class FAQ(db.Model):
    __tablename__ = 'faqs'

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(100), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum(GlobalStatus), default=GlobalStatus.INACTIVE, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<FAQ {self.question}>'

class Destination(db.Model):
    __tablename__ = 'destinations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    air = db.Column(db.Boolean, default=False, nullable=False)
    coach = db.Column(db.Boolean, default=False, nullable=False)
    train = db.Column(db.Boolean, default=False, nullable=False)
    status = db.Column(db.Enum(GlobalStatus), default=GlobalStatus.INACTIVE, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Destination {self.name}>'
    
class Avenue(db.Model):
    __tablename__ = 'avenues'

    id = db.Column(db.Integer, primary_key=True)
    leave_destination_id = db.Column(db.Integer, ForeignKey('destinations.id'), nullable=False)
    arrive_destination_id = db.Column(db.Integer, ForeignKey('destinations.id'), nullable=False)
    
    leave_time = db.Column(db.Time, nullable=False)  
    arrive_time = db.Column(db.Time, nullable=False) 
    
    price = db.Column(db.Float, nullable=False)  
    
    status = db.Column(db.Enum(GlobalStatus), default=GlobalStatus.INACTIVE, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    leave_destination = relationship('Destination', foreign_keys=[leave_destination_id], backref='leave_routes')
    arrive_destination = relationship('Destination', foreign_keys=[arrive_destination_id], backref='arrive_routes')

    def __repr__(self):
        return f'<Avenue {self.leave_destination.name} to {self.arrive_destination.name}>'
    
class Contact(db.Model):
    __tablename__ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum(ContactStatus), default=ContactStatus.UNREAD, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Contact {self.name}>'
    
class ChangeLog(db.Model):
    __tablename__ = 'changelogs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    version = db.Column(db.String(50), nullable=False)
    status = db.Column(db.Enum(GlobalStatus), default=GlobalStatus.INACTIVE, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f'<ChangeLog {self.name} v{self.version}>'
    
class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    identifier = db.Column(db.String(32), unique=True, nullable=False)
    booking_id = db.Column(db.Integer, ForeignKey('bookings.id'), nullable=True) 
    
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.Enum(PaymentMethod), nullable=False)
    status = db.Column(db.Enum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False)
    type = db.Column(db.Enum(TransactionType), default=TransactionType.PAYMENT, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    booking = relationship('Booking', back_populates='transactions')

    def __repr__(self):
        return f'<Transaction {self.identifier} - {self.status.value}>'
    
class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)

    identifier = db.Column(db.String(32), unique=True, nullable=False)
    avenue_id = db.Column(db.Integer, ForeignKey('avenues.id'), nullable=False)
    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)

    date = db.Column(db.Date, nullable=False)

    mode = db.Column(db.Enum(TravelMode), nullable=False)
    type = db.Column(db.Enum(SeatClass), nullable=False)
    seat = db.Column(db.Integer, nullable=False)

    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    ticket = db.Column(db.Enum(ScannedStatus), default=ScannedStatus.UNSCANNED, nullable=False)
    
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    avenue = relationship('Avenue', backref='bookings')
    user = relationship('User', backref='bookings')

    transactions = relationship(
        'Transaction', 
        back_populates='booking',
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def __repr__(self):
        return f'<Booking {self.identifier} - {self.status.value}>'
