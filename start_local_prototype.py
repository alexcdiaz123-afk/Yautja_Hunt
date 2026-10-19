#!/usr/bin/env python3
"""
Yautja Hunt - Lanzador de Prototipo Local (Multi-hilo)
Inicia todos los servicios del laboratorio directamente en tu equipo:
  - Yautja Engine:  http://localhost:8000
  - Prey Web (OWLF): http://localhost:8080
  - Radar Beacon:    localhost:1987
"""

import os
import sys
import threading
import time
import socket

# Ensure paths are absolute
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENGINE_DIR = os.path.join(BASE_DIR, 'yautja_engine')
PREY_DIR = os.path.join(BASE_DIR, 'prey_services')

# Initialize DB first
print("[*] Verificando base de datos de la presa...")
sys.path.insert(0, os.path.join(PREY_DIR, 'web_app'))
from init_db import init_database
init_database()

# Import Flask apps and beacon
from prey_app import app as prey_app

sys.path.insert(0, os.path.join(PREY_DIR, 'radar_beacon'))
from beacon_service import start_beacon

sys.path.insert(0, ENGINE_DIR)
from engine_app import app as engine_app

def run_engine():
    print("[+] Yautja Engine ejecutándose en: http://localhost:8000")
    engine_app.run(host='0.0.0.0', port=8000, debug=False, use_reloader=False)

def run_prey():
    print("[+] Portal de la Presa (OWLF) ejecutándose en: http://localhost:8080")
    prey_app.run(host='0.0.0.0', port=8080, debug=False, use_reloader=False)

def run_beacon():
    print("[+] Baliza de Radar OWLF activa en el puerto: 1987")
    start_beacon(host='0.0.0.0', port=1987)

def main():
    print("=" * 70)
    print("           YAUTJA HUNT - PROTOTIPO DE LABORATORIO CTF")
    print("               Iniciando servicios de cacería...")
    print("=" * 70)

    t_beacon = threading.Thread(target=run_beacon, daemon=True)
    t_prey = threading.Thread(target=run_prey, daemon=True)
    t_engine = threading.Thread(target=run_engine, daemon=True)

    t_beacon.start()
    time.sleep(0.5)
    t_prey.start()
    time.sleep(0.5)
    t_engine.start()

    print("\n[!] TODOS LOS SERVICIOS ESTÁN EN LÍNEA:")
    print("    1. Consola del Cazador (Yautja Engine): http://localhost:8000")
    print("    2. Portal de la Presa (OWLF Stargazer): http://localhost:8080")
    print("    3. Baliza Radar de Vigilancia:          puerto 1987 (TCP)")
    print("\nPresiona Ctrl+C para detener el laboratorio.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Deteniendo laboratorio Yautja Hunt. Buena cacería.")

if __name__ == '__main__':
    main()
