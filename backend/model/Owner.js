import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // No trailing space
    name: String,
    email: String,
    phone: String,
    address: String,
    pet_count: Number,
}, { timestamps: true });

export default mongoose.model("Owner", OwnerSchema);