from datetime import datetime
from app.extensions import db

class StatusHistory(db.Model):
    __tablename__ = "status_history"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    old_status = db.Column(db.String(30), nullable=True)
    new_status = db.Column(db.String(30), nullable=False)
    changed_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    complaint = db.relationship("Complaint", back_populates="status_history")
    changed_by = db.relationship("User", foreign_keys=[changed_by_user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "old_status": self.old_status,
            "new_status": self.new_status,
            "changed_by_user_id": self.changed_by_user_id,
            "changed_by_name": self.changed_by.full_name if self.changed_by else "System / Automated",
            "changed_by_role": self.changed_by.role if self.changed_by else "system",
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
