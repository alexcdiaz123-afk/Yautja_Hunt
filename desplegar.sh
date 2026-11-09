#!/bin/bash
# ==============================================================================
# YAUTJA HUNT — Script de Despliegue Automatizado para Máquina Virtual (Docker)
# ==============================================================================

set -e

# Detectar IP principal de la máquina virtual
VM_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$VM_IP" ]; then
    VM_IP="127.0.0.1"
fi

echo ""
echo "================================================================================"
echo "          🛸 YAUTJA HUNT — LABORATORIO CTF DE HACKING ÉTICO"
echo "================================================================================"
echo "[*] Verificando Docker y levantando contenedores en segundo plano..."
echo ""

# Determinar comando de Docker Compose disponible
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    docker compose up --build -d
elif command -v docker-compose &> /dev/null; then
    docker-compose up --build -d
else
    echo "[!] ERROR: Docker o Docker Compose no están instalados."
    echo "    Ejecuta: sudo apt update && sudo apt install -y docker.io docker-compose"
    exit 1
fi

echo ""
echo "================================================================================"
echo "                 ✅ LABORATORIO DESPLEGADO CON ÉXITO"
echo "================================================================================"
echo ""
echo "  [+] CONSOLA DEL CAZADOR (Brazalete y Retos):"
echo "      --> http://$VM_IP:8000"
echo "      --> http://localhost:8000  (Si estás navegando dentro de la VM)"
echo ""
echo "  [+] PORTAL MILITAR DE LA PRESA (OWLF Outpost 74):"
echo "      --> http://$VM_IP:8080"
echo "      --> http://localhost:8080  (Si estás navegando dentro de la VM)"
echo ""
echo "  [+] BALIZA DE RADAR MILITAR (Primer Reto - Skull 01):"
echo "      --> nc -vn $VM_IP 1987"
echo "      --> nc -vn 127.0.0.1 1987"
echo ""
echo "================================================================================"
echo "  💡 NOTAS PARA EL ESTUDIANTE:"
echo "     1. Ambas plataformas web están enlazadas entre sí desde su barra superior."
echo "     2. La sección 'ARMAS YAUTJA' cuenta con manuales offline sin requerir internet."
echo "     3. Para ver registros en vivo:   docker compose logs -f"
echo "     4. Para detener el laboratorio:  docker compose down"
echo "================================================================================"
echo ""
