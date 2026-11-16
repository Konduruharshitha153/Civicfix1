from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.complaint import Complaint
from app.models.category import Category
from app.models.department import Department
from app.models.status_history import StatusHistory
from app.models.assignment import Assignment
from app.models.user import User
from app.services.ai_service import categorize_complaint
from app.services.duplicate_service import find_potential_duplicates
from app.services.priority_service import calculate_priority
from app.services.routing_service import determine_department_for_category
from app.services.notification_service import notify_status_change, notify_assignment
from app.utils.auth_helpers import get_current_user, role_required
from app.utils.file_helpers import save_uploaded_file

complaint_bp = Blueprint("complaints", __name__, url_prefix="/api/complaints")

VALID_STATUSES = ["Submitted", "Verified", "Assigned", "In Progress", "Resolved", "Rejected"]
VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"]

@complaint_bp.route("/ai-categorize", methods=["POST"])
def ai_categorize():
    data = request.get_json() or {}
    title = data.get("title", "")
    description = data.get("description", "")
    
    if not title and not description:
        return jsonify({"error": "Title or description required for AI analysis."}), 400

    result = categorize_complaint(title, description)
    return jsonify(result), 200

@complaint_bp.route("/check-duplicates", methods=["POST"])
def check_duplicates():
    data = request.get_json() or {}
    try:
        latitude = float(data.get("latitude", 0.0))
        longitude = float(data.get("longitude", 0.0))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid latitude or longitude."}), 400

    title = data.get("title", "")
    description = data.get("description", "")
    category_id = data.get("category_id")
    radius_meters = float(data.get("radius_meters", 350.0))
    exclude_id = data.get("exclude_id")

    duplicates = find_potential_duplicates(
        latitude=latitude,
        longitude=longitude,
        title=title,
        description=description,
        category_id=category_id,
        exclude_id=exclude_id,
        max_radius_meters=radius_meters
    )
    return jsonify({
        "duplicates_count": len(duplicates),
        "potential_duplicates": duplicates
    }), 200

