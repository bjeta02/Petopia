import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../model/User.js";
import Owner from "../model/Owner.js"; // Ensure you import the Owner model
import jwt from "jsonwebtoken"; // Import jwt for token generation

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

          // ✅ Ensure user has a Google ID (for existing accounts)
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        } else {
          // ✅ Create a new user if they don't exist
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            isVerified: true,
            role: "owner", // Default role is "owner"
          });
        }

        // Ensure Owner Profile Exists (Only for "owner" role)
        let ownerId = null;
        if (user.role === "owner") {
          const owner = await Owner.findOneAndUpdate(
            { userId: user._id },
            {
              userId: user._id,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
            },
            { upsert: true, new: true } // Create if doesn't exist
          );

          ownerId = owner._id;
        }

        // Generate JWT with ownerId (only if role is "owner")
        const tokenPayload = { id: user._id, role: user.role };
        if (ownerId) tokenPayload.ownerId = ownerId;

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log("✅ Google Login Success:", { token, user, ownerId });
        done(null, user); // ✅ Only return `user`
      } catch (error) {
        console.error("❌ Google authentication error:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing User:", user); // ✅ Debugging log
  if (!user || !user._id) {
    console.error("❌ User ID is missing! Full user:", user);
    return done(new Error("User ID is missing for serialization"));
  }
  done(null, user._id);
});



passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(new Error("User not found"));
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

