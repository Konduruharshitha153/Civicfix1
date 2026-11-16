from datetime import datetime
from app.extensions import db

class Assignment(db.Model):
    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    complaint = db.relationship("Complaint", back_populates="assignments")
    assigned_to = db.relationship("User", foreign_keys=[assigned_to_user_id])
    assigned_by = db.relationship("User", foreign_keys=[assigned_by_user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "assigned_to_user_id": self.assigned_to_user_id,
            "assigned_to_name": self.assigned_to.full_name if self.assigned_to else None,
            "assigned_to_email": self.assigned_to.email if self.assigned_to else None,
            "assigned_by_user_id": self.assigned_by_user_id,
            "assigned_by_name": self.assigned_by.full_name if self.assigned_by else "System",
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
