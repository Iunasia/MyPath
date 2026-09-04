import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const avatarUrl = profile.photos?.[0]?.value || null;

          if (!email) {
            return done(new Error('No email found from Google profile'), undefined);
          }

          // Check if user already linked via Google ID
          let user = await User.findByGoogleId(googleId);
          if (user) {
            return done(null, user as any);
          }

          // Check if user exists with same email (link Google to existing account)
          user = await User.findByEmail(email);
          if (user) {
            await User.linkGoogleId(user.id, googleId);
            return done(null, user as any);
          }

          // Create new OAuth user
          const newUser = await User.createOAuthUser({
            name,
            email,
            googleId,
            avatarUrl: avatarUrl || undefined,
          });
          return done(null, newUser as any);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn('⚠️  [Passport] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env. Google OAuth is disabled.');
}

// Serialize user ID into session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
