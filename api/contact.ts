import { sendEmail } from "./_utils/email";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fullName, email, phone, message } = req.body || {};

    if (!fullName || !email || !message) {
      console.error("❌ Validation failed:", {
        fullName: !!fullName,
        email: !!email,
        message: !!message,
      });

      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail({
      to: process.env.EMAIL_FROM || "contact@nextwrld.com",
      subject: `New Contact Form: ${fullName}`,
      html: emailHtml,
    });

    console.log("✅ Email sent successfully!");

    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("❌ Error sending email:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      error: "Failed to send email",
      details: error.message,
      hint: "Check server logs for more details",
    });
  }
}
