from flask import Flask, request, session, redirect, send_from_directory
from database import get_key, mark_key_used
from config import SITE_DIR
import os

app = Flask(__name__)
app.secret_key = 'your-very-secret-key'

@app.route('/', methods=['GET', 'POST'])
def index():
    if not session.get('access_granted'):
        if request.method == 'POST':
            key = request.form.get('key')
            k = get_key(key)
            if not k:
                return render_auth("Ключ не найден ❌")
            if k[4]:
                return render_auth("Ключ уже использован ❌")
            mark_key_used(key, user_id="site-user")
            session['access_granted'] = True
            session['key'] = key
        else:
            return render_auth()

    return send_from_directory(SITE_DIR, "index.html")

@app.route('/<path:filename>')
def static_files(filename):
    if not session.get('access_granted'):
        return redirect('/')
    file_path = os.path.join(SITE_DIR, filename)
    if os.path.exists(file_path):
        return send_from_directory(SITE_DIR, filename)
    return "Файл не найден", 404

def render_auth(message=""):
    return f'''
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Авторизация</title>
        <style>
            body {{ display: flex; justify-content: center; align-items: center; height: 100vh; background: #121212; color: white; font-family: sans-serif; }}
            form {{ display: flex; flex-direction: column; gap: 10px; }}
            input, button {{ padding: 10px; border: none; border-radius: 5px; }}
            button {{ background: #4CAF50; color: white; cursor: pointer; }}
        </style>
    </head>
    <body>
        <form method="POST">
            <h2>Введите ключ доступа</h2>
            {f'<p style="color:red">{message}</p>' if message else ''}
            <input name="key" placeholder="Ваш ключ" required>
            <button type="submit">Войти</button>
        </form>
    </body>
    </html>
    '''

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
