from datetime import datetime
from app.extensions import db

class Department(db.Model):
    __tablename__ = "departments"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    contact_email = db.Column(db.String(120), nullable=True)
    head_name = db.Column(db.String(100), nullable=True)
    sla_hours = db.Column(db.Integer, default=48)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    categories = db.relationship("Category", back_populates="department", cascade="all, delete-orphan")
    staff_members = db.relationship("User", back_populates="department")
    complaints = db.relationship("Complaint", back_populates="department")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "contact_email": self.contact_email,
            "head_name": self.head_name,
            "sla_hours": self.sla_hours,
            "categories_count": len(self.categories) if self.categories else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
