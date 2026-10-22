"""
Vercel Python Serverless Function Entrypoint
============================================
This file is required by Vercel's Python runtime.
It imports the Flask `app` instance from backend/app.py
and exposes it as a top-level `app` variable.

Vercel scans this file at api/index.py and uses the `app`
variable to serve all requests.
"""
import sys
import os

# Add the project root to Python path so `backend` package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Flask app instance from backend
from backend.app import app

# Vercel requires a top-level `app` variable
__all__ = ['app']
