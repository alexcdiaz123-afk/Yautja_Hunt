import os
import sqlite3
import subprocess
import platform
from flask import Flask, render_template, request, redirect, url_for, session, flash, send_from_directory, Response

app = Flask(__name__)
app.secret_key = "owlf_stargazer_classified_session_key_1987"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'vulnerable_data')
DB_PATH = os.path.join(BASE_DIR, 'owlf_specimens.db')
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
SECRET_ACCESS_DIR = os.path.join(PROJECT_ROOT, 'secret_access')

# Ensure database exists
if not os.path.exists(DB_PATH):
    try:
        from init_db import init_database
        init_database()
    except Exception as e:
        print(f"[!] Warning initializing DB: {e}")

@app.after_request
def add_custom_headers(response):
    response.headers['Server'] = 'OWLF-Research-Httpd/2.4.52 (Stargazer-OS)'
    response.headers['X-OWLF-Project'] = 'Stargazer-1987'
    # Skull 02 Banner Grabbing Flag!
    response.headers['X-Specimen-Traces'] = 'SKULL{YOUNG_BLOOD_02_BANNER_TRACES}'
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/robots.txt')
def robots():
    robots_path = os.path.join(DATA_DIR, 'robots.txt')
    if os.path.exists(robots_path):
        with open(robots_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return Response(content, mimetype='text/plain')
    return Response("User-agent: *\nDisallow: /telemetry_vault/\nDisallow: /specimen_backup/", mimetype='text/plain')

@app.route('/telemetry_vault')
@app.route('/telemetry_vault/')
def telemetry_vault():
    # Skull 03 in HTML comments
    return render_template('telemetry_vault.html')

@app.route('/specimen_backup/')
@app.route('/specimen_backup')
def backup_index():
    files = []
    if os.path.exists(DATA_DIR):
        files = os.listdir(DATA_DIR)
    
    html = """
    <!DOCTYPE html>
    <html>
    <head><title>Index of /specimen_backup/</title></head>
    <body style="background: #0d1117; color: #c9d1d9; font-family: monospace; padding: 2rem;">
      <h2>Index of /specimen_backup/</h2>
      <hr style="border-color: #30363d;">
      <ul>
        <li><a href="/" style="color: #58a6ff;">../ (Parent Directory)</a></li>
    """
    for file in files:
        html += f'<li><a href="/specimen_backup/{file}" style="color: #58a6ff;">{file}</a></li>\n'
    html += """
      </ul>
      <hr style="border-color: #30363d;">
      <address style="color: #8b949e;">OWLF Stargazer Backup Server 1.8.7</address>
    </body>
    </html>
    """
    return Response(html, mimetype='text/html')

@app.route('/specimen_backup/<path:filename>')
def backup_file(filename):
    return send_from_directory(DATA_DIR, filename)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        # Credentials exposed in Skull 04
        if username == 'dr_keys' and password == 'thermal1987':
            session['user'] = username
            flash('Autenticación autorizada. Bienvenido al núcleo del Proyecto Stargazer.', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Acceso denegado: Credenciales de científico no válidas o firma térmica incorrecta.', 'error')
            return render_template('login.html')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Sesión de telemetría finalizada.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if not session.get('user'):
        flash('Debe autenticarse primero.', 'error')
        return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/specimens', methods=['GET'])
def specimens():
    if not session.get('user'):
        flash('Debe autenticarse para consultar especímenes.', 'error')
        return redirect(url_for('login'))

    query = request.args.get('q', '').strip()
    results = []
    sql_error = None

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        if query:
            # Intentionally vulnerable to SQL Injection for Skull 06
            raw_sql = f"SELECT id, code_name, danger_level, notes, classification FROM specimens WHERE code_name LIKE '%{query}%' OR notes LIKE '%{query}%'"
            cursor.execute(raw_sql)
            results = cursor.fetchall()
        else:
            cursor.execute("SELECT id, code_name, danger_level, notes, classification FROM specimens WHERE classification != 'CLASSIFIED_EYES_ONLY'")
            results = cursor.fetchall()
            
        conn.close()
    except Exception as e:
        sql_error = str(e)

    return render_template('specimens.html', results=results, query=query, sql_error=sql_error)

@app.route('/diagnostic', methods=['GET', 'POST'])
def diagnostic():
    if not session.get('user'):
        flash('Debe autenticarse para acceder a herramientas de diagnóstico.', 'error')
        return redirect(url_for('login'))

    output = None
    target = ""

    if request.method == 'POST':
        target = request.form.get('target', '').strip()

        # Command Injection vulnerability for Skull 07
        is_windows = platform.system().lower() == 'windows'
        
        # Prepare execution command
        if is_windows:
            ping_cmd = f"ping -n 1 {target}"
        else:
            ping_cmd = f"ping -c 1 {target}"

        try:
            # Execute with shell=True to allow command injection (; && | etc.)
            proc = subprocess.run(
                ping_cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=6,
                cwd=PROJECT_ROOT
            )
            output = proc.stdout + proc.stderr
        except subprocess.TimeoutExpired:
            output = "[TIMEOUT]: La orden de diagnóstico excedió el límite de tiempo de enlace (6s)."
        except Exception as e:
            output = f"[ERROR DE EJECUCIÓN]: {str(e)}"

        # Extended checks for Skulls 08 to 11
        flag07_path = os.path.join(SECRET_ACCESS_DIR, 'flag07.txt')
        cron_path = os.path.join(SECRET_ACCESS_DIR, 'cron_audit.log')
        token_path = os.path.join(SECRET_ACCESS_DIR, '.internal_token')
        scanner_path = os.path.join(SECRET_ACCESS_DIR, 'scanner_audit.sh')
        root_path = os.path.join(SECRET_ACCESS_DIR, 'root_trophy.txt')

        target_lower = target.lower()
        if ('flag07' in target_lower or 'secret_access' in target_lower) and os.path.exists(flag07_path):
            if not output or 'SKULL{' not in output:
                with open(flag07_path, 'r', encoding='utf-8') as f:
                    output = (output or '') + "\n" + f.read()

        # Skull 08 (Cron audit log)
        if any(w in target_lower for w in ['cron', 'log', 'stargazer_cron']) and os.path.exists(cron_path):
            with open(cron_path, 'r', encoding='utf-8') as f:
                output = (output or '') + "\n" + f.read()

        # Skull 09 (Internal Token)
        if any(w in target_lower for w in ['internal_token', 'token', 'secrets', '.internal_token']) and os.path.exists(token_path):
            with open(token_path, 'r', encoding='utf-8') as f:
                output = (output or '') + "\n" + f.read()

        # Skull 10 (SUID Scanner script)
        if any(w in target_lower for w in ['scanner', 'suid', 'scanner_audit', 'perm']) and os.path.exists(scanner_path):
            with open(scanner_path, 'r', encoding='utf-8') as f:
                output = (output or '') + "\n" + f.read()

        # Skull 11 (Root trophy)
        if any(w in target_lower for w in ['root', 'trophy', 'sudo']) and os.path.exists(root_path):
            with open(root_path, 'r', encoding='utf-8') as f:
                output = (output or '') + "\n" + f.read()

    return render_template('diagnostic.html', output=output, target=target)

# Skull 12: Internal Plasma Defense Matrix Endpoint
@app.route('/internal_plasma_matrix')
def internal_plasma_matrix():
    return {
        "status": "ONLINE",
        "service": "OWLF Internal Plasma Defense Matrix v3.2",
        "bus": "INTERNAL_LOOPBACK_9090",
        "flag": "SKULL{ELDER_12_HIDDEN_PATHWAY_DISCOVERED}",
        "description": "Matriz de defensa interna descubierta. Escudos energéticos activos.",
        "override_endpoint": "/api/override?token=<TOKEN_INTERNO>"
    }

# Skull 13: Override Endpoint with token from Skull 09
@app.route('/api/override', methods=['GET', 'POST'])
def api_override():
    token = request.args.get('token') or (request.get_json(silent=True) or {}).get('token') or request.form.get('token')
    if token and 'stargazer_plasma_matrix_token_87' in str(token).strip():
        return {
            "status": "SHIELD_OFFLINE",
            "message": "Autenticación de token interno aceptada. Escudo de plasma neutralizado.",
            "flag": "SKULL{ELDER_13_TWO_PREYS_ONE_HUNT}",
            "reactor_code": "STG_REACTOR_PURGE_1987",
            "next_stage": "Ejecutar sobrecarga del reactor en /api/reactor_overload con reactor_code y temperature=1987"
        }
    return {
        "status": "ACCESS_DENIED",
        "error": "Token interno no válido o ausente. Requiere token de autorización nivel 5 (Skull 09).",
        "hint": "Localiza el token interno en los archivos del sistema."
    }, 401

# Skull 14: Reactor Overload
@app.route('/api/reactor_overload', methods=['GET', 'POST'])
def api_reactor_overload():
    code = request.args.get('reactor_code') or (request.get_json(silent=True) or {}).get('reactor_code') or request.form.get('reactor_code')
    temp = str(request.args.get('temperature') or (request.get_json(silent=True) or {}).get('temperature') or request.form.get('temperature') or '')

    if code == 'STG_REACTOR_PURGE_1987' and ('1987' in temp or not temp):
        return {
            "status": "REACTOR_MELTDOWN",
            "message": "Sobrecarga térmica crítica completada. El búnker principal ha colapsado.",
            "flag": "SKULL{ELDER_14_THE_ELDER_TRIAL_PASSED}",
            "ancestral_vault_code": "YAUTJA_PRIME_ELDER_COORDINATES_X87",
            "ultimate_hunt_terminal": "/ultimate_hunt"
        }
    return {
        "status": "SAFE_MODE",
        "error": "Parámetros de sobrecarga inválidos. Requiere reactor_code='STG_REACTOR_PURGE_1987' y temperature='1987'."
    }, 400

# Skull 15: Ultimate Hunt Terminal
@app.route('/ultimate_hunt', methods=['GET', 'POST'])
def ultimate_hunt():
    success = False
    error = None
    entered_code = ""

    if request.method == 'POST':
        entered_code = request.form.get('ancestral_code', '').strip()
        if entered_code == 'YAUTJA_PRIME_ELDER_COORDINATES_X87':
            success = True
        else:
            error = "Coordenadas ancestrales no válidas. El portal permanece sellado."

    return render_template('ultimate_hunt.html', success=success, error=error, entered_code=entered_code)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
