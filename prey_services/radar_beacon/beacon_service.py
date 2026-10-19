#!/usr/bin/env python3
"""
OWLF Surveillance Radar Beacon Service
Project Stargazer - Outpost 74
Listens on port 1987 (Year of first Predator contact).
Emits perimeter telemetry and Skull 01 when scanned or connected.
"""
import socket
import threading
import sys

HOST = '0.0.0.0'
PORT = 1987

BANNER = """
================================================================================
[+] OTHER WORLD LIFEFORM TASKFORCE (OWLF) - PROJECT STARGAZER
[+] AUTOMATED PERIMETER SURVEILLANCE RADAR v2.4 - OUTPOST 74
================================================================================
[!] FREQUENCY: 1987.00 MHz | STATUS: SCANNING RAINFOREST PERIMETER
[!] RADAR BEACON LOCK ON INTRUDER SECTOR:
    >> SKULL{YOUNG_BLOOD_01_TERRITORY_RECON} <<
[!] THERMAL SENSORS: 4 ANOMALIES DETECTED NEAR CANOPY TREE LINE.
[!] DIRECTIVE: EXAMINE WEB OBSERVATION PORTAL (PORT 8080 / 80).
================================================================================
[OWLF-BEACON] Connection acknowledged. Sensor telemetry stream active...
"""

def handle_client(client_socket, client_address):
    try:
        client_socket.sendall(BANNER.encode('utf-8'))
        client_socket.settimeout(15.0)
        # Wait or echo briefly
        try:
            data = client_socket.recv(1024)
            if data:
                client_socket.sendall(b"\n[OWLF-BEACON] Transmission recorded. Outpost 74 offline.\n")
        except socket.timeout:
            pass
    except Exception as e:
        pass
    finally:
        try:
            client_socket.close()
        except Exception:
            pass

def start_beacon(host=HOST, port=PORT):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(10)
    print(f"[*] OWLF Radar Beacon listening on {host}:{port} (Predator 1987 frequency)...")
    
    while True:
        try:
            client_sock, client_addr = server.accept()
            t = threading.Thread(target=handle_client, args=(client_sock, client_addr), daemon=True)
            t.start()
        except KeyboardInterrupt:
            print("\n[*] Stopping Radar Beacon...")
            break
        except Exception as e:
            print(f"[!] Beacon error: {e}")

if __name__ == '__main__':
    start_beacon()
