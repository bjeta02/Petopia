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
        rejectUnauthorized: false,
    },
});

// Send OTP Email
export const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code - Petopia",
            html: `<p>Your OTP code is: <strong>${otp}</strong>. It expires in 5 minutes.</p> `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("OTP Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

// Send Appointment Confirmation Email
export const sendAppointmentEmail = async (email, appointmentDetails) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Appointment Confirmation - Petopia",
            html: `
                <h2>Appointment Confirmation</h2>
                <p>Thank you for booking an appointment at <strong>${appointmentDetails.clinicName}</strong>!</p>
                <p><strong>Date:</strong> ${appointmentDetails.date}</p>
                <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                <p>We look forward to seeing you and your furry friend!</p>
            `  ,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Appointment Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending appointment email:", error);
    }
};