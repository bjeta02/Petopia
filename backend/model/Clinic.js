import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
    name: String,
    address: String,
    contact_number: String,
    email: String,
    description: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    days: String,
    open_time: String,
    close_time: String,
    image: { type: String, default: "https://via.placeholder.com/150" }
}, { timestamps: true });

export default mongoose.model("Clinic", clinicSchema);