import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from config import DATABASE_URL

conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
c = conn.cursor()

c.execute('''
    CREATE TABLE IF NOT EXISTS keys (
        key TEXT PRIMARY KEY,
        duration_days INTEGER,
        issued_to TEXT,
        issued_at TIMESTAMP,
        used BOOLEAN DEFAULT FALSE
    )
''')
conn.commit()

def add_key(key, days):
    c.execute("INSERT INTO keys (key, duration_days, used) VALUES (%s, %s, TRUE) ON CONFLICT (key) DO UPDATE SET duration_days = EXCLUDED.duration_days, used = TRUE", (key, days))
    conn.commit()

def remove_key(key):
    c.execute("DELETE FROM keys WHERE key = %s", (key,))
    conn.commit()

def get_key(key):
    c.execute("SELECT * FROM keys WHERE key = %s", (key,))
    return c.fetchone()

def mark_key_used(key, user_id):
    now = datetime.utcnow()
    c.execute("UPDATE keys SET used = TRUE, issued_to = %s, issued_at = %s WHERE key = %s", (str(user_id), now, key))
    conn.commit()

def is_key_valid(key):
    k = get_key(key)
    if not k:
        return False, "Ключ не найден"
    if not k['used']:
        return False, "Ключ не активирован"
    if k['duration_days'] == 0:
        return True, "Навсегда"
    issued_at = k['issued_at']
    if issued_at + timedelta(days=k['duration_days']) >= datetime.utcnow():
        return True, "Активен"
    return False, "Истёк"

def list_keys():
    c.execute("SELECT * FROM keys")
    return c.fetchall()
