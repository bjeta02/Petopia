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
            html: `<p>Your OTP code is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
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
                <p>Thank you ${appointmentDetails.firstName || "Valued Customer"} for booking an appointment at <strong>${appointmentDetails.clinicName}</strong>!</p>
                <p><strong>Appointment ID:</strong> ${appointmentDetails.appointmentId}</p>
                <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleString()}</p>
                <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                <p><strong>Clinic Address:</strong> ${appointmentDetails.clinicAddress}</p>
                <p><strong>Notes:</strong> ${appointmentDetails.notes || "No additional notes provided."}</p>
                <p>We look forward to seeing you and your furry friend!</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Appointment Confirmation Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending appointment confirmation email:", error);
    }
};

// Send Appointment Status Update Email
export const sendAppointmentStatusUpdateEmail = async (email, appointmentDetails, status) => {
    try {
        let subject;
        let message;

        // Determine the subject and message based on the status
        switch (status) {
            case "Confirmed":
                subject = "Appointment Confirmed - Petopia";
                message = `
                    <h2>Your Appointment is Confirmed!</h2>
                    <p>Thank you ${appointmentDetails.firstName || "Valued Customer"} for booking an appointment at <strong>${appointmentDetails.clinicName}</strong>!</p>
                    <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleString()}</p>
                    <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                    <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                    <p>We look forward to seeing you and your furry friend!</p>
                `;
                break;
            case "Completed":
                subject = "Appointment Completed - Petopia";
                message = `
                    <h2>Your Appointment is Completed!</h2>
                    <p>Thank you for visiting <strong>${appointmentDetails.clinicName}</strong>!</p>
                    <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleString()}</p>
                    <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                    <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                    <p>We hope you had a great experience!</p>
                `;
                break;
            case "Cancelled":
                subject = "Appointment Cancelled - Petopia";
                message = `
                    <h2>Your Appointment has been Cancelled</h2>
                    <p>We're sorry to inform you that your appointment at <strong>${appointmentDetails.clinicName}</strong> has been cancelled.</p>
                    <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleString()}</p>
                    <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                    <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                    <p>If you have any questions, please contact us.</p>
                `;
                break;
            default:
                throw new Error("Invalid appointment status");
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            html: message,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`${status.charAt(0).toUpperCase() + status.slice(1)} Email sent: `, info.response);
    } catch (error) {
        console.error(`Error sending ${status} appointment email:`, error);
    }
};