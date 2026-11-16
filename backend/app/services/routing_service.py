from typing import Optional
from app.models.category import Category
from app.models.department import Department

def determine_department_for_category(category_id: int) -> Optional[int]:
    """
    Routes complaint to appropriate municipal department based on category.
    """
    category = Category.query.get(category_id)
    if category and category.department_id:
        return category.department_id
    
    # Fallback to general department if available
    first_dept = Department.query.first()
    return first_dept.id if first_dept else None
