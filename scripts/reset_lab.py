#!/usr/bin/env python3
"""
Yautja Hunt - Script de Restauración del Laboratorio
Restaura la base de datos de especímenes y reinicia las flags y honor del jugador.
"""

import os
import sys
import subprocess
import requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_INIT_SCRIPT = os.path.join(BASE_DIR, 'prey_services', 'web_app', 'init_db.py')

def reset_database():
    print("[*] Restaurando base de datos de especímenes de la presa...")
    try:
        subprocess.run([sys.executable, DB_INIT_SCRIPT], check=True)
        print("    [OK] Base de datos SQLite restaurada.")
    except Exception as e:
        print(f"    [X] Error restaurando base de datos: {e}")

def reset_engine_state():
    print("[*] Restaurando estado y puntuación del Yautja Engine...")
    try:
        r = requests.post("http://localhost:8000/api/reset", timeout=4)
        if r.status_code == 200:
            print("    [OK] Estado del Yautja Engine restaurado con éxito (1000 pts base, 0 cráneos).")
        else:
            print(f"    [!] Error del servidor al reiniciar: {r.status_code}")
    except Exception:
        print("    [!] No se pudo comunicar con el Yautja Engine en http://localhost:8000.")

if __name__ == '__main__':
    print("=" * 65)
    print("      RESTAURACIÓN Y LIMPIEZA DEL LABORATORIO YAUTJA HUNT")
    print("=" * 65)
    reset_database()
    reset_engine_state()
    print("[OK] Laboratorio restaurado a su estado de fábrica.")
