import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.types import Message
from aiogram.filters import Command
from database import add_key, remove_key, list_keys, mark_key_used
from config import BOT_TOKEN, ADMIN_IDS

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start(msg: Message):
    await msg.answer("Добро пожаловать! Ожидается покупка или активация ключа.")

@dp.message(Command("addkey"))
async def cmd_addkey(msg: Message):
    if msg.from_user.id not in ADMIN_IDS:
        return
    try:
        _, key, days = msg.text.split()
        add_key(key, int(days))
        await msg.answer(f"Ключ {key} добавлен на {days} дней.")
    except:
        await msg.answer("Использование: /addkey KEY 7")

@dp.message(Command("removekey"))
async def cmd_removekey(msg: Message):
    if msg.from_user.id not in ADMIN_IDS:
        return
    try:
        _, key = msg.text.split()
        remove_key(key)
        await msg.answer(f"Ключ {key} удалён.")
    except:
        await msg.answer("Использование: /removekey KEY")

@dp.message(Command("listkeys"))
async def cmd_listkeys(msg: Message):
    if msg.from_user.id not in ADMIN_IDS:
        return
    keys = list_keys()
    if not keys:
        await msg.answer("Нет ключей.")
    else:
        lines = [f"{k[0]} — {k[1]} дн. — {'Использован' if k[4] else 'Не использован'}" for k in keys]
        await msg.answer("\n".join(lines))

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
