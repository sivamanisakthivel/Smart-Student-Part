import sqlite3
import json
import os
from datetime import datetime

def generate_report():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'student_job.db')
    
    if not os.path.exists(db_path):
        print("Database file not found!")
        return

    # File Stats
    db_size_bytes = os.path.getsize(db_path)
    db_size_kb = round(db_size_bytes / 1024, 2)
    last_modified = datetime.fromtimestamp(os.path.getmtime(db_path)).strftime('%Y-%m-%d %H:%M:%S')

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row['name'] for row in cursor.fetchall() if not row['name'].startswith('sqlite_')]

    table_data = {}
    table_counts = {}
    table_schemas = {}

    for table in tables:
        # Schema
        cursor.execute(f"PRAGMA table_info({table});")
        columns = [dict(col) for col in cursor.fetchall()]
        table_schemas[table] = columns

        # Data
        cursor.execute(f"SELECT * FROM {table}")
        rows = [dict(r) for r in cursor.fetchall()]
        table_data[table] = rows
        table_counts[table] = len(rows)

    # HTML Report Generation
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SQL Database Report - Smart Student Job Portal</title>
    <style>
        :root {{
            --bg: #0f172a;
            --card-bg: #1e293b;
            --accent: #38bdf8;
            --text: #f8fafc;
            --subtext: #94a3b8;
            --border: #334155;
            --success: #22c55e;
            --warning: #f59e0b;
        }}
        body {{
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 30px;
            line-height: 1.6;
        }}
        .header {{
            background: linear-gradient(135deg, #1e293b, #0f172a);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid var(--border);
            margin-bottom: 30px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        }}
        h1 {{
            color: var(--accent);
            margin: 0 0 8px 0;
            font-size: 1.8rem;
        }}
        .meta-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-top: 20px;
        }}
        .meta-card {{
            background: rgba(15, 23, 42, 0.6);
            padding: 16px;
            border-radius: 12px;
            border: 1px solid var(--border);
        }}
        .meta-label {{
            color: var(--subtext);
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        .meta-value {{
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent);
            margin-top: 4px;
            word-break: break-all;
        }}
        .section-title {{
            font-size: 1.3rem;
            color: var(--warning);
            margin: 30px 0 15px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}
        .badge {{
            background: rgba(56, 189, 248, 0.15);
            color: var(--accent);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            border: 1px solid rgba(56, 189, 248, 0.3);
        }}
        .table-box {{
            background: var(--card-bg);
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 25px;
            border: 1px solid var(--border);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 0.9rem;
        }}
        th, td {{
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }}
        th {{
            background: #0f172a;
            color: var(--subtext);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.78rem;
        }}
        tr:hover {{
            background: #283548;
        }}
        .print-btn {{
            background: #0284c7;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            float: right;
        }}
        .print-btn:hover {{
            background: #0369a1;
        }}
    </style>
</head>
<body>

    <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>

    <div class="header">
        <h1>📊 SQL Database Storage Report</h1>
        <p style="color: var(--subtext); margin: 0;">Smart Student Part-Time Job Management System Database Summary</p>

        <div class="meta-grid">
            <div class="meta-card">
                <div class="meta-label">📁 Database Location</div>
                <div class="meta-value">{db_path}</div>
            </div>
            <div class="meta-card">
                <div class="meta-label">💾 Engine Type</div>
                <div class="meta-value">SQLite3 (local db file)</div>
            </div>
            <div class="meta-card">
                <div class="meta-label">📦 File Size</div>
                <div class="meta-value">{db_size_kb} KB ({db_size_bytes} Bytes)</div>
            </div>
            <div class="meta-card">
                <div class="meta-label">🕒 Last Modified</div>
                <div class="meta-value">{last_modified}</div>
            </div>
        </div>
    </div>

    <div class="section-title">
        <span>📋 Database Tables Summary</span>
        <span class="badge">{len(tables)} Tables Active</span>
    </div>

    <div class="table-box">
        <table>
            <thead>
                <tr>
                    <th>Table Name</th>
                    <th>Total Records</th>
                    <th>Columns Count</th>
                    <th>Primary Key</th>
                </tr>
            </thead>
            <tbody>
"""

    for table in tables:
        cols = table_schemas[table]
        pk_col = [c['name'] for c in cols if c['pk'] > 0]
        pk_str = ", ".join(pk_col) if pk_col else "None"
        html_content += f"""
                <tr>
                    <td><strong style="color: var(--accent);">{table}</strong></td>
                    <td><span style="color: var(--success); font-weight: bold;">{table_counts[table]}</span> records</td>
                    <td>{len(cols)} columns</td>
                    <td><code>{pk_str}</code></td>
                </tr>
"""

    html_content += """
            </tbody>
        </table>
    </div>
"""

    # Detailed Table Records Sections
    for table in tables:
        rows = table_data[table]
        cols = table_schemas[table]
        html_content += f"""
    <div class="table-box">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: var(--accent);">Table: <code>{table}</code></h3>
            <span class="badge">{len(rows)} Records</span>
        </div>
"""

        if not rows:
            html_content += '<p style="color: var(--subtext); font-style: italic; margin-top: 15px;">No records currently present in this table.</p>'
        else:
            headers = [c['name'] for c in cols]
            html_content += '<table><thead><tr>'
            for h in headers:
                html_content += f'<th>{h}</th>'
            html_content += '</tr></thead><tbody>'

            for r in rows:
                html_content += '<tr>'
                for h in headers:
                    val = r[h] if r[h] is not None else '<em style="color:#64748b;">NULL</em>'
                    val_str = str(val)
                    if len(val_str) > 60:
                        val_str = val_str[:57] + "..."
                    html_content += f'<td>{val_str}</td>'
                html_content += '</tr>'
            html_content += '</tbody></table>'

        html_content += '</div>'

    html_content += """
</body>
</html>
"""

    output_report_file = os.path.join(base_dir, 'database_report.html')
    with open(output_report_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"SQL Report generated successfully at: {output_report_file}")
    return output_report_file

if __name__ == '__main__':
    generate_report()
