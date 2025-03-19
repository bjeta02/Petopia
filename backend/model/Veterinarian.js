import mongoose from "mongoose";

const veterinarianSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        licenseNumber: { type: String, required: true, unique: true },
        clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
        specialties: { type: [String], default: [] }, // list of specialties (e.g., surgery, dentistry)
        bio: { type: String }, // a short biography about the veterinarian
        yearsOfExperience: { type: Number, default: 0 },
        photoUrl: { type: String }, // URL of the veterinarian's photo
        availableDays: { type: [String], default: [] }, // e.g., ["Monday", "Wednesday"]
        availableHours: { type: String } // e.g., "9:00 AM - 5:00 PM"
    },
    { timestamps: true }
);

export default mongoose.model("Veterinarian", veterinarianSchema);