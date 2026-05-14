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
    const { fullName, email, phone, gymName, members, message } = req.body || {};

    if (!fullName || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailHtml = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin: 0 0 16px; color: #0b3b8f;">Solicitud de DEMO y contacto para usar AION Wellness</h2>
        <p style="margin: 0 0 20px; color: #334155;">Llegó un nuevo interesado desde el formulario web.</p>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #f8fafc;">
          <p style="margin: 0 0 10px;"><strong>Nombre:</strong> ${fullName}</p>
          <p style="margin: 0 0 10px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 10px;"><strong>Teléfono:</strong> ${phone || "No informado"}</p>
          <p style="margin: 0 0 10px;"><strong>Gimnasio:</strong> ${gymName || "No informado"}</p>
          <p style="margin: 0 0 10px;"><strong>Miembros:</strong> ${members || "No informado"}</p>
          <p style="margin: 0 0 6px;"><strong>Mensaje:</strong></p>
          <div style="white-space: pre-wrap; line-height: 1.5; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">${message}</div>
        </div>
      </div>
    `;

    await sendEmail({
      to: process.env.EMAIL_FROM || "contact@nextwrld.com",
      subject: `Solicitud de DEMO AION WELLNESS y contacto: ${fullName}`,
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
