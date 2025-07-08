import sqlite3
from datetime import datetime, timedelta

conn = sqlite3.connect("keys.db", check_same_thread=False)
c = conn.cursor()
c.execute('''
    CREATE TABLE IF NOT EXISTS keys (
        key TEXT PRIMARY KEY,
        duration_days INTEGER,
        issued_to TEXT,
        issued_at TEXT,
        used INTEGER DEFAULT 0
    )
''')
conn.commit()

def add_key(key, days):
    c.execute("INSERT OR REPLACE INTO keys (key, duration_days, used) VALUES (?, ?, 0)", (key, days))
    conn.commit()

def remove_key(key):
    c.execute("DELETE FROM keys WHERE key = ?", (key,))
    conn.commit()

def get_key(key):
    c.execute("SELECT * FROM keys WHERE key = ?", (key,))
    return c.fetchone()

def mark_key_used(key, user_id):
    now = datetime.utcnow().isoformat()
    c.execute("UPDATE keys SET used = 1, issued_to = ?, issued_at = ? WHERE key = ?", (str(user_id), now, key))
    conn.commit()

def is_key_valid(key):
    k = get_key(key)
    if not k:
        return False, "Ключ не найден"
    if not k[4]:
        return False, "Ключ не активирован"
    if k[1] == 0:
        return True, "Навсегда"
    issued_at = datetime.fromisoformat(k[3])
    if issued_at + timedelta(days=k[1]) >= datetime.utcnow():
        return True, "Активен"
    return False, "Истёк"

def list_keys():
    c.execute("SELECT * FROM keys")
    return c.fetchall()
