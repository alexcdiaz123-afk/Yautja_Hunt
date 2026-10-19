# 🛸 YAUTJA HUNT — Laboratorio CTF de Hacking Ético (Temática Predator)

> **Propuesta y Desarrollo Académico**  
> **Universidad de Cundinamarca** — Ingeniería de Sistemas y Computación  
> **Estudiantes:** Alexander Carreño Diaz & David Francisco López Casallas  
> **Materia:** Hacking Ético | Septiembre de 2026  

---

## 📌 Descripción del Proyecto

**Yautja Hunt** es un laboratorio de Captura la Bandera (*Capture The Flag*, CTF) completamente interactivo, gamificado e inspirado en el universo de *Predator* y el código de honor de los Yautja. Cada reto representa una fase de la cacería sobre un objetivo militar de investigación clasificada (*OWLF Outpost 74 - Project Stargazer*), donde las flags obtenidas son **Cráneos** y los puntos acumulados determinan el **Honor** y el rango del cazador.

El laboratorio integra dos características pedagógicas distintivas:
1. **📟 Brazalete Yautja (Gauntlet):** Un sistema interactivo de glifos vectoriales en tiempo real con alfabeto nativo completo (A-Z, 0-9) y traductor bidireccional para descifrar pistas criptográficas.
2. **🔥 Visión Térmica / Escáner Táctico:** Un visor con la paleta de calor del Predator (azul profundo, cian, lima, naranja y rojo) que convierte las tarjetas de retos en un **Escáner Táctico de Hacking Ético**, mostrando conceptos teóricos, herramientas de la industria, enfoque analítico y mitigaciones para guiar al estudiante **sin revelar las banderas**.

---

## 🏆 Cadena Completa de 15 Cráneos y Rangos de Cacería

El laboratorio abarca los 15 retos distribuidos en 4 niveles y 5 rangos de ascenso:

| Skull | Nivel / Rango | Habilidad Evaluada | Vector Técnico | Puntos |
| :---: | :--- | :--- | :--- | :---: |
| **01** | **Sangre Joven** | Reconocimiento del Territorio | Escaneo de puertos y conexión a baliza TCP (Puerto 1987) | +100 |
| **02** | **Sangre Joven** | Huellas de la Presa | Banner grabbing e inspección de cabeceras HTTP (`X-Specimen-Traces`) | +100 |
| **03** | **Sangre Joven** | La Entrada | Descubrimiento de `robots.txt` y comentarios HTML en `/telemetry_vault/` | +100 |
| **04** | **Sangrado** | Información Expuesta | Auditoría de backups confidenciales (`/specimen_backup/system_keys.env`) | +100 |
| **05** | **Sangrado** | La Presa Tiene una Llave | Validación de credenciales de Peter Keyes en `/login` | +100 |
| **06** | **Sangrado** | La Herida | Inyección SQL (Boolean/UNION) en catálogo de especímenes alienígenas | +100 |
| **07** | **Sangrado** | Acceso Inicial | Command Injection en utilidad de diagnóstico térmico de red | +100 |
| **08** | **Élite** | Los Rastros | Auditoría de tareas programadas (`cron`) y logs de Stargazer | +250 |
| **09** | **Élite** | Secretos de la Presa | Localización de secretos en ficheros ocultos UNIX (`.internal_token`) | +250 |
| **10** | **Élite** | La Marca | Detección de binarios/scripts con permisos especiales SUID | +250 |
| **11** | **Élite** | Ascenso | Escalada vertical a superusuario y reclamo del trofeo de `root` | +250 |
| **12** | **Anciano** | El Camino Oculto | Descubrimiento de APIs y microservicios internos (`/internal_plasma_matrix`)| +250 |
| **13** | **Anciano** | Dos Presas, Una Cacería | Pivoting de tokens internos y anulación del escudo (`/api/override`) | +250 |
| **14** | **Anciano** | El Juicio del Anciano | Cadena de explotación y sobrecarga térmica del reactor principal | +250 |
| **15** | **Ancestral** | Cráneo Ancestral | *The Ultimate Hunt*: descifrado de coordenadas sagradas y consagración final | +1000 |

**Puntuación Total de Honor:** 3400 puntos.

---

## 🚀 Inicio Rápido

### Opción A: Ejecución Local Inmediata (Windows / Linux sin Docker)
1. Haz doble clic en `iniciar_laboratorio.bat` (en Windows) o ejecuta en tu terminal:
   ```bash
   python start_local_prototype.py
   ```
