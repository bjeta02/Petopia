import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
    name: String,
    email: String, // unique: true 
    phone: String,
    password: String,
    address: String,
}, { timestamps: true });

export default mongoose.model("Owner", ownerSchema);  
