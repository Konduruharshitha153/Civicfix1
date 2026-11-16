from datetime import datetime
from app.extensions import db

class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    default_priority = db.Column(db.String(20), default="Medium")
    keywords = db.Column(db.Text, nullable=True) # Comma-separated search terms for NLP/AI matching
    icon = db.Column(db.String(50), default="alert-circle")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    department = db.relationship("Department", back_populates="categories")
    complaints = db.relationship("Complaint", back_populates="category")

    def to_dict(self):
        return {
            "id": self.id,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "default_priority": self.default_priority,
            "keywords": [k.strip() for k in self.keywords.split(",")] if self.keywords else [],
            "icon": self.icon
        }
