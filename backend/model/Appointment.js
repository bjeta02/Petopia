import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: false },
        pet_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: false },
        guest_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
        clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
        vet_id: { type: mongoose.Schema.Types.ObjectId, ref: "Veterinarian", required: false },
        service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
        date: Date,
        status: { type: String, enum: ["Pending", "Confirmed", "Completed", "Canceled"], default: "Pending" },
        notes: String,
        confirmedAt: Date,
        completedAt: Date,
        rejectedAt: Date,

        // OTP fields
        otp: { type: String },
        otpExpires: { type: Date },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
