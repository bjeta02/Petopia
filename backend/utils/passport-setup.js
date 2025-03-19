import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../model/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google Profile:", profile);

        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // ❌ Prevent Google login if user signed up manually (has a password)
            if (user.password) {
                console.log("❌ This email was registered manually. Blocking Google login.");
                return done(null, false, { message: "This email was registered manually. Please log in with email and password." });
            }
        } else {
            // ✅ Create a new user if they don't exist
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                isVerified: true,
                role: "owner",
            });

            await user.save();
        }

        done(null, user);
      } catch (error) {
        console.error("❌ Google authentication error:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
