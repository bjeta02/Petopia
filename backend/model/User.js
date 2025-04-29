import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstname: { type: String, },
    lastname: { type: String, },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ['admin', 'clinic', 'owner'], default: 'owner' }, // Role added
    address: String,
    status: { type: String, enum: ["Active", "Inactive"], default: "Inactive" },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    googleId: { type: String }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
