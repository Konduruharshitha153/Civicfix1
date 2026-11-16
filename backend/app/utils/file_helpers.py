import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename: str) -> bool:
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in current_app.config.get("ALLOWED_EXTENSIONS", {"png", "jpg", "jpeg", "webp", "gif"})

def save_uploaded_file(file_storage) -> str:
    """
    Saves an uploaded file to the configured uploads folder and returns its relative URL path.
    """
    if not file_storage or not file_storage.filename:
        return None

    if not allowed_file(file_storage.filename):
        raise ValueError("Invalid file extension. Allowed: PNG, JPG, JPEG, WEBP, GIF.")

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    original_filename = secure_filename(file_storage.filename)
    extension = original_filename.rsplit(".", 1)[1].lower() if "." in original_filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{extension}"
    destination_path = os.path.join(upload_folder, unique_filename)

    file_storage.save(destination_path)
    return f"/uploads/{unique_filename}"
