from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.category import Category

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/public-stats", methods=["GET"])
def get_public_stats():
    total_complaints = Complaint.query.count()
    resolved_count = Complaint.query.filter_by(status="Resolved").count()
    in_progress_count = Complaint.query.filter(Complaint.status.in_(["Assigned", "In Progress"])).count()
    pending_count = Complaint.query.filter(Complaint.status.in_(["Submitted", "Verified"])).count()

    resolution_rate = round((resolved_count / total_complaints * 100), 1) if total_complaints > 0 else 0.0

    # Calculate average resolution time for resolved complaints
    resolved_items = Complaint.query.filter(Complaint.status == "Resolved", Complaint.resolved_at.isnot(None)).all()
    total_resolution_hours = 0.0
    for item in resolved_items:
        delta = (item.resolved_at - item.created_at).total_seconds() / 3600.0
        total_resolution_hours += max(1.0, delta)

    avg_resolution_hours = round(total_resolution_hours / len(resolved_items), 1) if resolved_items else 32.5
    avg_turnaround_days = round(avg_resolution_hours / 24.0, 1)

    # Status distribution
    status_counts = {}
    for status in ["Submitted", "Verified", "Assigned", "In Progress", "Resolved", "Rejected"]:
        status_counts[status] = Complaint.query.filter_by(status=status).count()

    # Category breakdown
    categories = Category.query.all()
    category_distribution = []
    for cat in categories:
        count = Complaint.query.filter_by(category_id=cat.id).count()
        if count > 0:
            category_distribution.append({
                "id": cat.id,
                "name": cat.name,
                "count": count
            })

    # Department breakdown
    departments = Department.query.all()
    department_distribution = []
    for dept in departments:
        count = Complaint.query.filter_by(department_id=dept.id).count()
        dept_resolved = Complaint.query.filter_by(department_id=dept.id, status="Resolved").count()
        department_distribution.append({
            "id": dept.id,
            "name": dept.name,
            "code": dept.code,
            "total_complaints": count,
            "resolved_complaints": dept_resolved
        })

    # Recent resolved showcase
    recent_resolved = Complaint.query.filter_by(status="Resolved").order_by(Complaint.resolved_at.desc()).limit(5).all()

    return jsonify({
        "metrics": {
            "total_complaints": total_complaints,
            "resolved_complaints": resolved_count,
            "in_progress_complaints": in_progress_count,
            "pending_verification": pending_count,
            "resolution_rate_percent": resolution_rate,
            "average_turnaround_hours": avg_resolution_hours,
            "average_turnaround_days": avg_turnaround_days
        },
        "status_distribution": status_counts,
        "category_distribution": category_distribution,
        "department_distribution": department_distribution,
        "recent_resolutions": [c.to_dict() for c in recent_resolved]
    }), 200

@dashboard_bp.route("/admin-stats", methods=["GET"])
def get_admin_stats():
    total_complaints = Complaint.query.count()
    unverified = Complaint.query.filter_by(status="Submitted").count()
    unassigned = Complaint.query.filter_by(status="Verified").count()
    critical_active = Complaint.query.filter(
        Complaint.priority == "Critical",
        Complaint.status.notin_(["Resolved", "Rejected"])
    ).count()

    # Overdue check: open reports older than 48 hours
    cutoff = datetime.utcnow() - timedelta(hours=48)
    overdue_count = Complaint.query.filter(
        Complaint.created_at < cutoff,
        Complaint.status.notin_(["Resolved", "Rejected"])
    ).count()

    # Duplicate count
    duplicates_count = Complaint.query.filter_by(is_duplicate=True).count()

    return jsonify({
        "admin_metrics": {
            "total_complaints": total_complaints,
            "pending_verification": unverified,
            "awaiting_assignment": unassigned,
            "critical_active": critical_active,
            "overdue_escalations": overdue_count,
            "detected_duplicates": duplicates_count
        }
    }), 200
