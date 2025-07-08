import os
BOT_TOKEN = "8087613118:AAHksQb6zrCzepSpVIVVLQ4mfmWeLil-GRg"
CRYPTO_PAY_TOKEN = "426373:AA1l2MUTXHznhPyZIDtVDnapbt00SJH0Kck"
ADMIN_IDS = [5077686157]  # <-- замените на свой Telegram ID
DB_PATH = "keys.db"
SITE_DIR = "site_files"
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://keybot_user:XDxYO6sc31wHv58Qz6HKe1ZSqi5EFuBZ@dpg-d1mc8663jp1c73ek4an0-a.oregon-postgres.render.com/keybot"
)
