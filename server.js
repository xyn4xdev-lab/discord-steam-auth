require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('./steam'); // Your Steam OAuth config
const tokenManager = require('./tokenManager'); // Your token management module
const { client } = require('./bot'); // Your initialized Discord client
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 6173;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your-session-secret-here',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

/**
 * Step 1: Save fingerprint/token for pre-auth matching
 */
app.post('/auth/check-fingerprint', (req, res) => {
  const { token, fingerprint } = req.body;
  if (!token || !fingerprint) return res.json({ ok: false });

  const result = tokenManager.saveFingerprint(token, fingerprint);
  res.json({ ok: result });
});

/**
 * Step 2: Redirect to Steam for OAuth
 */
app.get('/auth/steam', (req, res, next) => {
  const token = req.query.token;
  const tokenData = tokenManager.getTokenData(token);

  if (!tokenData) {
    return res.status(400).send("❌ Invalid or expired token.");
  }

  req.session.steamToken = token;
  passport.authenticate('steam')(req, res, next);
});

/**
 * Step 3: Handle Steam return, update nickname
 */
app.get('/auth/steam/return', (req, res, next) => {
  passport.authenticate('steam', async (err, user) => {
    if (err || !user) return res.send("❌ Steam verification failed.");

    const token = req.session.steamToken;
    const tokenData = tokenManager.getTokenData(token);
    if (!tokenData) return res.send("❌ Token expired or invalid.");

    try {
      const steamId64 = user.id;

      const steamData = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steamId64}`
      ).then(r => r.json()).then(d => d.response.players[0]);

      if (!steamData) return res.send("⚠️ Steam profile not found.");

      const persona = steamData.personaname;
      const nickname = `${persona} (${steamId64})`;

      const discordUser = await client.users.fetch(tokenData.discordUserId);
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const member = await guild.members.fetch(discordUser.id);

      let dmSent = false;
      try {
        await discordUser.send(`✅ Steam verified as **${persona}**\nSteamID64: ${steamId64}`);
        dmSent = true;
      } catch (dmErr) {
        console.warn(`[DM FAIL] Cannot DM user ${discordUser.username}:`, dmErr.message);
      }

      if (member.manageable) {
        await member.setNickname(nickname);
      }

      tokenManager.useToken(token);
      res.send(`<h2>✅ Verified!</h2><p>SteamID64: <b>${steamId64}</b><br>DM ${dmSent ? "was sent." : "could not be sent (user has DMs off)."}</p>`);
    } catch (error) {
      console.error("[steam return] Discord error:", error);
      res.send("❌ Failed to update Discord nickname.");
    }
  })(req, res, next);
});

/**
 * Start the server
 */
app.listen(PORT, () => console.log(`🌍 Server running at http://localhost:${PORT}`));
client.login(process.env.DISCORD_TOKEN);
