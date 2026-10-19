import os
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CHALLENGES_FILE = os.path.join(DATA_DIR, 'challenges.json')
STATE_FILE = os.path.join(DATA_DIR, 'state.json')

def load_challenges():
    if os.path.exists(CHALLENGES_FILE):
        with open(CHALLENGES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"challenges": []}

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "hunter_name": "Cazador Yautja",
        "honor_score": 1000,
        "claimed_skulls": [],
        "unlocked_hints": {},
        "current_rank": "Iniciado (Sin Sangrar)",
        "logs": []
    }

def save_state(state):
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def calculate_rank(claimed_count):
    if claimed_count == 0:
        return "Iniciado (Sin Sangrar)"
    elif 1 <= claimed_count < 3:
        return "Sangre Joven (Young Blood)"
    elif 3 <= claimed_count < 7:
        return "Sangrado (Blooded)"
    elif 7 <= claimed_count < 11:
        return "Cazador Élite"
    elif 11 <= claimed_count < 14:
        return "Anciano (Elder)"
    elif claimed_count == 14:
        return "Anciano (Juicio Final)"
    else:
        return "Ancestral (Ultimate Hunter)"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/challenges', methods=['GET'])
def get_challenges():
    data = load_challenges()
    # Don't leak the exact flag in the challenges listing
    sanitized = []
    for c in data.get('challenges', []):
        c_copy = dict(c)
        if 'flag' in c_copy:
            del c_copy['flag']
        sanitized.append(c_copy)
    return jsonify({"challenges": sanitized})

@app.route('/api/status', methods=['GET'])
def get_status():
    state = load_state()
    return jsonify(state)

@app.route('/api/submit_flag', methods=['POST'])
def submit_flag():
    body = request.get_json(force=True) or {}
    submitted_flag = body.get('flag', '').strip()

    if not submitted_flag:
        return jsonify({"success": False, "message": "Debes ingresar una flag válida."}), 400

    challenges_data = load_challenges()
    state = load_state()

    # Find matching challenge
    matched = None
    for c in challenges_data.get('challenges', []):
        if c.get('flag') == submitted_flag:
            matched = c
            break

    if not matched:
        return jsonify({"success": False, "message": "Bandera no reconocida por el Brazalete Yautja."}), 400

    if matched['id'] in state['claimed_skulls']:
        return jsonify({"success": False, "message": "Este cráneo ya adorna el salón de trofeos de tu clan."}), 400

    # Verify challenge is unlocked based on rank / required skulls
    req_skulls = 0
    if matched.get('rank') == 'Sangrado':
        req_skulls = 3
    elif matched.get('rank') == 'Élite':
        req_skulls = 7
    elif matched.get('rank') == 'Anciano':
        req_skulls = 11
    elif matched.get('rank') == 'Ancestral':
        req_skulls = 14

    if len(state['claimed_skulls']) < req_skulls:
        return jsonify({
            "success": False,
            "message": f"Cráneo bloqueado. Tu rango actual no tiene el honor suficiente para reclamar este trofeo aún (Requiere al menos {req_skulls} cráneos previos cobrados)."
        }), 403

    # Claim skull!
    state['claimed_skulls'].append(matched['id'])
    points = matched.get('points', 100)
    state['honor_score'] += points
    
    # Recalculate rank
    old_rank = state.get('current_rank', 'Iniciado')
    new_rank = calculate_rank(len(state['claimed_skulls']))
    state['current_rank'] = new_rank

    log_entry = f"Cráneo '{matched['title']}' capturado. +{points} de honor."
    if old_rank != new_rank:
        log_entry += f" ¡Ascenso al rango '{new_rank}'!"

    state['logs'].append({"time": "EN LÍNEA", "message": log_entry})
    save_state(state)

    return jsonify({
        "success": True,
        "message": f"¡Cráneo verificado! {matched['title']}",
        "points_added": points,
        "new_rank": new_rank,
        "state": state
    })

@app.route('/api/unlock_hint', methods=['POST'])
def unlock_hint():
    body = request.get_json(force=True) or {}
    challenge_id = body.get('challenge_id')
    level = int(body.get('level', 1))

    challenges_data = load_challenges()
    state = load_state()

    # Find challenge
    target_c = None
    for c in challenges_data.get('challenges', []):
        if c['id'] == challenge_id:
            target_c = c
            break

    if not target_c:
        return jsonify({"success": False, "message": "Reto no encontrado."}), 404

    # Check if challenge is unlocked
    req_skulls = 0
    if target_c.get('rank') == 'Sangrado':
        req_skulls = 3
    elif target_c.get('rank') == 'Élite':
        req_skulls = 7
    elif target_c.get('rank') == 'Anciano':
        req_skulls = 11
    elif target_c.get('rank') == 'Ancestral':
        req_skulls = 14

    if len(state['claimed_skulls']) < req_skulls:
        return jsonify({"success": False, "message": "Este reto está bloqueado para tu rango actual."}), 403

    # Find hint
    hint_obj = None
    for h in target_c.get('hints', []):
        if h['level'] == level:
            hint_obj = h
            break

    if not hint_obj:
        return jsonify({"success": False, "message": "Pista no disponible."}), 404

    unlocked_for_challenge = state['unlocked_hints'].setdefault(challenge_id, [])
    if level in unlocked_for_challenge:
        return jsonify({"success": True, "state": state, "message": "Pista ya desbloqueada."})

    cost = hint_obj.get('cost', 10)
    if state['honor_score'] < cost:
        return jsonify({"success": False, "message": "Honor insuficiente para desbloquear pista."}), 400

    state['honor_score'] -= cost
    unlocked_for_challenge.append(level)
    save_state(state)

    return jsonify({
        "success": True,
        "message": f"Pista {level} descifrada (-{cost} Honor).",
        "state": state
    })

@app.route('/api/reset', methods=['POST'])
def reset_progress():
    initial_state = {
        "hunter_name": "Cazador Yautja",
        "honor_score": 1000,
        "claimed_skulls": [],
        "unlocked_hints": {},
        "current_rank": "Iniciado (Sin Sangrar)",
        "logs": [
            {
                "time": "REINICIO",
                "message": "Cacería reiniciada a valores predeterminados."
            }
        ]
    }
    save_state(initial_state)
    return jsonify({"success": True, "state": initial_state})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
