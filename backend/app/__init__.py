from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    load_dotenv()

    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', '70d01a72ef4a83066f1a2d5c7723db3e69bba9b527ee87148cccb8ff4a4993b1')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'instance', 'app.db')
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', '70d01a72ef4a83066f1a2d5c7723db3e69bba9b527ee87148cccb8ff4a4993b1')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=3)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']

    # Initialize JWT
    jwt.init_app(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.legal import legal_pages_bp
    from app.routes.faqs import faqs_bp
    from app.routes.destinations import destinations_bp
    from app.routes.avenues import avenues_bp
    from app.routes.contacts import contacts_bp
    from app.routes.changelogs import changelogs_bp
    from app.routes.bookings import bookings_bp
    from app.routes.transactions import transactions_bp
    from app.routes.stats import stats_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(legal_pages_bp, url_prefix='/api/admin/legal')
    app.register_blueprint(faqs_bp, url_prefix='/api/admin/faq')
    app.register_blueprint(destinations_bp, url_prefix='/api/admin/destinations')
    app.register_blueprint(avenues_bp, url_prefix='/api/admin/avenues')
    app.register_blueprint(contacts_bp, url_prefix='/api/admin/contacts')
    app.register_blueprint(changelogs_bp, url_prefix='/api/admin/changelogs')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')

    return app