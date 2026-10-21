import sqlite3
import json
import os

def create_phpmyadmin_report():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'student_job.db')

    if not os.path.exists(db_path):
        print("student_job.db not found!")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    table_names = [row['name'] for row in cursor.fetchall() if not row['name'].startswith('sqlite_')]

    tables_info = []
    all_table_data = {}
    all_table_schemas = {}
    total_rows = 0

    for t in table_names:
        # Rows count
        cursor.execute(f"SELECT COUNT(*) as cnt FROM {t}")
        r_cnt = cursor.fetchone()['cnt']
        total_rows += r_cnt

        # Schema info
        cursor.execute(f"PRAGMA table_info({t});")
        cols = [dict(c) for c in cursor.fetchall()]
        all_table_schemas[t] = cols

        # Rows data
        cursor.execute(f"SELECT * FROM {t}")
        rows = [dict(r) for r in cursor.fetchall()]
        all_table_data[t] = rows

        # Calculate mock engine size
        size_kb = round(16.0 + (len(cols) * 0.8) + (r_cnt * 0.4), 1)

        tables_info.append({
            'name': t,
            'rows': r_cnt,
            'cols_count': len(cols),
            'type': 'InnoDB',
            'collation': 'utf8mb4_general_ci',
            'size': f"{size_kb} KiB"
        })

    db_data_json = json.dumps(all_table_data, default=str)
    db_schemas_json = json.dumps(all_table_schemas, default=str)
    tables_info_json = json.dumps(tables_info, default=str)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>localhost / 127.0.0.1 / student_job_db | phpMyAdmin</title>
    <link rel="icon" href="https://www.phpmyadmin.net/static/favicon.ico" type="image/x-icon">
    <style>
        * {{
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
        }}
        body {{
            margin: 0;
            padding: 0;
            background-color: #f3f3f3;
            color: #222;
        }}

        /* Header Navigation */
        #pma_header {{
            background: linear-gradient(to bottom, #ffffff, #e6e6e6);
            border-bottom: 1px solid #d0d0d0;
            padding: 4px 10px 0 10px;
        }}
        .logo-bar {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
        }}
        .pma-logo {{
            font-size: 20px;
            font-weight: bold;
            color: #e37400;
            font-style: italic;
            display: flex;
            align-items: center;
            gap: 4px;
        }}
        .pma-logo span {{
            color: #0055a5;
        }}
        .server-breadcrumbs {{
            background: #fff;
            border: 1px solid #ccc;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 11px;
            color: #444;
            display: inline-block;
            margin-bottom: 6px;
        }}
        .server-breadcrumbs a {{
            color: #0022b3;
            text-decoration: none;
        }}

        /* Tabs Navigation */
        .nav-tabs {{
            display: flex;
            gap: 2px;
            list-style: none;
            padding: 0;
            margin: 0;
        }}
        .nav-tabs li {{
            background: #e1e1e1;
            border: 1px solid #b8b8b8;
            border-bottom: none;
            border-radius: 3px 3px 0 0;
            padding: 5px 12px;
            cursor: pointer;
            color: #333;
            font-weight: bold;
        }}
        .nav-tabs li.active {{
            background: #ffffff;
            border-bottom: 1px solid #ffffff;
            color: #000;
        }}
        .nav-tabs li:hover {{
            background: #f0f0f0;
        }}

        /* Layout Container */
        #container {{
            display: flex;
            height: calc(100vh - 75px);
        }}

        /* Left Sidebar Tree */
        #sidebar {{
            width: 240px;
            background: #fbfbfb;
            border-right: 1px solid #ccc;
            padding: 10px;
            overflow-y: auto;
            flex-shrink: 0;
        }}
        .tree-header {{
            font-weight: bold;
            margin-bottom: 8px;
            display: flex;
            gap: 6px;
            align-items: center;
            color: #444;
        }}
        .tree-list {{
            list-style: none;
            padding-left: 12px;
            margin: 0;
        }}
        .tree-list li {{
            padding: 3px 0;
            cursor: pointer;
            color: #0033cc;
        }}
        .tree-list li:hover {{
            text-decoration: underline;
        }}

        /* Main Content Panel */
        #content {{
            flex-grow: 1;
            padding: 15px;
            background: #ffffff;
            overflow-y: auto;
        }}

        /* Filter bar */
        .filter-box {{
            background: #f4f4f4;
            border: 1px solid #ddd;
            padding: 8px 12px;
            border-radius: 3px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .filter-box input {{
            padding: 3px 6px;
            border: 1px solid #ccc;
            border-radius: 2px;
            width: 200px;
        }}

        /* Data Tables */
        table.pma-table {{
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d3d3d3;
            margin-bottom: 15px;
        }}
        table.pma-table th {{
            background: linear-gradient(to bottom, #f7f7f7, #e7e7e7);
            border: 1px solid #d3d3d3;
            padding: 6px 8px;
            text-align: left;
            color: #333;
            font-weight: bold;
        }}
        table.pma-table td {{
            border: 1px solid #e2e2e2;
            padding: 5px 8px;
            color: #222;
        }}
        table.pma-table tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        table.pma-table tr:hover {{
            background-color: #eaf2ff;
        }}

        .action-link {{
            color: #0000cc;
            text-decoration: none;
            margin-right: 6px;
            font-size: 11px;
            cursor: pointer;
        }}
        .action-link:hover {{
            text-decoration: underline;
        }}

        .sum-row {{
            background: #e8e8e8 !important;
            font-weight: bold;
        }}

        /* SQL Editor Tab */
        .sql-editor {{
            width: 100%;
            height: 120px;
            font-family: Consolas, Monaco, monospace;
            font-size: 13px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 3px;
            margin-bottom: 10px;
        }}
        .btn-pma {{
            background: linear-gradient(to bottom, #ffffff, #e0e0e0);
            border: 1px solid #ababab;
            padding: 4px 14px;
            border-radius: 2px;
            cursor: pointer;
            font-weight: bold;
            color: #333;
        }}
        .btn-pma:hover {{
            background: #eee;
        }}

        /* Status Pills & Notices */
        .notice-box {{
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            padding: 8px 12px;
            border-radius: 3px;
            margin-bottom: 12px;
            font-weight: bold;
        }}
    </style>
</head>
<body>

    <!-- phpMyAdmin Header -->
    <div id="pma_header">
        <div class="logo-bar">
            <div class="pma-logo">
                php<span>MyAdmin</span>
            </div>
            <div style="font-size: 11px; color: #555;">
                Logged in as: <strong>root@localhost</strong> | Smart Student Job Portal DB
            </div>
        </div>

        <!-- Breadcrumbs -->
        <div class="server-breadcrumbs">
            📁 🖥️ <strong>Server: 127.0.0.1</strong> » 🗄️ <strong>Database: student_job_db</strong>
        </div>

        <!-- Navigation Tabs -->
        <ul class="nav-tabs">
            <li id="tab-structure" class="active" onclick="showTab('structure')">🏗️ Structure</li>
            <li id="tab-sql" onclick="showTab('sql')">💻 SQL Query</li>
            <li id="tab-browse" onclick="showTab('browse')">📄 Browse Data</li>
            <li id="tab-export" onclick="showTab('export')">📤 Export</li>
            <li id="tab-import" onclick="showTab('import')">📥 Import</li>
            <li id="tab-operations" onclick="showTab('operations')">⚙️ Operations</li>
        </ul>
    </div>

    <!-- Layout -->
    <div id="container">
        <!-- Sidebar Tree -->
        <div id="sidebar">
            <div class="tree-header">🗄️ <strong>Databases</strong></div>
            <ul class="tree-list" style="padding-left: 5px;">
                <li>▼ <strong>student_job_db ({len(table_names)})</strong></li>
                <ul class="tree-list" id="sidebar-tables">
"""

    for t in table_names:
        html_content += f"""
                    <li onclick="browseTable('{t}')">⊞ 📄 {t}</li>
"""

    html_content += f"""
                </ul>
                <li style="color: #666;">▶ electronics_shop</li>
                <li style="color: #666;">▶ information_schema</li>
                <li style="color: #666;">▶ mysql</li>
                <li style="color: #666;">▶ performance_schema</li>
                <li style="color: #666;">▶ test</li>
            </ul>
        </div>

        <!-- Main Content -->
        <div id="content">

            <!-- TAB 1: STRUCTURE VIEW (Matches User Screenshot) -->
            <div id="view-structure">
                <div class="filter-box">
                    <label><strong>Filters:</strong> Containing the word:</label>
                    <input type="text" id="table-filter" placeholder="Search tables..." onkeyup="filterTables()">
                </div>

                <table class="pma-table" id="structure-table">
                    <thead>
                        <tr>
                            <th width="30"><input type="checkbox" id="check-all"></th>
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
"""

    for info in tables_info:
        t_name = info['name']
        html_content += f"""
                        <tr class="table-row-item">
                            <td><input type="checkbox"></td>
                            <td><a href="javascript:void(0)" onclick="browseTable('{t_name}')" style="color: #0022b3; font-weight: bold; text-decoration: none;">{t_name}</a></td>
                            <td>
                                <span class="action-link" onclick="browseTable('{t_name}')">📋 Browse</span>
                                <span class="action-link" onclick="showStructure('{t_name}')">🏗️ Structure</span>
                                <span class="action-link" onclick="searchTable('{t_name}')">🔍 Search</span>
                                <span class="action-link" onclick="insertRow('{t_name}')">➕ Insert</span>
                                <span class="action-link" style="color: #cc0000;">🗑️ Empty</span>
                                <span class="action-link" style="color: #cc0000;">❌ Drop</span>
                            </td>
                            <td style="text-align: right; color: #008800; font-weight: bold;">{info['rows']}</td>
                            <td>{info['type']}</td>
                            <td>{info['collation']}</td>
                            <td style="text-align: right;">{info['size']}</td>
                            <td style="text-align: center;">-</td>
                        </tr>
"""

    html_content += f"""
                        <tr class="sum-row">
                            <td></td>
                            <td><strong>{len(table_names)} tables</strong></td>
                            <td><strong>Sum</strong></td>
                            <td style="text-align: right;"><strong>{total_rows}</strong></td>
                            <td><strong>InnoDB</strong></td>
                            <td><strong>utf8mb4_general_ci</strong></td>
                            <td style="text-align: right;"><strong>48.0 KiB</strong></td>
                            <td style="text-align: center;"><strong>0 B</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- TAB 2: SQL QUERY RUNNER -->
            <div id="view-sql" style="display: none;">
                <h3>Run SQL query/queries on database <code>student_job_db</code>:</h3>
                <textarea class="sql-editor" id="sql-input">SELECT * FROM jobs;</textarea>
                <br>
                <button class="btn-pma" onclick="executeSql()">Go ▶</button>

                <div id="sql-results" style="margin-top: 20px;"></div>
            </div>

            <!-- TAB 3: BROWSE DATA -->
            <div id="view-browse" style="display: none;">
                <h3 id="browse-title">Showing records for table</h3>
                <div id="browse-container">Select a table from the sidebar or Structure view to browse data.</div>
            </div>

            <!-- TAB 4: EXPORT -->
            <div id="view-export" style="display: none;">
                <h3>Exporting tables from "student_job_db" database</h3>
                <div style="background: #f8f8f8; border: 1px solid #ccc; padding: 15px; border-radius: 3px;">
                    <p>Format: <strong>SQL Dump (.sql) / JSON (.json)</strong></p>
                    <button class="btn-pma" onclick="downloadExport('sql')">📥 Export SQL Dump</button>
                    <button class="btn-pma" style="margin-left: 10px;" onclick="downloadExport('json')">📥 Export JSON Data</button>
                </div>
            </div>

        </div>
    </div>

    <script>
        const DB_DATA = {db_data_json};
        const DB_SCHEMAS = {db_schemas_json};
        const TABLES_INFO = {tables_info_json};

        function showTab(tabName) {{
            const tabs = ['structure', 'sql', 'browse', 'export', 'import', 'operations'];
            tabs.forEach(t => {{
                const tabEl = document.getElementById('tab-' + t);
                const viewEl = document.getElementById('view-' + t);
                if (tabEl) tabEl.classList.remove('active');
                if (viewEl) viewEl.style.display = 'none';
            }});

            const activeTab = document.getElementById('tab-' + tabName);
            const activeView = document.getElementById('view-' + tabName);
            if (activeTab) activeTab.classList.add('active');
            if (activeView) activeView.style.display = 'block';
        }}

        function browseTable(tableName) {{
            showTab('browse');
            document.getElementById('browse-title').innerHTML = 'Showing records for table: <code style="color:#0022b3; font-size:14px;">' + tableName + '</code>';
            
            const rows = DB_DATA[tableName] || [];
            const container = document.getElementById('browse-container');

            if (rows.length === 0) {{
                container.innerHTML = '<div class="notice-box">MySQL returned an empty result set (i.e. zero rows) for <code>SELECT * FROM ' + tableName + '</code></div>';
                return;
            }}

            const cols = Object.keys(rows[0]);
            let html = '<div class="notice-box">Showing rows 0 - ' + (rows.length - 1) + ' (' + rows.length + ' total, Query took 0.0002 seconds)</div>';
            html += '<table class="pma-table"><thead><tr>';
            cols.forEach(c => html += '<th>' + c + '</th>');
            html += '</tr></thead><tbody>';

            rows.forEach(r => {{
                html += '<tr>';
                cols.forEach(c => {{
                    const val = r[c] !== null ? r[c] : '<i style="color:#888;">NULL</i>';
                    html += '<td>' + val + '</td>';
                }});
                html += '</tr>';
            }});
            html += '</tbody></table>';

            container.innerHTML = html;
        }}

        function showStructure(tableName) {{
            showTab('browse');
            document.getElementById('browse-title').innerHTML = 'Column Structure for table: <code>' + tableName + '</code>';
            const schema = DB_SCHEMAS[tableName] || [];
            const container = document.getElementById('browse-container');

            let html = '<table class="pma-table"><thead><tr><th>#</th><th>Name</th><th>Type</th><th>Null</th><th>Default</th><th>Primary Key</th></tr></thead><tbody>';
            schema.forEach(col => {{
                html += '<tr><td>' + col.cid + '</td><td><strong>' + col.name + '</strong></td><td>' + col.type + '</td><td>' + (col.notnull ? 'NO' : 'YES') + '</td><td>' + (col.dflt_value || 'NULL') + '</td><td>' + (col.pk ? '🔑 PRIMARY KEY' : '') + '</td></tr>';
            }});
            html += '</tbody></table>';

            container.innerHTML = html;
        }}

        function executeSql() {{
            const query = document.getElementById('sql-input').value.trim();
            const resultsDiv = document.getElementById('sql-results');

            if (query.toLowerCase().includes('from jobs')) {{
                browseTable('jobs');
            }} else if (query.toLowerCase().includes('from students')) {{
                browseTable('students');
            }} else if (query.toLowerCase().includes('from admins')) {{
                browseTable('admins');
            }} else if (query.toLowerCase().includes('from categories')) {{
                browseTable('categories');
            }} else {{
                resultsDiv.innerHTML = '<div class="notice-box">Executed: <code>' + query + '</code> (OK)</div>';
            }}
        }}

        function filterTables() {{
            const filter = document.getElementById('table-filter').value.toLowerCase();
            const rows = document.querySelectorAll('.table-row-item');
            rows.forEach(r => {{
                const text = r.textContent.toLowerCase();
                r.style.display = text.includes(filter) ? '' : 'none';
            }});
        }}

        function downloadExport(type) {{
            window.location.href = type === 'json' ? 'student_job_data.json' : 'database_report.html';
        }}
    </script>
</body>
</html>
"""

    output_file = os.path.join(base_dir, 'phpmyadmin_report.html')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"phpMyAdmin Report Page created successfully at: {output_file}")
    return output_file

if __name__ == '__main__':
    create_phpmyadmin_report()
