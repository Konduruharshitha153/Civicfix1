from app.extensions import db
from app.models.notification import Notification
from app.models.complaint import Complaint

def notify_status_change(complaint: Complaint, old_status: str, new_status: str, notes: str = None):
    """
    Creates notification for citizen and staff when complaint status updates.
    """
    if not complaint.user_id:
        return

    msg = f"Your civic complaint '{complaint.title}' ({complaint.tracking_number}) has been updated from '{old_status}' to '{new_status}'."
    if notes:
        msg += f" Note: {notes}"

    notification = Notification(
        user_id=complaint.user_id,
        complaint_id=complaint.id,
        title=f"Complaint Status: {new_status}",
        message=msg,
        notification_type="status_change"
    )
    db.session.add(notification)
    db.session.commit()

def notify_assignment(complaint: Complaint, assigned_to_user_id: int, assigned_by_name: str = "Admin"):
    """
    Notifies staff member they have been assigned an issue.
    """
    notification = Notification(
        user_id=assigned_to_user_id,
        complaint_id=complaint.id,
        title="New Issue Assigned",
        message=f"You have been assigned complaint {complaint.tracking_number} ('{complaint.title}') by {assigned_by_name}.",
        notification_type="assignment"
    )
    db.session.add(notification)
    db.session.commit()

def notify_escalation(complaint: Complaint, reason: str):
    """
    Sends escalation alert for overdue complaints.
    """
    if complaint.user_id:
        notif = Notification(
            user_id=complaint.user_id,
            complaint_id=complaint.id,
            title="Complaint Escalated",
            message=f"Your issue {complaint.tracking_number} has been escalated for priority intervention: {reason}",
            notification_type="escalation"
        )
        db.session.add(notif)
        db.session.commit()
