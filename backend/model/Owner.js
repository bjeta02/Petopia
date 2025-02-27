import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    password: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    address: String,
    pet_count: { type: Number, default: 0 },
    isGuest: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Owner", OwnerSchema);