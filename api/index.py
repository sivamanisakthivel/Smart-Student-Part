import os
import sys

# Ensure root directory is in sys.path so backend modules can be imported
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app import create_app

# Create Flask app instance for Vercel Python runtime
app, socketio = create_app()

# WSGI callable for Vercel serverless deployment
if __name__ == '__main__':
    app.run(debug=True)
