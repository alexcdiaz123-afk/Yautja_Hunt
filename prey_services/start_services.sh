#!/bin/bash
set -e

echo "[*] Inicializando base de datos de especímenes de la presa..."
python web_app/init_db.py

echo "[*] Configurando credenciales del sistema y banderas de acceso inicial..."
mkdir -p /app/secret_access
cp secret_access/flag07.txt /etc/owlf_flag07.txt 2>/dev/null || true

echo "[*] Levantando Baliza de Radar OWLF en el puerto 1987..."
python radar_beacon/beacon_service.py &

echo "[*] Levantando Servidor Web OWLF en el puerto 80..."
export PORT=80
exec python web_app/app.py
