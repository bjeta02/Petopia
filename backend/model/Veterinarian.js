import mongoose from "mongoose";

const vetSchema = new mongoose.Schema({
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    name: String,
    email: String,
    phone: String,
    specialization: String,
    availability_schedule: String
}, { timestamps: true });

export default mongoose.model("Veterinarian", vetSchema);
