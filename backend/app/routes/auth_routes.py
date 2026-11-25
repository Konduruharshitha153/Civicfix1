from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.department import Department
import re

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
def validate_password(password):

    if len(password) < 8:
        return "Password must be at least 8 characters long"

    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"

    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"

    if not re.search(r"\d", password):
        return "Password must contain at least one number"

    return None

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    phone = data.get("phone", "").strip()
    role = data.get("role", "citizen")

    if not email or not password or not full_name:
        return jsonify({"error": "Full name, email, and password are required."}), 400
    password_error = validate_password(password)

   if password_error:
       return jsonify({
        "error": password_error
    }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 409

    # Default citizens, or staff/admin if requested for test environment
    user = User(
        email=email,
        full_name=full_name,
        phone=phone,
        role=role if role in ["citizen", "staff", "admin"] else "citizen",
        department_id=data.get("department_id")
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Create access token
    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Registration successful",
        "access_token": token,
        "user": user.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    if not user.is_active:
        return jsonify({"error": "This account has been deactivated."}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    unread_notifications = user.notifications.filter_by(is_read=False).count()
    user_data = user.to_dict()
    user_data["unread_notifications_count"] = unread_notifications

    return jsonify({"user": user_data}), 200

@auth_bp.route("/demo-accounts", methods=["GET"])
def get_demo_accounts():
    """
    Returns pre-configured demo account credentials to facilitate frictionless testing.
    """
    return jsonify({
        "demo_accounts": [
            {
                "role": "Citizen",
                "email": "citizen@civicfix.org",
                "password": "Password123!",
                "description": "Standard citizen who reports issues and tracks status."
            },
            {
                "role": "Department Staff",
                "email": "staff@civicfix.org",
                "password": "Password123!",
                "description": "Sanitation & Roads maintenance field technician."
            },
            {
                "role": "Admin / Moderator",
                "email": "admin@civicfix.org",
                "password": "Password123!",
                "description": "Full administrative triage access to verify, assign, and manage issues."
            }
        ]
    })
