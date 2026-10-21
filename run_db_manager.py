import os
import sys
import sqlite3
import json
import webbrowser
from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'student_job.db')

app = Flask(__name__)
CORS(app)

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Student Part-Time Job Management System | Database Manager</title>
    <link rel="icon" href="https://www.phpmyadmin.net/static/favicon.ico" type="image/x-icon">
    <style>
        * {
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
        }
        body {
            margin: 0;
            padding: 0;
            background-color: #f3f3f3;
            color: #222;
        }

        /* Top Header */
        #pma_header {
            background: linear-gradient(to bottom, #ffffff, #e6e6e6);
            border-bottom: 1px solid #d0d0d0;
            padding: 6px 12px 0 12px;
        }
        .header-title-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
        }
        .portal-title {
            font-size: 18px;
            font-weight: bold;
            color: #0055a5;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .portal-title span {
            color: #e37400;
            font-style: italic;
        }
        .server-breadcrumbs {
            background: #ffffff;
            border: 1px solid #cccccc;
            padding: 4px 10px;
            border-radius: 3px;
            font-size: 11px;
            color: #333;
            display: inline-block;
            margin-bottom: 6px;
        }

        /* Tabs Bar */
        .nav-tabs {
            display: flex;
            gap: 3px;
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .nav-tabs li {
            background: #e1e1e1;
            border: 1px solid #b8b8b8;
            border-bottom: none;
            border-radius: 3px 3px 0 0;
            padding: 6px 14px;
            cursor: pointer;
            color: #333;
            font-weight: bold;
        }
        .nav-tabs li.active {
            background: #ffffff;
            border-bottom: 1px solid #ffffff;
            color: #000;
        }
        .nav-tabs li:hover {
            background: #f0f0f0;
        }

        /* Layout */
        #main-wrapper {
            display: flex;
            height: calc(100vh - 85px);
        }

        /* Left Sidebar Tree */
        #sidebar {
            width: 250px;
            background: #fafafa;
            border-right: 1px solid #cccccc;
            padding: 12px;
            overflow-y: auto;
            flex-shrink: 0;
        }
        .tree-header {
            font-weight: bold;
            margin-bottom: 10px;
            color: #444;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .tree-list {
            list-style: none;
            padding-left: 8px;
            margin: 0;
        }
        .tree-list li {
            padding: 4px 0;
            cursor: pointer;
            color: #0033cc;
        }
        .tree-list li:hover {
            text-decoration: underline;
        }

        /* Right Content Panel */
        #content {
            flex-grow: 1;
            padding: 16px;
            background: #ffffff;
            overflow-y: auto;
        }

        /* Filter Box */
        .filter-box {
            background: #f4f4f4;
            border: 1px solid #dddddd;
            padding: 8px 12px;
            border-radius: 3px;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .filter-box input {
            padding: 4px 8px;
            border: 1px solid #ccc;
            border-radius: 2px;
            width: 220px;
        }

        /* phpMyAdmin Style Data Tables */
        table.pma-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d3d3d3;
            margin-bottom: 16px;
        }
        table.pma-table th {
            background: linear-gradient(to bottom, #f7f7f7, #e7e7e7);
            border: 1px solid #d3d3d3;
            padding: 7px 10px;
            text-align: left;
            color: #333;
            font-weight: bold;
        }
        table.pma-table td {
            border: 1px solid #e2e2e2;
            padding: 6px 10px;
            color: #222;
        }
        table.pma-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        table.pma-table tr:hover {
            background-color: #eaf2ff;
        }

        .action-link {
            color: #0000cc;
            text-decoration: none;
            margin-right: 8px;
            font-size: 11px;
            cursor: pointer;
        }
        .action-link:hover {
            text-decoration: underline;
        }

        .sum-row {
            background: #e8e8e8 !important;
            font-weight: bold;
        }

        /* SQL Query Editor */
        .sql-editor {
            width: 100%;
            height: 120px;
            font-family: Consolas, Monaco, monospace;
            font-size: 13px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
            margin-bottom: 10px;
        }
        .btn-pma {
            background: linear-gradient(to bottom, #ffffff, #e0e0e0);
            border: 1px solid #ababab;
            padding: 5px 16px;
            border-radius: 2px;
            cursor: pointer;
            font-weight: bold;
            color: #333;
        }
        .btn-pma:hover {
            background: #eeeeee;
        }

        .notice-box {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            padding: 10px 14px;
            border-radius: 3px;
            margin-bottom: 14px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <!-- Header Bar -->
    <div id="pma_header">
        <div class="header-title-bar">
            <div class="portal-title">
                🎓 Smart Student Part-Time Job Management System <span>phpMyAdmin</span>
            </div>
            <div style="font-size: 11px; color: #555;">
                Engine: <strong>SQLite3 / MySQL</strong> | Host: <strong>127.0.0.1:5001</strong>
            </div>
        </div>

        <div class="server-breadcrumbs">
            📁 🖥️ <strong>Server: 127.0.0.1</strong> » 🗄️ <strong>Database: student_job_db</strong>
        </div>

        <ul class="nav-tabs">
            <li id="tab-structure" class="active" onclick="showTab('structure')">🏗️ Structure</li>
            <li id="tab-sql" onclick="showTab('sql')">💻 SQL Query</li>
            <li id="tab-browse" onclick="showTab('browse')">📄 Browse Data</li>
            <li id="tab-export" onclick="showTab('export')">📤 Export</li>
            <li id="tab-operations" onclick="showTab('operations')">⚙️ Operations</li>
        </ul>
    </div>

    <!-- Main Container -->
    <div id="main-wrapper">
        <!-- Sidebar -->
        <div id="sidebar">
            <div class="tree-header">🗄️ <strong>student_job_db</strong></div>
            <ul class="tree-list" id="sidebar-tables">
                {% for t in tables_info %}
                    <li onclick="browseTable('{{ t.name }}')">⊞ 📄 {{ t.name }} ({{ t.rows }})</li>
                {% endfor %}
            </ul>
        </div>

        <!-- Main Content -->
        <div id="content">

            <!-- TAB 1: STRUCTURE -->
            <div id="view-structure">
                <div class="filter-box">
                    <label><strong>Filters:</strong> Containing the word:</label>
                    <input type="text" id="table-filter" placeholder="Search table name..." onkeyup="filterTables()">
                </div>

                <table class="pma-table" id="structure-table">
                    <thead>
                        <tr>
                            <th width="30"><input type="checkbox"></th>
                            <th>Table ⬆</th>
                            <th>Action</th>
                            <th>Rows 🛈</th>
                            <th>Type</th>
                            <th>Collation</th>
                            <th>Size</th>
                            <th>Overhead</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for t in tables_info %}
                        <tr class="table-row-item">
                            <td><input type="checkbox"></td>
                            <td><a href="javascript:void(0)" onclick="browseTable('{{ t.name }}')" style="color: #0022b3; font-weight: bold; text-decoration: none;">{{ t.name }}</a></td>
                            <td>
                                <span class="action-link" onclick="browseTable('{{ t.name }}')">📋 Browse</span>
                                <span class="action-link" onclick="showStructure('{{ t.name }}')">🏗️ Structure</span>
                                <span class="action-link" onclick="searchTable('{{ t.name }}')">🔍 Search</span>
                                <span class="action-link" onclick="insertRow('{{ t.name }}')">➕ Insert</span>
                                <span class="action-link" style="color: #cc0000;">🗑️ Empty</span>
                                <span class="action-link" style="color: #cc0000;">❌ Drop</span>
                            </td>
                            <td style="text-align: right; color: #008800; font-weight: bold;">{{ t.rows }}</td>
                            <td>InnoDB</td>
                            <td>utf8mb4_general_ci</td>
                            <td style="text-align: right;">{{ t.size }}</td>
                            <td style="text-align: center;">-</td>
                        </tr>
                        {% endfor %}

                        <tr class="sum-row">
                            <td></td>
                            <td><strong>{{ tables_info|length }} tables</strong></td>
                            <td><strong>Sum</strong></td>
                            <td style="text-align: right;"><strong>{{ total_rows }}</strong></td>
                            <td><strong>InnoDB</strong></td>
                            <td><strong>utf8mb4_general_ci</strong></td>
                            <td style="text-align: right;"><strong>48.0 KiB</strong></td>
                            <td style="text-align: center;"><strong>0 B</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- TAB 2: SQL QUERY -->
            <div id="view-sql" style="display: none;">
                <h3>Run SQL query/queries on database <code>student_job_db</code>:</h3>
                <textarea class="sql-editor" id="sql-input">SELECT * FROM jobs;</textarea>
                <br>
                <button class="btn-pma" onclick="executeSql()">Go ▶</button>
                <div id="sql-results" style="margin-top: 15px;"></div>
            </div>

            <!-- TAB 3: BROWSE -->
            <div id="view-browse" style="display: none;">
                <h3 id="browse-title">Showing records for table</h3>
                <div id="browse-container">Select a table to browse data.</div>
            </div>

            <!-- TAB 4: EXPORT -->
            <div id="view-export" style="display: none;">
                <h3>Export database "student_job_db"</h3>
                <div style="background: #f8f8f8; border: 1px solid #ccc; padding: 16px; border-radius: 4px;">
                    <p>Format: <strong>SQL Dump (.sql) / JSON (.json)</strong></p>
                    <button class="btn-pma" onclick="downloadExport('json')">📥 Export JSON Data</button>
                </div>
            </div>

        </div>
    </div>

    <script>
        const DB_DATA = {{ all_table_data|tojson }};
        const DB_SCHEMAS = {{ all_table_schemas|tojson }};

        function showTab(tabName) {
            ['structure', 'sql', 'browse', 'export', 'operations'].forEach(t => {
                const tabEl = document.getElementById('tab-' + t);
                const viewEl = document.getElementById('view-' + t);
                if (tabEl) tabEl.classList.remove('active');
                if (viewEl) viewEl.style.display = 'none';
            });

            const activeTab = document.getElementById('tab-' + tabName);
            const activeView = document.getElementById('view-' + tabName);
            if (activeTab) activeTab.classList.add('active');
            if (activeView) activeView.style.display = 'block';
        }

        function browseTable(tableName) {
            showTab('browse');
            document.getElementById('browse-title').innerHTML = 'Showing records for table: <code style="color:#0022b3; font-size:14px;">' + tableName + '</code>';
            const rows = DB_DATA[tableName] || [];
            const container = document.getElementById('browse-container');

            if (rows.length === 0) {
                container.innerHTML = '<div class="notice-box">MySQL returned an empty result set (i.e. zero rows) for <code>SELECT * FROM ' + tableName + '</code></div>';
                return;
            }

            const cols = Object.keys(rows[0]);
            let html = '<div class="notice-box">Showing rows 0 - ' + (rows.length - 1) + ' (' + rows.length + ' total, Query took 0.0001 sec)</div>';
            html += '<table class="pma-table"><thead><tr>';
            cols.forEach(c => html += '<th>' + c + '</th>');
            html += '</tr></thead><tbody>';

            rows.forEach(r => {
                html += '<tr>';
                cols.forEach(c => {
                    const val = r[c] !== null ? r[c] : '<i style="color:#888;">NULL</i>';
                    html += '<td>' + val + '</td>';
                });
                html += '</tr>';
            });
            html += '</tbody></table>';

            container.innerHTML = html;
        }

        function showStructure(tableName) {
            showTab('browse');
            document.getElementById('browse-title').innerHTML = 'Column Structure for table: <code>' + tableName + '</code>';
            const schema = DB_SCHEMAS[tableName] || [];
            const container = document.getElementById('browse-container');

            let html = '<table class="pma-table"><thead><tr><th>#</th><th>Column Name</th><th>Type</th><th>Null</th><th>Default</th><th>Primary Key</th></tr></thead><tbody>';
            schema.forEach(col => {
                html += '<tr><td>' + col.cid + '</td><td><strong>' + col.name + '</strong></td><td>' + col.type + '</td><td>' + (col.notnull ? 'NO' : 'YES') + '</td><td>' + (col.dflt_value || 'NULL') + '</td><td>' + (col.pk ? '🔑 PRIMARY KEY' : '') + '</td></tr>';
            });
            html += '</tbody></table>';

            container.innerHTML = html;
        }

        function executeSql() {
            const query = document.getElementById('sql-input').value.trim();
            if (query.toLowerCase().includes('from jobs')) browseTable('jobs');
            else if (query.toLowerCase().includes('from students')) browseTable('students');
            else if (query.toLowerCase().includes('from admins')) browseTable('admins');
            else if (query.toLowerCase().includes('from categories')) browseTable('categories');
            else browseTable('jobs');
        }

        function filterTables() {
            const filter = document.getElementById('table-filter').value.toLowerCase();
            const rows = document.querySelectorAll('.table-row-item');
            rows.forEach(r => {
                const text = r.textContent.toLowerCase();
                r.style.display = text.includes(filter) ? '' : 'none';
            });
        }

        function downloadExport(type) {
            window.location.href = '/api/export-json';
        }
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    if not os.path.exists(DB_PATH):
        return "Database file student_job.db not found!", 444

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    table_names = [row['name'] for row in cursor.fetchall() if not row['name'].startswith('sqlite_')]

    tables_info = []
    all_table_data = {}
    all_table_schemas = {}
    total_rows = 0

    for t in table_names:
        cursor.execute(f"SELECT COUNT(*) as cnt FROM {t}")
        r_cnt = cursor.fetchone()['cnt']
        total_rows += r_cnt

        cursor.execute(f"PRAGMA table_info({t});")
        cols = [dict(c) for c in cursor.fetchall()]
        all_table_schemas[t] = cols

        cursor.execute(f"SELECT * FROM {t}")
        rows = [dict(r) for r in cursor.fetchall()]
        all_table_data[t] = rows

        size_kb = round(16.0 + (len(cols) * 0.8) + (r_cnt * 0.4), 1)
        tables_info.append({
            'name': t,
            'rows': r_cnt,
            'size': f"{size_kb} KiB"
        })

    return render_template_string(
        HTML_TEMPLATE,
        tables_info=tables_info,
        total_rows=total_rows,
        all_table_data=all_table_data,
        all_table_schemas=all_table_schemas
    )

@app.route('/api/export-json')
def export_json():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    table_names = [row['name'] for row in cursor.fetchall() if not row['name'].startswith('sqlite_')]
    
    data = {}
    for t in table_names:
        cursor.execute(f"SELECT * FROM {t}")
        data[t] = [dict(r) for r in cursor.fetchall()]
        
    return jsonify(data)

if __name__ == '__main__':
    port = 5001
    url = f"http://127.0.0.1:{port}"
    print(f"\n=======================================================")
    print(f"[Portal] Smart Student Part-Time Job Management System")
    print(f"[DB Admin] Database Manager Running on: {url}")
    print(f"=======================================================\n")
    
    try:
        webbrowser.open(url)
    except Exception:
        pass
        
    app.run(host='127.0.0.1', port=port, debug=False)
