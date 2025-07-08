import threading
import os
from bot import start_bot
from site import app

def run_flask():
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

def run_bot():
    start_bot()

if __name__ == "__main__":
    t1 = threading.Thread(target=run_flask)
    t2 = threading.Thread(target=run_bot)

    t1.start()
    t2.start()

    t1.join()
    t2.join()