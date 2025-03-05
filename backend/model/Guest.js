import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., Dog, Cat
    breed: { type: String },
    gender: {type: String},
    age: { type: Number },
    // Add other pet-related fields as necessary
});

const guestSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Ensure email is unique
    phone: { type: String },
    pets: [petSchema], // Array of pets associated with the guest
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }], // Reference to appointments
}, { timestamps: true });

const Guest = mongoose.model('Guest', guestSchema);
export default Guest;