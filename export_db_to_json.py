import sqlite3
import json
import os

def export_sqlite_to_json():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        os.path.join(base_dir, 'student_job.db'),
        os.path.join(base_dir, 'instance', 'student_job.db'),
        os.path.join(base_dir, 'backend', 'student_job.db')
    ]
    db_path = None
    for p in possible_paths:
        if os.path.exists(p):
            db_path = p
            break
            
    if not db_path:
        for root, dirs, files in os.walk(base_dir):
            for f in files:
                if f.endswith('.db'):
                    db_path = os.path.join(root, f)
                    break
            if db_path:
                break
                
    if not db_path:
        print("[JSON Export Warning] No .db file found in the workspace!")
        return None, None

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Fetch table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row['name'] for row in cursor.fetchall() if not row['name'].startswith('sqlite_')]
    
    db_data = {}
    for table in tables:
        cursor.execute(f"SELECT * FROM {table}")
        rows = [dict(row) for row in cursor.fetchall()]
        db_data[table] = rows
        
    output_filename = os.path.join(base_dir, "student_job_data.json")
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(db_data, f, indent=4, default=str)
        
    print(f"[Auto JSON Export] Database exported successfully to '{output_filename}'")
    return db_data, output_filename

if __name__ == "__main__":
    export_sqlite_to_json()
