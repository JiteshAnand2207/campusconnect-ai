import crypto from "crypto";

const generateTicketCode = () => {
  const randomPart = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `CCAI-${randomPart}`;
};

export default generateTicketCode;