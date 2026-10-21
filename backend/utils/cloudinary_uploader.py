import os
import time
from werkzeug.utils import secure_filename
from backend.config import Config

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_image_file(file_obj, folder="student_jobs"):
    """
    Uploads an image file to Cloudinary if credentials are configured in .env.
    Otherwise, saves locally to static/uploads/ and returns the local URL path.
    """
    if not file_obj or not file_obj.filename:
        return None, "No file provided"

    if not allowed_file(file_obj.filename):
        return None, "Invalid file format. Allowed formats: PNG, JPG, JPEG, GIF, WEBP, SVG"

    cloud_name = Config.CLOUDINARY_CLOUD_NAME
    api_key = Config.CLOUDINARY_API_KEY
    api_secret = Config.CLOUDINARY_API_SECRET

    # Check if Cloudinary credentials are provided in .env
    is_cloudinary_configured = (
        cloud_name and 
        api_key and 
        api_secret and 
        cloud_name not in ['your_cloud_name', 'your_cloudinary_cloud_name', ''] and
        api_key not in ['your_api_key', 'your_cloudinary_api_key', '']
    )

    if is_cloudinary_configured:
        try:
            import cloudinary
            import cloudinary.uploader
            
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True
            )
            
            # Read file stream and upload directly to Cloudinary
            response = cloudinary.uploader.upload(
                file_obj,
                folder=folder,
                resource_type="image"
            )
            
            secure_url = response.get('secure_url')
            if secure_url:
                print(f"[Cloudinary Upload Success] URL: {secure_url}")
                return secure_url, None
        except Exception as err:
            print(f"[Cloudinary Upload Warning] Error: {err}. Falling back to local upload...")

    # Fallback: Save file locally in static/uploads
    try:
        filename = secure_filename(file_obj.filename)
        timestamp = int(time.time())
        unique_filename = f"{timestamp}_{filename}"
        
        static_uploads_dir = os.path.join(Config.BASE_DIR, 'static', 'uploads')
        os.makedirs(static_uploads_dir, exist_ok=True)
        
        file_path = os.path.join(static_uploads_dir, unique_filename)
        file_obj.seek(0)
        file_obj.save(file_path)
        
        local_url = f"/static/uploads/{unique_filename}"
        print(f"[Local Upload Fallback] Saved image locally: {local_url}")
        return local_url, None
    except Exception as err:
        return None, f"Failed to save image file: {str(err)}"