@complaint_bp.route("/upload-image", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file."}), 400

    try:
        url = save_uploaded_file(file)
        return jsonify({"image_url": url, "message": "Image uploaded successfully"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500

@complaint_bp.route("", methods=["POST"])
def submit_complaint():
    data = request.get_json() or {}
    current_user = get_current_user()

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category_id = data.get("category_id")
    
    try:
        latitude = float(data.get("latitude"))
        longitude = float(data.get("longitude"))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid latitude and longitude are required."}), 400

    if not title or not description:
        return jsonify({"error": "Title and description are required."}), 400

    # Fallback to category 1 if not provided or invalid
    category = Category.query.get(category_id) if category_id else Category.query.first()
    if not category:
        return jsonify({"error": "No valid category available in the system."}), 400

    # Determine department routing
    department_id = determine_department_for_category(category.id)
    if not department_id:
        dept = Department.query.first()
        department_id = dept.id if dept else 1

    # Severity and Priority calculation
    severity = data.get("severity", "Medium")
    if severity not in VALID_PRIORITIES:
        severity = "Medium"
    
    affected_count = int(data.get("affected_count", 1))
    priority_calc = calculate_priority(severity=severity, affected_count=affected_count, age_hours=0.0)
    calculated_priority = data.get("priority") or priority_calc["priority"]

    # AI metadata
    ai_confidence = data.get("ai_confidence")
    ai_suggested_category = data.get("ai_suggested_category")

    # Check for immediate duplicates to flag
    duplicate_candidates = find_potential_duplicates(
        latitude=latitude,
        longitude=longitude,
        title=title,
        description=description,
        category_id=category.id,
        max_radius_meters=350.0
    )
    is_duplicate = len(duplicate_candidates) > 0 and duplicate_candidates[0]["overall_match_percentage"] >= 75
    duplicate_of_id = duplicate_candidates[0]["id"] if is_duplicate else None

    complaint = Complaint(
        user_id=current_user.id if current_user else None,
        category_id=category.id,
        department_id=department_id,
        title=title,
        description=description,
        status="Submitted",
        priority=calculated_priority,
        severity=severity,
        affected_count=affected_count,
        latitude=latitude,
        longitude=longitude,
        address=data.get("address", "Locality, City"),
        landmark=data.get("landmark"),
        image_url=data.get("image_url"),
        is_duplicate=is_duplicate,
        duplicate_of_id=duplicate_of_id,
        ai_confidence=float(ai_confidence) / 100.0 if ai_confidence else None,
        ai_suggested_category=ai_suggested_category
    )

    db.session.add(complaint)
    db.session.flush() # Populate complaint.id and tracking_number

    # Add initial status history log
    initial_history = StatusHistory(
        complaint_id=complaint.id,
        old_status=None,
        new_status="Submitted",
        changed_by_user_id=current_user.id if current_user else None,
        notes="Complaint submitted by citizen via CivicFix portal."
    )
    db.session.add(initial_history)
    db.session.commit()

    return jsonify({
        "message": "Complaint submitted successfully",
        "complaint": complaint.to_dict(include_history=True),
        "potential_duplicates_found": len(duplicate_candidates)
    }), 201

@complaint_bp.route("", methods=["GET"])
def get_complaints():
    status = request.args.get("status")
    department_id = request.args.get("department_id")
    category_id = request.args.get("category_id")
    priority = request.args.get("priority")
    search = request.args.get("search", "").strip()
    is_duplicate = request.args.get("is_duplicate")
    limit = min(int(request.args.get("limit", 100)), 500)
    offset = int(request.args.get("offset", 0))

    query = Complaint.query

    if status and status != "All":
        query = query.filter_by(status=status)
    if department_id and department_id != "All":
        query = query.filter_by(department_id=int(department_id))
    if category_id and category_id != "All":
        query = query.filter_by(category_id=int(category_id))
    if priority and priority != "All":
        query = query.filter_by(priority=priority)
    if is_duplicate is not None:
        val = is_duplicate.lower() in ["true", "1"]
        query = query.filter_by(is_duplicate=val)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Complaint.title.ilike(search_fmt)) |
            (Complaint.description.ilike(search_fmt)) |
            (Complaint.tracking_number.ilike(search_fmt)) |
            (Complaint.address.ilike(search_fmt))
        )

    total_count = query.count()
    complaints = query.order_by(Complaint.created_at.desc()).offset(offset).limit(limit).all()

    return jsonify({
        "total": total_count,
        "complaints": [c.to_dict() for c in complaints]
    }), 200

@complaint_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_complaints():
    user_id = get_jwt_identity()
    complaints = Complaint.query.filter_by(user_id=user_id).order_by(Complaint.created_at.desc()).all()
    return jsonify({
        "total": len(complaints),
        "complaints": [c.to_dict(include_history=True) for c in complaints]
    }), 200

@complaint_bp.route("/<identifier>", methods=["GET"])
def get_complaint(identifier):
    # Lookup by ID if numeric, else lookup by tracking number
    if identifier.isdigit():
        complaint = Complaint.query.get(int(identifier))
    else:
        complaint = Complaint.query.filter_by(tracking_number=identifier).first()

    if not complaint:
        return jsonify({"error": f"Complaint '{identifier}' not found."}), 404

    return jsonify({"complaint": complaint.to_dict(include_history=True)}), 200

@complaint_bp.route("/<int:complaint_id>/status", methods=["PATCH"])
@jwt_required()
def update_complaint_status(complaint_id):
    complaint = Complaint.query.get_or_404(complaint_id)
    current_user = get_current_user()
    
    # Check permissions (staff and admin can update status)
    if current_user.role not in ["admin", "staff"]:
        return jsonify({"error": "Unauthorized to update complaint status."}), 403

    data = request.get_json() or {}
    new_status = data.get("status")
    notes = data.get("notes", "")
    resolution_notes = data.get("resolution_notes")
    resolution_image_url = data.get("resolution_image_url")

    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of {VALID_STATUSES}"}), 400

    old_status = complaint.status
    complaint.status = new_status
    complaint.updated_at = datetime.utcnow()

    if new_status in ["Resolved", "Rejected"]:
        complaint.resolved_at = datetime.utcnow()
        if resolution_notes:
            complaint.resolution_notes = resolution_notes
        if resolution_image_url:
            complaint.resolution_image_url = resolution_image_url

    # Record history
    history = StatusHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=new_status,
        changed_by_user_id=current_user.id,
        notes=notes or f"Status changed to {new_status}"
    )
    db.session.add(history)
    db.session.commit()

    # Trigger notification to citizen
    notify_status_change(complaint, old_status, new_status, notes)

    return jsonify({
        "message": f"Status updated to '{new_status}' successfully",
        "complaint": complaint.to_dict(include_history=True)
    }), 200

