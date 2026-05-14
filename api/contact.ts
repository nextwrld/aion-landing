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

const sendEmail = async (data: EmailPayload) => {
  const transporter = nodemailer.createTransport({
    ...smtpOptions,
  });

  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    ...data,
  });

  return result;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fullName, email, phone, message } = req.body || {};

    if (!fullName || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailHtml = `
      <h2>Solicitud de DEMO y contacto para usar AION Wellness</h2>
      <p><strong>Nombre:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone || "Not provided"}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail({
      to: process.env.EMAIL_FROM || "contact@nextwrld.com",
      subject: `Solicitud de DEMO y contacto: ${fullName}`,
      html: emailHtml,
    });

    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
}
