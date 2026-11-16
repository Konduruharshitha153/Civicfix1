import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt

def create_app(config_class=Config):
    app = Flask(__name__, static_folder="../uploads")
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Ensure uploads folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Static uploads handler
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "CivicFix Backend API",
            "database": "connected",
            "version": "1.0.0"
        }), 200

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.department_routes import department_bp
    from app.routes.complaint_routes import complaint_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.analytics_routes import analytics_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(department_bp)
    app.register_blueprint(complaint_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(analytics_bp)

    return app
