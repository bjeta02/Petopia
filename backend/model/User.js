import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ["pet_owner", "clinic"], 
        required: false
    },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);