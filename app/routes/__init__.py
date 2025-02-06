from flask import Blueprint

from .main import main as main_bp
from .daily import bp as daily_bp
from .history import bp as history_bp

def init_app(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(daily_bp)
    app.register_blueprint(history_bp)