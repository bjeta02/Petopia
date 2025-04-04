import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";

// Generate QR Code
const generateQRCode = async (text) => {
    try {
        console.log("🔄 Generating QR Code...");
        return await QRCode.toDataURL(text);
    } catch (error) {
        console.error("❌ Error generating QR Code:", error);
        return null;
    }
};

const createPDF = async (appointmentDetails, qrCode) => {
    return new Promise((resolve, reject) => {
        try {
            console.log("📄 Generating PDF for Appointment:", appointmentDetails.appointmentId);

            const doc = new PDFDocument({ margin: 50 });
            const bufferStream = new streamBuffers.WritableStreamBuffer();
            doc.pipe(bufferStream);

            // PDF Content
            doc.fontSize(18).text("Appointment Confirmation", { align: "center" }).moveDown(1);
            doc.fontSize(12).text(`Appointment ID: ${appointmentDetails.appointmentId}`).moveDown(0.5);
            doc.text(`Clinic: ${appointmentDetails.clinicName}`);
            doc.text(`Address: ${appointmentDetails.clinicAddress}`).moveDown(1);
            doc.fontSize(14).text("Appointment Details", { underline: true }).moveDown(0.5);
            doc.fontSize(12).text(`Date & Time: ${new Date(appointmentDetails.date).toLocaleString()}`);
            doc.text(`Service: ${appointmentDetails.serviceName}`);
            doc.text(`Notes: ${appointmentDetails.notes || "No additional notes provided."}`).moveDown(1);

            // QR Code Embedding
            if (qrCode) {
                try {
                    const qrBuffer = Buffer.from(qrCode.split(",")[1], "base64");
                    doc.image(qrBuffer, { fit: [150, 150], align: "center" }).moveDown(1);
                    doc.text("Scan the QR code for appointment details.", { align: "center" });
                } catch (qrError) {
                    console.error("❌ Error embedding QR Code in PDF:", qrError);
                }
            } else {
                console.warn("⚠️ No QR Code generated, skipping QR section.");
            }

            // Footer
            doc.moveDown(2).fontSize(10).text("Thank you for booking with us!", { align: "center" });

            doc.end();

            bufferStream.on("finish", () => {
                const pdfBuffer = bufferStream.getContents();
                if (!pdfBuffer || pdfBuffer.length === 0) {
                    reject(new Error("❌ PDF Buffer is empty after generation."));
                } else {
                    console.log("✅ PDF Generated Successfully! Size:", pdfBuffer.length, "bytes");
                    resolve(pdfBuffer);
                }
            });

            bufferStream.on("error", (err) => {
                reject(new Error(`❌ Error writing PDF to buffer: ${err.message}`));
            });
        } catch (error) {
            reject(new Error(`❌ Unexpected error generating PDF: ${error.message}`));
        }
    });
};


export { generateQRCode, createPDF };
