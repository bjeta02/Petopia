import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export default async function sendReminder({ email, petOwnerName, clinicName, date, startTime }) {
    const mailOptions = {
        from: '"Petopia" <petopia144@gmail.com>',
        to: email,
        subject: 'Appointment Reminder - Petopia',
        html: `
            <h2>Hi ${petOwnerName}!</h2>
            <p>This is a friendly reminder that you have an appointment scheduled at <strong>${clinicName}</strong>.</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${startTime || 'N/A'}</p>
            <p>See you soon! 🐾</p>
            <br/>
            <p>- Petopia Team</p>
            <hr>
            <p style="font-size: 12px; color: gray;">This is an automated message from Petopia. Please do not reply to this email.</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Reminder sent successfully to', email);
    } catch (error) {
        console.error('Failed to send reminder', error);
    }
}