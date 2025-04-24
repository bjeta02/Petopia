import { QRCodeCanvas } from "qrcode.react";

const VerificationQRCode = ({ appointmentId }) => {
  const verifyUrl = `http://10.0.14.50:3000/verify?appointmentId=${appointmentId}`;

  return <QRCodeCanvas value={verifyUrl} size={200} />;
};

export default VerificationQRCode;