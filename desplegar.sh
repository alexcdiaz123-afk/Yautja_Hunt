#!/bin/bash
# ==============================================================================
# YAUTJA HUNT — Script de Despliegue Automatizado para Máquina Virtual (Docker)
# ==============================================================================

# Colores ANSI
RED='\033[1;31m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
ORANGE='\033[0;33m'
BLUE='\033[1;34m'
PURPLE='\033[1;35m'
NC='\033[0m' # No Color

# Auto-elevación a permisos de superusuario (root) si es necesario
if [ "$EUID" -ne 0 ]; then
    if ! docker ps &>/dev/null; then
        echo -e "${YELLOW}[!] Se requieren permisos de superusuario (root) para interactuar con el socket de Docker.${NC}"
        echo -e "${CYAN}[*] Solicitando elevación automática con sudo (en Kali Linux la clave por defecto es 'kali')...${NC}"
        exec sudo "$0" "$@"
    fi
fi

clear 2>/dev/null || true

# Título Decorativo ASCII Art estilo Katoolin / Kali Linux Tools Installer
echo -e "${CYAN}"
cat << 'EOF'
  $$\     $$\                     $$\       $$\               $$\   $$\                 $$\       
  \$$\   $$  |                    $$ |      \__|              $$ |  $$ |                $$ |      
   \$$\ $$  /$$$$$$\  $$\   $$\ $$$$$$\   $$\  $$$$$$\        $$ |  $$ |$$\   $$\ $$$$$$$\ $$$$$$\   
    \$$$$  / \____$$\ $$ |  $$ |\_$$  _|  $$ | \____$$\       $$$$$$$$ |$$ |  $$ |$$  __$$\\_$$  _|  
     \$$  /  $$$$$$$ |$$ |  $$ |  $$ |    $$ | $$$$$$$ |      $$  __$$ |$$ |  $$ |$$ |  $$ | $$ |    
      $$ |  $$  __$$ |$$ |  $$ |  $$ |$$\ $$ |$$  __$$ |      $$ |  $$ |$$ |  $$ |$$ |  $$ | $$ |$$\ 
      $$ |  \$$$$$$$ |\$$$$$$  |  \$$$$  |$$ |\$$$$$$$ |      $$ |  $$ |\$$$$$$  |$$ |  $$ | \$$$$  |
      \__|   \_______| \______/    \____/ $$ | \_______|      \__|  \__| \______/ \__|  \__|  \____/  
                                    $$\   $$ |                                                        
                                    \$$$$$$  |   [ PREDATOR CYBERSECURITY CTF ]                 v2.0  
                                     \______/                                                         
EOF
echo -e "${NC}"

echo -e "${RED}╔═══════════════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║${NC}   ${YELLOW}OWLF OUTPOST 74 — PROYECTO STARGAZER // AMBIENTE DE SIMULACIÓN Y ENTRENAMIENTO${NC}       ${RED}║${NC}"
echo -e "${RED}╚═══════════════════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Detectar IPs activas de la máquina virtual (evitando los puentes de docker 172.x)
ALL_IPS=$(hostname -I 2>/dev/null)
HOST_ONLY_IP=$(echo "$ALL_IPS" | tr ' ' '\n' | grep '^192\.168\.' | head -n 1)
NAT_IP=$(echo "$ALL_IPS" | tr ' ' '\n' | grep '^10\.' | head -n 1)

if [ -n "$HOST_ONLY_IP" ]; then
    PRIMARY_IP="$HOST_ONLY_IP"
elif [ -n "$NAT_IP" ]; then
    PRIMARY_IP="$NAT_IP"
else
    PRIMARY_IP=$(echo "$ALL_IPS" | tr ' ' '\n' | grep -v '^172\.' | head -n 1)
    [ -z "$PRIMARY_IP" ] && PRIMARY_IP="127.0.0.1"
fi

# Iniciar el daemon de Docker si está detenido
if ! systemctl is-active --quiet docker 2>/dev/null; then
    echo -e "${YELLOW}[*] El demonio de Docker está inactivo. Iniciando servicio docker...${NC}"
    systemctl start docker
fi

echo -e "${CYAN}[*] Compilando imágenes y desplegando contenedores en segundo plano...${NC}"
echo ""

# Determinar comando de Docker Compose disponible
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    docker compose up --build -d
elif command -v docker-compose &> /dev/null; then
    docker-compose up --build -d
else
    echo -e "${RED}[!] ERROR: Docker Compose no está instalado.${NC}"
    echo "    Ejecuta: apt update && apt install -y docker-compose"
    exit 1
fi

echo ""
echo -e "${GREEN}═════════════════════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "                   ${GREEN}✅ LABORATORIO INICIALIZADO Y LISTO PARA LA CACERÍA${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${YELLOW}🛸 CONSOLA DEL CAZADOR (Brazalete Yautja y Gestión de Retos):${NC}"
echo -e "     --> ${CYAN}http://localhost:8000${NC}       ${ORANGE}(Recomendado desde el navegador dentro de Kali)${NC}"
echo -e "     --> ${CYAN}http://$PRIMARY_IP:8000${NC}    ${ORANGE}(IP de la máquina virtual)${NC}"
echo ""
echo -e "  ${RED}🎯 PORTAL MILITAR DE LA PRESA (OWLF Outpost 74 - Stargazer):${NC}"
echo -e "     --> ${CYAN}http://localhost:8080${NC}       ${ORANGE}(Recomendado desde el navegador dentro de Kali)${NC}"
echo -e "     --> ${CYAN}http://$PRIMARY_IP:8080${NC}    ${ORANGE}(IP de la máquina virtual)${NC}"
echo ""
echo -e "  ${BLUE}📡 BALIZA DE RADAR MILITAR (Primer Reto - Skull 01):${NC}"
echo -e "     --> ${GREEN}nc -vn 127.0.0.1 1987${NC}"
echo -e "     --> ${GREEN}nc -vn $PRIMARY_IP 1987${NC}"
echo ""
echo -e "${GREEN}═════════════════════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "  ${YELLOW}💡 GUÍA RÁPIDA DE OPERACIONES:${NC}"
echo -e "     1. Ambas plataformas web están enlazadas entre sí mediante accesos rápidos en cabecera."
echo -e "     2. Las herramientas Yautja cuentan con manuales tácticos offline (sin depender de internet)."
echo -e "     3. Si accedes desde el navegador de Windows en tu máquina host:"
if [ -n "$HOST_ONLY_IP" ]; then
    echo -e "        • Conéctate directamente a ${CYAN}http://$HOST_ONLY_IP:8000${NC} (Adaptador Solo-Anfitrión detectado)."
else
    echo -e "        • Añade un adaptador 'Solo-Anfitrión' (Host-Only) en VirtualBox para tener una IP 192.168.x.x,"
    echo -e "          o abre la plataforma directamente desde Firefox dentro de tu máquina virtual Kali."
fi
echo -e "     4. Monitorear logs en vivo:     ${CYAN}docker compose logs -f${NC}"
echo -e "     5. Detener el laboratorio:      ${CYAN}docker compose down${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════════════════════════════════════════════════${NC}"
echo ""
