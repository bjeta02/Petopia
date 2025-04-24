    import mongoose from "mongoose";

    const OwnerSchema = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        firstname: String,
        lastname: String,
        email: String,
        address: String,
        phone: String,
        pet_count: { type: Number, default: 0 },
        isGuest: { type: Boolean, default: false },
        avatar: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/847/847969.png', }
    }, );

    export default mongoose.model("Owner", OwnerSchema);