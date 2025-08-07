const {
  Client,
  GatewayIntentBits,
  Events,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js');
const tokenManager = require('./tokenManager');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// 🧠 Cooldown map (userId -> last usage timestamp)
const cooldownMap = new Map();
const COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown

client.on(Events.MessageCreate, async (message) => {
  if (message.content === '!verify' && !message.author.bot) {
    const user = message.author;
    const lastUsed = cooldownMap.get(user.id);
    const now = Date.now();

    if (lastUsed && now - lastUsed < COOLDOWN_MS) {
      const timeLeft = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
      try {
        await user.send(`⏳ Please wait ${timeLeft}s before using \`!verify\` again.`);
      } catch {
        await message.reply(`⏳ ${user}, please wait ${timeLeft}s before using \`!verify\` again.`);
      }
      return;
    }

    cooldownMap.set(user.id, now);

    const token = tokenManager.createToken(user.id);
    const verifyUrl = `${process.env.STEAM_REALM}/verify.html?token=${token}`;

    const button = new ButtonBuilder()
      .setLabel('Verify via Steam')
      .setURL(verifyUrl)
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    try {
      await user.send({
        content: `🔐 Click below to verify your Steam account. This link expires in 15 minutes.`,
        components: [row]
      });

      await message.reply({
        content: '📬 Check your DMs for the verification link!',
        allowedMentions: { repliedUser: false }
      });
    } catch (error) {
      console.error('❌ Failed to DM user:', error);

      await message.reply({
        content: '❌ I couldn’t DM you. Please make sure your DMs are open and try again.',
        allowedMentions: { repliedUser: false }
      });
    }
  }
});

module.exports = { client };
