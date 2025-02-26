import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    password: String,
    email: String,
    phone: String,
    address: String,
    pet_count: Number,
}, { timestamps: true });

export default mongoose.model("Owner", OwnerSchema);