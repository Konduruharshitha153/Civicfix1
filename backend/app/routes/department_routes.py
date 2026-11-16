from flask import Blueprint, jsonify
from app.models.department import Department
from app.models.category import Category
from app.models.user import User

department_bp = Blueprint("departments", __name__, url_prefix="/api")

@department_bp.route("/departments", methods=["GET"])
def get_departments():
    departments = Department.query.order_by(Department.name.asc()).all()
    return jsonify({"departments": [d.to_dict() for d in departments]}), 200

@department_bp.route("/departments/<int:dept_id>", methods=["GET"])
def get_department(dept_id):
    dept = Department.query.get_or_404(dept_id)
    dept_data = dept.to_dict()
    dept_data["categories"] = [c.to_dict() for c in dept.categories]
    dept_data["staff"] = [s.to_dict() for s in dept.staff_members if s.is_active]
    return jsonify({"department": dept_data}), 200

@department_bp.route("/departments/<int:dept_id>/staff", methods=["GET"])
def get_department_staff(dept_id):
    staff_members = User.query.filter_by(department_id=dept_id, is_active=True).all()
    # Also include global admin or unassigned staff as fallback
    admins = User.query.filter(User.role.in_(["admin", "staff"]), User.is_active == True).all()
    all_assignable = list({u.id: u for u in (staff_members + admins)}.values())
    return jsonify({"staff": [s.to_dict() for s in all_assignable]}), 200

@department_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({"categories": [c.to_dict() for c in categories]}), 200
