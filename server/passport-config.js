const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/schema'); // Import your User schema

passport.use(new GoogleStrategy({
  clientID: process.env.YOUR_GOOGLE_CLIENT_ID, // Replace with your Google Client ID
  clientSecret: process.env.YOUR_GOOGLE_CLIENT_SECRET, // Replace with your Google Client Secret
  callbackURL: 'http://localhost:5000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google Profile:', profile); // Debugging - Log the Google profile
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      console.log('Creating new user for Google account:', profile.emails[0].value); // Debugging
      // Create a new user if not found
      user = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        password: null, // No password for Google-authenticated users
      });
      await user.save();
    } else {
      console.log('User already exists:', user.email); // Debugging
    }
    return done(null, user);
  } catch (err) {
    console.error('Error during Google authentication:', err); // Debugging
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (err) {
    console.error('Error during deserialization:', err); // Debugging
    done(err, null);
  }
});