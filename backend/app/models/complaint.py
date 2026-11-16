import random
import string
from datetime import datetime
from app.extensions import db

def generate_tracking_number():
    year = datetime.utcnow().year
    suffix = "".join(random.choices(string.digits, k=5))
    return f"CVX-{year}-{suffix}"

class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.Integer, primary_key=True)
    tracking_number = db.Column(db.String(30), unique=True, nullable=False, index=True, default=generate_tracking_number)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Statuses: Submitted, Verified, Assigned, In Progress, Resolved, Rejected
    status = db.Column(db.String(30), default="Submitted", nullable=False, index=True)
    
    # Priority & Severity: Low, Medium, High, Critical
    priority = db.Column(db.String(20), default="Medium", nullable=False, index=True)
    severity = db.Column(db.String(20), default="Medium", nullable=False)
    affected_count = db.Column(db.Integer, default=1)
    
    # Geolocation (OpenStreetMap / GPS)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(300), nullable=True)
    landmark = db.Column(db.String(150), nullable=True)
    
    # Evidence & Resolution
    image_url = db.Column(db.String(300), nullable=True)
    resolution_notes = db.Column(db.Text, nullable=True)
    resolution_image_url = db.Column(db.String(300), nullable=True)
    
    # Duplicate Detection
    is_duplicate = db.Column(db.Boolean, default=False)
    duplicate_of_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="SET NULL"), nullable=True)
    
    # AI Metadata
    ai_confidence = db.Column(db.Float, nullable=True)
    ai_suggested_category = db.Column(db.String(100), nullable=True)
    
    # Escalation tracking
    escalation_count = db.Column(db.Integer, default=0)
    is_escalated = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    citizen = db.relationship("User", foreign_keys=[user_id], back_populates="complaints")
    category = db.relationship("Category", back_populates="complaints")
    department = db.relationship("Department", back_populates="complaints")
    status_history = db.relationship("StatusHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="StatusHistory.created_at.desc()")
    assignments = db.relationship("Assignment", back_populates="complaint", cascade="all, delete-orphan", order_by="Assignment.created_at.desc()")
    duplicate_parent = db.relationship("Complaint", remote_side=[id], backref="duplicates_linked")

    def to_dict(self, include_history=False):
        data = {
            "id": self.id,
            "tracking_number": self.tracking_number,
            "user_id": self.user_id,
            "citizen_name": self.citizen.full_name if self.citizen else "Anonymous Citizen",
            "citizen_email": self.citizen.email if self.citizen else None,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
            "department_code": self.department.code if self.department else None,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "severity": self.severity,
            "affected_count": self.affected_count,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "address": self.address,
            "landmark": self.landmark,
            "image_url": self.image_url,
            "resolution_notes": self.resolution_notes,
            "resolution_image_url": self.resolution_image_url,
            "is_duplicate": self.is_duplicate,
            "duplicate_of_id": self.duplicate_of_id,
            "duplicate_tracking_number": self.duplicate_parent.tracking_number if self.duplicate_parent else None,
            "ai_confidence": round(self.ai_confidence * 100, 1) if self.ai_confidence else None,
            "ai_suggested_category": self.ai_suggested_category,
            "is_escalated": self.is_escalated,
            "escalation_count": self.escalation_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "current_assignment": self.assignments[0].to_dict() if self.assignments else None
        }

        if include_history:
            data["status_history"] = [h.to_dict() for h in self.status_history]
            data["assignments_history"] = [a.to_dict() for a in self.assignments]

        return data
