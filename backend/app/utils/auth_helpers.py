from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def role_required(allowed_roles):
    """
    Decorator to restrict API access by user roles ('citizen', 'staff', 'admin').
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found or inactive"}), 401
            
            if user.role not in allowed_roles:
                return jsonify({
                    "error": "Forbidden: insufficient permissions",
                    "required_roles": allowed_roles,
                    "your_role": user.role
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator

def get_current_user():
    """
    Retrieves currently authenticated User object or None.
    """
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(user_id)
    except Exception:
        pass
    return None
