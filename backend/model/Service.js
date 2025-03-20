import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    name: String,
    description: String,
    estimated_duration: Number,
    rate: String,
}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);