2. ¡Listo! Los servicios se inicializarán en segundo plano:
   - **Consola del Cazador (Yautja Engine):** [http://localhost:8000](http://localhost:8000)
   - **Portal Vulnerable de la Presa (OWLF):** [http://localhost:8080](http://localhost:8080)
   - **Baliza de Radar Militar:** `localhost:1987` (TCP)

---

### Opción B: Despliegue en Máquina Virtual Linux con Docker
Para montarlo en VirtualBox o VMware con Ubuntu / Kali Linux:
1. Clona el repositorio en la máquina virtual:
   ```bash
   git clone https://github.com/alexcdiaz123-afk/Yautja_Hunt.git
   cd Yautja_Hunt
   ```
2. Despliega los contenedores con Docker Compose:
   ```bash
   docker compose up --build -d
   ```
3. Accede desde tu navegador al puerto `8000` de la IP de la máquina virtual o `http://localhost:8000`.

---

## 🧪 Validación y Solucionario Automatizado

El proyecto incluye una suite de pruebas que ejecuta la cadena de explotación completa de los 15 cráneos y verifica el ascenso a Cazador Ancestral:

```bash
python scripts/test_exploits.py
```

Para restablecer el laboratorio y reiniciar los trofeos a cero:
```bash
python scripts/reset_lab.py
```

---

## 📁 Estructura del Repositorio

```
Yautja_Hunt/
├── docker-compose.yml              # Orquestación de contenedores del laboratorio
├── start_local_prototype.py        # Lanzador multi-hilo local para pruebas inmediatas
├── iniciar_laboratorio.bat         # Acceso directo de un clic para Windows
├── README.md                       # Documentación principal del proyecto
│
├── yautja_engine/                  # [MOTOR CENTRAL CTF - Puerto 8000]
│   ├── Dockerfile
│   ├── engine_app.py               # Servidor API de flags, pistas y rangos
│   ├── requirements.txt
│   ├── data/
│   │   ├── challenges.json         # Especificación técnica y teoría de los 15 cráneos
│   │   └── state.json              # Estado persistente de cacería y puntuación
│   ├── static/
│   │   ├── css/yautja_theme.css    # Interfaz HUD Biomáscara / Visión Térmica
│   │   └── js/
│   │       ├── yautja_glyphs.js    # Motor vectorial de glifos nativos Yautja
│   │       └── app.js              # Lógica de dashboard, brazalete y escáner táctico
│   └── templates/
│       └── index.html              # Consola HUD, vitrina de cráneos y brazalete
│
├── prey_services/                  # [OBJETIVO DE LA PRESA - Puertos 8080 y 1987]
│   ├── Dockerfile
│   ├── start_services.sh           # Script de arranque del contenedor vulnerable
│   ├── requirements.txt
│   ├── web_app/                    # Portal Stargazer (OWLF)
│   │   ├── prey_app.py             # Aplicación vulnerable con endpoints 01-15
│   │   ├── init_db.py              # Inicializador de la base de datos SQLite
│   │   ├── owlf_specimens.db       # BBDD con inyección SQL para Skull 06
│   │   ├── templates/              # Vistas (login, dashboard, diagnóstico, ultimate_hunt)
│   │   └── vulnerable_data/        # robots.txt, system_keys.env, research_notes.bak
│   ├── radar_beacon/
│   │   └── beacon_service.py       # Socket TCP escuchando en puerto 1987
│   └── secret_access/              # Artefactos para Skulls 07 a 11 (cron, tokens, SUID, root)
│
└── scripts/
    ├── test_exploits.py            # Suite de explotación automática de los 15 cráneos
    └── reset_lab.py                # Restauración rápida a valores predeterminados
```

---

## 📟 Herramientas, Brazalete y Visión Térmica

- **⚔️ Armas Yautja (Arsenal Kali Linux):** Haz clic en **`[⚔️ ARMAS YAUTJA]`** para consultar las 8 herramientas esenciales de Kali Linux (Nmap, Netcat, cURL, Gobuster, Burp Suite, SQLMap, GTFOBins, Proxychains) homologadas con el armamento Yautja, con enlaces directos a su documentación y comandos para copiar.
- **📟 Brazalete Yautja:** Haz clic en **`[📟 BRAZALETE YAUTJA]`** en la barra superior para abrir el traductor interactivo y la matriz de glifos nativos (A-Z, 0-9).
- **🔥 Visión Térmica (Escáner Táctico):** Haz clic en **`[🔥 VISIÓN TÉRMICA]`** para activar la paleta cromática térmica y acceder a la teoría pura de cada vulnerabilidad sin gastar puntos de honor.
- **🔒 Desbloqueo Progresivo:** Los retos y cráneos solo se habilitan conforme asciendes de rango (Iniciado $\rightarrow$ Sangrado $\rightarrow$ Élite $\rightarrow$ Anciano $\rightarrow$ Ancestral).
