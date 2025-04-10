import { QRCodeCanvas } from "qrcode.react";

const VerificationQRCode = ({ appointmentId }) => {
  const verifyUrl = `http://192.168.1.13:3000/verify?appointmentId=${appointmentId}`;

  return <QRCodeCanvas value={verifyUrl} size={200} />;
};

export default VerificationQRCode;