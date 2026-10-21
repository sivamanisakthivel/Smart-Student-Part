import sqlite3
import json
import os

def generate_db_view():
    db_path = 'student_job.db'
    if not os.path.exists(db_path):
        print("student_job.db not found!")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row['name'] for row in cursor.fetchall() if not row['name'].startswith('sqlite_')]

    db_data = {}
    for table in tables:
        cursor.execute(f"SELECT * FROM {table}")
        rows = [dict(r) for r in cursor.fetchall()]
        db_data[table] = rows

    # 1. Save to JSON
    with open("student_job_data.json", "w", encoding="utf-8") as f:
        json.dump(db_data, f, indent=4, default=str)

    # 2. Build HTML Viewer
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Viewer - student_job.db</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 30px;
        }}
        h1 {{
            color: #38bdf8;
            border-bottom: 2px solid #334155;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }}
        .table-section {{
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }}
        .table-title {{
            font-size: 1.3rem;
            color: #fbbf24;
            margin-top: 0;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}
        .badge {{
            background: #0284c7;
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.85rem;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }}
        th, td {{
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #334155;
        }}
        th {{
            background-color: #0f172a;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
        }}
        tr:hover {{
            background-color: #334155;
        }}
        .empty-msg {{
            color: #64748b;
            font-style: italic;
            padding: 10px 0;
        }}
    </style>
</head>
<body>
    <h1>🗄️ Database Viewer (`student_job.db`)</h1>
    <p style="color: #94a3b8;">Real-time visual table inspector for your SQLite database records.</p>
"""

    for table_name, rows in db_data.items():
        html_content += f"""
    <div class="table-section">
        <div class="table-title">
            <span>📋 Table: <strong>{table_name}</strong></span>
            <span class="badge">{len(rows)} Records</span>
        </div>
"""
        if not rows:
            html_content += '<div class="empty-msg">No records found in this table currently.</div>'
        else:
            headers = rows[0].keys()
            html_content += '<table><thead><tr>'
            for h in headers:
                html_content += f'<th>{h}</th>'
            html_content += '</tr></thead><tbody>'

            for r in rows:
                html_content += '<tr>'
                for h in headers:
                    val = r[h] if r[h] is not None else '<em style="color:#64748b;">NULL</em>'
                    html_content += f'<td>{val}</td>'
                html_content += '</tr>'
            html_content += 'tbody></table>'

        html_content += '</div>'

    html_content += """
</body>
</html>
"""

    with open("db_viewer.html", "w", encoding="utf-8") as f:
        f.write(html_content)

    print("HTML Database Viewer created at 'db_viewer.html'!")
    return db_data

if __name__ == "__main__":
    generate_db_view()
