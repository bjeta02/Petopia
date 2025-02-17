import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true},
    name: String,
    type: String,
    breed: String,
    age: Number,
    gender: String,
    medical_history: String
}, { timestamps: true });

export default mongoose.model("Pet", petSchema);
