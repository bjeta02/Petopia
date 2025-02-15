import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Owner" },
    pet_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    vet_id: { type: mongoose.Schema.Types.ObjectId, ref: "Veterinarian", required: false },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    date: Date,
    start_time: String,
    end_time: String,
    status: { type: String, enum: ["pending", "confirmed", "completed", "canceled"], default: "pending" },
    notes: String
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
