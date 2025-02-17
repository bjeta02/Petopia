import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
    pet_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    vet_id: { type: mongoose.Schema.Types.ObjectId, ref: "Veterinarian", required: false },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    date: Date,
    status: { type: String, enum: ["pending", "confirmed", "completed", "canceled"], default: "pending" },
    notes: String
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
