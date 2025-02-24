    import mongoose from "mongoose";

    const clinicSchema = new mongoose.Schema({
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        address: String,
        contact_number: { type: String, required: true },
        description: String,
        status: { type: String, enum: ["Active", "Inactive"], default: "Inactive" },
        days: String,
        open_time: String,
        close_time: String,
        image: { type: String, default: "https://via.placeholder.com/150" },
        logo: { type: String },
    }, { timestamps: true });

    export default mongoose.model("Clinic", clinicSchema);