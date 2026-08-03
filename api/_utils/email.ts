import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const smtpOptions = {
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "465"),
  secure: parseInt(process.env.EMAIL_SERVER_PORT || "465") === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

export const sendEmail = async (data: EmailPayload) => {
  const transporter = nodemailer.createTransport({
    ...smtpOptions,
  });

  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...data,
    });
    console.log("✅ Email sent:", result.messageId);
    return result;
  } catch (error: unknown) {
    console.error("❌ Email error:", error instanceof Error ? error.message : String(error));
    throw error;
  }
};
