// tokenManager.js
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Location of the token data store
const TOKEN_FILE = './tokens.json';

class TokenManager {
  constructor() {
    this.tokens = new Map();
    this._load();
  }

  // Load tokens from disk (used on startup)
  _load() {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE));
      for (const [token, obj] of Object.entries(data)) {
        this.tokens.set(token, obj);
      }
    }
  }

  // Save tokens to disk
  _save() {
    const obj = Object.fromEntries(this.tokens);
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(obj, null, 2));
  }

  // Create a new verification token
  createToken(discordUserId) {
    const token = uuidv4();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min expiry

    this.tokens.set(token, {
      discordUserId,
      expiresAt,
      used: false,
      fingerprint: null
    });

    this._save();
    return token;
  }

  // Retrieve token data (only if valid and not used/expired)
  getTokenData(token) {
    const data = this.tokens.get(token);
    if (!data || data.used || Date.now() > data.expiresAt) {
      this.tokens.delete(token);
      this._save();
      return null;
    }
    return data;
  }

  // Save or validate fingerprint for security check
  saveFingerprint(token, fingerprint) {
    const data = this.tokens.get(token);
    if (!data || data.used) return false;

    if (!data.fingerprint) {
      data.fingerprint = fingerprint;
      this.tokens.set(token, data);
      this._save();
      return true;
    }

    if (data.fingerprint !== fingerprint) {
      this.tokens.delete(token);
      this._save();
      return false;
    }

    return true;
  }

  // Mark a token as used
  useToken(token) {
    const data = this.tokens.get(token);
    if (data) {
      data.used = true;
      this.tokens.set(token, data);
      this._save();
    }
  }
}

module.exports = new TokenManager();
