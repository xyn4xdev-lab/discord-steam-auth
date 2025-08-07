````markdown
# 🔐 Discord Steam Auth

A Node.js Express application that links a user's **Steam account** to their **Discord account**, verifies them, and updates their nickname in a guild with their Steam profile name and SteamID64.

Built for gaming communities, modded servers, or any Discord server that needs Steam identity verification.

---

## 🚀 Features

- OAuth2 Steam authentication
- Discord bot integration
- Automatic nickname updates using Steam profile
- Token-based fingerprint flow (anti-spoofing)
- Session-based Steam login
- Node.js + Express + Passport.js

---

## 📦 Installation

git clone https://github.com/xyn4xdev-lab/discord-steam-auth.git
cd discord-steam-auth
npm install if it doesnt work do npm install express dotenv discord.js passport passport-steam express-session uuid node-fetch

````

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following:

```env
# 🔑 Steam API
STEAM_API_KEY=your_steam_web_api_key
STEAM_REALM=http://your-public-ip-or-domain:6173
STEAM_RETURN_URL=http://your-public-ip-or-domain:6173/auth/steam/return

# 🤖 Discord Bot
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_bot_client_id
GUILD_ID=your_discord_server_id

# 🌐 Express Server
PORT=6173
```

> 🔒 **Important**: Never share your real tokens or API keys publicly.

---

## 🧠 How It Works

1. A user starts verification via a secure token
2. They are redirected to Steam to log in
3. Steam returns basic profile data (SteamID64, persona)
4. The bot updates their nickname on Discord to:

   ```
   PersonaName (SteamID64)
   ```
5. All sessions are stored securely with Express + Passport

---

## 🖥️ Running the Bot

```bash
node server.js
```

Your bot will be accessible on:

```
http://localhost:6173
```

Make sure ports are open if you're hosting on a VPS.

---

## 🛠 Tech Stack

* Node.js
* Express
* Passport.js (Steam strategy)
* Discord.js
* dotenv
* session/cookie-based auth

---

## 🙏 Credits

Built by [xyn4x](https://github.com/xyn4xdev-lab).
Passport-based login systems.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
