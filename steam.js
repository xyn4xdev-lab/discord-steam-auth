const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
require('dotenv').config();

passport.use(new SteamStrategy(
  {
    returnURL: process.env.STEAM_RETURN_URL,
    realm: process.env.STEAM_REALM,
    apiKey: process.env.STEAM_API_KEY,
    passReqToCallback: true
  },
  (req, identifier, profile, done) => {
    profile.id = profile._json.steamid;
    profile.token = req.session.steamState; // Recover token from session if needed
    return done(null, profile);
  }
));

module.exports = passport;
