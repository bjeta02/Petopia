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

export const sendAppointmentEmail = async (email, appointmentDetails, pdfBuffer) => {
    try {
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error("❌ PDF Buffer is empty or undefined!");
        }

        console.log("📩 Sending email with PDF attachment, size:", pdfBuffer.length, "bytes");

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
                <hr>
                <p style="font-size: 12px; color: gray;">This is an automated message from Petopia. Please do not reply to this email.</p>
            `,
            attachments: [
                {
                    filename: `appointment-${appointmentDetails.appointmentId}.pdf`,
                    content: pdfBuffer, // Ensure proper passing of the buffer
                    contentType: "application/pdf",
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Appointment Confirmation Email sent:", info.response);
    } catch (error) {
        console.error("❌ Error sending appointment confirmation email:", error);
    }
};


// Send Appointment Status Update Email
export const sendAppointmentStatusUpdateEmail = async (email, appointmentDetails, status, pdfBuffer) => {
    try {
        let subject;
        let message;
        let attachments = [];

        // Determine the subject and message based on the status
        switch (status) {
            case "Confirmed":
                subject = "Service Confirmed - Petopia";
                message = `
                    <h2>Your Service is Confirmed!</h2>
                    <p>Thank you ${appointmentDetails.firstName || "Valued Customer"} for booking an appointment at <strong>${appointmentDetails.clinicName}</strong>!</p>
                    <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleString()}</p>
                    <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                    <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                    <p>We look forward to seeing you and your furry friend!</p>
                    <hr>
                    <p style="font-size: 12px; color: gray;">This is an automated message from Petopia. Please do not reply to this email.</p>
                `;
                break;
            case "Completed":
                subject = "Service Completed - Petopia";
                message = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
                        <h2 style="text-align: center; color: #4CAF50;">🐾 Petopia Invoice 🐾</h2>
                        <p style="text-align: center;">Thank you for visiting <strong>${appointmentDetails.clinicName}</strong>!</p>
                        
                        <hr style="border: 1px solid #ddd; margin: 20px 0;">
                        
                        <h3 style="color: #333;">Appointment Details:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Date & Time:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(appointmentDetails.date).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Service:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${appointmentDetails.serviceName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Pet Name:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${appointmentDetails.petName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Notes:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${appointmentDetails.notes}</td>
                            </tr>
                        </table>

                        <h3 style="color: #333;">Billing Summary:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${appointmentDetails.price}</td>
                            </tr>
                        </table>

                        <hr style="border: 1px solid #ddd; margin: 20px 0;">

                        <p style="text-align: center;">We appreciate your trust in <strong>${appointmentDetails.clinicName}</strong>. 🐶🐱</p>
                        
                        <p style="text-align: center;">📍 ${appointmentDetails.clinicAddress}</p>

                        <p style="text-align: center; font-size: 14px; color: #888;">
                            If you have any questions, please contact us at <strong>${appointmentDetails.clinicEmail || "No email provided"}</strong>. <br>
                            Thank you and see you again soon!
                        </p>

                        <hr>
                        <p style="font-size: 12px; color: gray;">This is an automated message from Petopia. Please do not reply to this email.</p>
                    </div>
                `;

                // Attach PDF only for "Completed" status
                if (pdfBuffer) {
                    attachments.push({
                        filename: `appointment-${appointmentDetails.appointmentId}.pdf`,
                        content: pdfBuffer,
                        contentType: "application/pdf",
                    });
                }
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
                    <hr>
                    <p style="font-size: 12px; color: gray;">This is an automated message from Petopia. Please do not reply to this email.</p>
                `;
                break;
            case "In-progress":
                subject = "Service In Progress - Petopia";
                message = `
                    <h2>Service is Currently In progress!</h2>
                    <p>Thank you for your patience while we take care of your furry friend at <strong>${appointmentDetails.clinicName}</strong>.</p>
                    <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleString()}</p>
                    <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                    <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                    <p>We will keep you updated on the progress!</p>
                    <hr>
                    <p style="font-size: 12px; color: gray;">This is an automated message from Petopia. Please do not reply to this email.</p>
                `;
                break;
            case "Ready-for-pickup":
                subject = "Ready for Pickup - Petopia";
                message = `
                    <h2>Your Pet is Ready for Pickup!</h2>
                    <p>Your furry friend is ready to go home from <strong>${appointmentDetails.clinicName}</strong>!</p>
                    <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleString()}</p>
                    <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                    <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                    <p>Please come to pick them up at your earliest convenience.</p>
                    <hr>
                    <p style="font-size: 12px; color: gray;">This is an automated message from Petopia. Please do not reply to this email.</p>
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
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`${status.charAt(0).toUpperCase() + status.slice(1)} Email sent: `, info.response);
    } catch (error) {
        console.error(`Error sending ${status} appointment email:`, error);
    }
};

// Send Follow-Up Email to Clinic
export const sendFollowUpEmailToClinic = async (clinicEmail, appointmentDetails) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: clinicEmail,
            subject: "Follow-Up Appointment Reminder - Petopia",
            html: `
                <h2>Follow-Up Appointment Reminder</h2>
                <p>This is a reminder for a follow-up appointment at <strong>${appointmentDetails.clinicName}</strong>.</p>
                <p><strong>Appointment ID:</strong> ${appointmentDetails.appointmentId}</p>
                <p><strong>Owner Name:</strong> ${appointmentDetails.firstName} ${appointmentDetails.lastName}</p>
                <p><strong>Pet Name:</strong> ${appointmentDetails.petName}</p>
                <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                <p><strong>Follow-Up Date:</strong> ${new Date(appointmentDetails.followUpDate).toLocaleString()}</p>
                <p><strong>Notes:</strong> ${appointmentDetails.notes || "No additional notes provided."}</p>
                <p>Thank you for providing excellent care to our furry friends!</p>
                <hr>
                <p style="font-size: 12px; color: gray;">This is an automated message from Petopia. Please do not reply to this email.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Follow-Up Email sent to clinic: ", info.response);
    } catch (error) {
        console.error("Error sending follow-up email to clinic:", error);
    }
};