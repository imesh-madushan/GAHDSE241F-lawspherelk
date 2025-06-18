import datetime
import uuid
import hashlib
from flask import Flask, request, jsonify, send_file, Response, url_for
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import time
import random
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 
    'mp3', 'wav', 'doc', 'docx', 'xlsx', 'ppt', 'pptx'
}
SERVER_URL = "http://localhost:5001"  # Base URL for the file server

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_file_id():
    return str(uuid.uuid4())[:8]

def get_file_hash(file_path):
    """Generate SHA-256 hash for file integrity"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

# Update the upload endpoint to handle custom folder paths and filenames
@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Check if file exists in request
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file part"}), 400
        
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({"success": False, "error": "No selected file"}), 400
            
        # Get folder from request form data
        folder = request.form.get('folder', 'temp')
        evidence_id = request.form.get('evidence_id', '')
        
        # Determine the upload directory based on folder type
        if folder == 'users':
            # For officers: create users folder structure
            upload_dir = os.path.join(UPLOAD_FOLDER, 'users')
        elif folder == 'criminals':
            # For criminals: create criminals folder structure  
            upload_dir = os.path.join(UPLOAD_FOLDER, 'criminals')
        elif evidence_id:
            # For evidence: evidence_id = "EVD123456"
            upload_dir = os.path.join(UPLOAD_FOLDER, 'evidences', evidence_id)
        else:
            upload_dir = os.path.join(UPLOAD_FOLDER, 'temp')
            
        # Create directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate filename
        timestamp = int(time.time() * 1000)
        random_num = random.randint(100000000, 999999999)
        original_ext = os.path.splitext(file.filename)[1]
        
        # For users/criminals, use profile pattern, for evidence use timestamp pattern
        if folder in ['users', 'criminals']:
            filename = f"profile_{timestamp}{original_ext}"
        else:
            filename = f"{timestamp}-{random_num}{original_ext}"
            
        file_path = os.path.join(upload_dir, filename)
        
        # Save the file
        file.save(file_path)
        
        # Generate relative path for URL
        relative_path = os.path.join('/', os.path.relpath(file_path, UPLOAD_FOLDER).replace('\\', '/'))
        
        print(f"File uploaded successfully: {file_path}")
        print(f"Relative path: {relative_path}")
        
        # Return success with file info
        return jsonify({
            "success": True, 
            "file_path": relative_path,
            "original_name": file.filename,
            "file_type": file.content_type,
            "file_size": os.path.getsize(file_path)
        })
        
    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/<path:filename>')
def serve_file(filename):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(file_path)
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'service': 'file-server',
        'version': '1.0.0',
        'storage_path': UPLOAD_FOLDER,
        'timestamp': datetime.datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    print(f"🚀 Starting file server on http://localhost:5001")
    print(f"📁 Files will be stored in: {UPLOAD_FOLDER}")
    app.run(host='0.0.0.0', port=5001, debug=True)