@complaint_bp.route("/<int:complaint_id>/assign", methods=["POST"])
@jwt_required()
def assign_complaint(complaint_id):
    complaint = Complaint.query.get_or_404(complaint_id)
    current_user = get_current_user()

    if current_user.role not in ["admin", "staff"]:
        return jsonify({"error": "Unauthorized to assign complaints."}), 403

    data = request.get_json() or {}
    assigned_to_user_id = data.get("assigned_to_user_id")
    notes = data.get("notes", "")

    assignee = User.query.get(assigned_to_user_id)
    if not assignee:
        return jsonify({"error": "Assigned user not found."}), 404

    # Create assignment record
    assignment = Assignment(
        complaint_id=complaint.id,
        assigned_to_user_id=assignee.id,
        assigned_by_user_id=current_user.id,
        notes=notes
    )
    db.session.add(assignment)

    # Transition status to Assigned if in Submitted/Verified
    old_status = complaint.status
    if complaint.status in ["Submitted", "Verified"]:
        complaint.status = "Assigned"
        complaint.updated_at = datetime.utcnow()
        history = StatusHistory(
            complaint_id=complaint.id,
            old_status=old_status,
            new_status="Assigned",
            changed_by_user_id=current_user.id,
            notes=f"Assigned to {assignee.full_name}. {notes}"
        )
        db.session.add(history)

    db.session.commit()

    # Notify staff & citizen
    notify_assignment(complaint, assignee.id, current_user.full_name)
    if complaint.status == "Assigned" and old_status != "Assigned":
        notify_status_change(complaint, old_status, "Assigned", f"Assigned to technician {assignee.full_name}")

    return jsonify({
        "message": f"Assigned to {assignee.full_name} successfully",
        "complaint": complaint.to_dict(include_history=True)
    }), 200

@complaint_bp.route("/<int:complaint_id>/link-duplicate", methods=["POST"])
@jwt_required()
def link_duplicate(complaint_id):
    complaint = Complaint.query.get_or_404(complaint_id)
    current_user = get_current_user()

    if current_user.role not in ["admin", "staff"]:
        return jsonify({"error": "Unauthorized."}), 403

    data = request.get_json() or {}
    parent_id = data.get("duplicate_of_id")
    parent_complaint = Complaint.query.get(parent_id)

    if not parent_complaint:
        return jsonify({"error": "Parent complaint not found."}), 404

    old_status = complaint.status
    complaint.is_duplicate = True
    complaint.duplicate_of_id = parent_complaint.id
    complaint.status = "Rejected"
    complaint.resolution_notes = f"Marked as duplicate of {parent_complaint.tracking_number}"
    complaint.updated_at = datetime.utcnow()

    history = StatusHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status="Rejected",
        changed_by_user_id=current_user.id,
        notes=f"Closed as duplicate of issue #{parent_complaint.tracking_number}"
    )
    db.session.add(history)
    db.session.commit()

    notify_status_change(complaint, old_status, "Rejected", f"Merged as duplicate of issue {parent_complaint.tracking_number}")

    return jsonify({
        "message": f"Complaint linked as duplicate of #{parent_complaint.tracking_number}",
        "complaint": complaint.to_dict(include_history=True)
    }), 200
