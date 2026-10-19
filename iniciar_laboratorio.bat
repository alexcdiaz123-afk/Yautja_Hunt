@echo off
title Yautja Hunt - Laboratorio CTF de Hacking Etico
color 0C
echo ======================================================================
echo           YAUTJA HUNT - CTF TEMATICA PREDATOR (15 CRANEOS)
echo                  Universidad de Cundinamarca - 2026
echo ======================================================================
echo.
echo [*] Iniciando servicios del laboratorio...
echo     - Consola Yautja Engine (Puntuacion y Pistas): http://localhost:8000
echo     - Servidor Web Vulnerable de la Presa (OWLF):   http://localhost:8080
echo     - Baliza de Radar OWLF:                        puerto 1987
echo.
echo Presiona Ctrl+C en cualquier momento para detener los servicios.
echo ======================================================================
echo.
where py >nul 2>nul
if %errorlevel% equ 0 (
    py start_local_prototype.py
) else (
    python start_local_prototype.py
)
pause
