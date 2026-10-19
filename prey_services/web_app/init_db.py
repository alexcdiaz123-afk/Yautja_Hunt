import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'owlf_specimens.db')

def init_database():
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except Exception:
            pass

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS specimens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code_name TEXT NOT NULL,
        danger_level TEXT NOT NULL,
        notes TEXT NOT NULL,
        classification TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vault_classified (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        secret_title TEXT NOT NULL,
        flag_skull TEXT NOT NULL,
        security_note TEXT NOT NULL
    );
    """)

    specimens_data = [
        ('Specimen Alpha-7 (Bio-Luminescent Fluid)', 'Medium', 'Fluorescencia verde brillante descubierta en hojas de palma tras enfrentamiento.', 'RESTRICTED'),
        ('Bio-Mask Optical Shard', 'High', 'Fragmento de aleación superconductora que sintoniza visión infrarroja.', 'SECRET'),
        ('Combistick Telescoping Fragment', 'Extreme', 'Aleación ultra-densa resistente a munición antitanque de 20mm.', 'TOP_SECRET'),
        ('YAUTJA_HUNTER_BIO_WEAPON', 'LETHAL_OMEGA', 'Muestra biológica de cazador extraterrestre clasificada. Cráneo 06: SKULL{BLOODED_06_VULN_EXPLOITED}', 'CLASSIFIED_EYES_ONLY')
    ]

    cursor.executemany("""
    INSERT INTO specimens (code_name, danger_level, notes, classification)
    VALUES (?, ?, ?, ?);
    """, specimens_data)

    cursor.execute("""
    INSERT INTO vault_classified (secret_title, flag_skull, security_note)
    VALUES (?, ?, ?);
    """, ('PROYECTO STARGAZER - ARCHIVO DE CRANEOS', 'SKULL{BLOODED_06_VULN_EXPLOITED}', 'Vulnerabilidad SQL detectada y documentada con exito'))

    conn.commit()
    conn.close()
    print(f"[+] Database initialized successfully at {DB_PATH}")

if __name__ == '__main__':
    init_database()
