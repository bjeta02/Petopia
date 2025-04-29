    import mongoose from "mongoose";
    
    const clinicSchema = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String },
        address: String,
        contact_number: { type: String },
        email: { type: String, unique: true },
        password: { type: String, },
        description: String,
        status: { type: String, enum: ["Active", "Inactive"], default: "Inactive" },
        days: String,
        open_time: String,
        close_time: String,
        image: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
        logo: { type: String },
    }, { timestamps: true });

    export default mongoose.model("Clinic", clinicSchema);