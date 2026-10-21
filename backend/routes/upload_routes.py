from flask import Blueprint, request, jsonify
from backend.utils.cloudinary_uploader import upload_image_file

upload_bp = Blueprint('upload', __name__, url_prefix='/api')

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file attached in request'}), 400

    file_obj = request.files['file']
    folder = request.form.get('folder', 'student_jobs')

    image_url, error_message = upload_image_file(file_obj, folder=folder)
    if error_message:
        return jsonify({'success': False, 'message': error_message}), 400

    return jsonify({
        'success': True,
        'message': 'Image uploaded successfully!',
        'url': image_url
    }), 200
