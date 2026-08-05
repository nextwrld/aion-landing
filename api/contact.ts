import { contactSchema, renderContactEmail } from "./_utils/contact.js";
import { sendEmail } from "./_utils/email.js";

const MAX_BODY_BYTES = 16 * 1024;
const PROVIDER_ERROR = "Unable to send message. Please try again later.";

type Request = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};

type Response = {
  status(code: number): Response;
  json(body: unknown): Response;
};

type SendEmail = typeof sendEmail;

function header(req: Request, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function createContactHandler(send: SendEmail = sendEmail) {
  return async function handler(req: Request, res: Response) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const contentType = header(req, "content-type");
    if (!contentType || !/^application\/json(?:\s*;\s*charset=[^;\s]+)?$/i.test(contentType)) {
      return res.status(415).json({ error: "Content-Type must be application/json" });
    }

    const declaredLength = header(req, "content-length");
    if (declaredLength !== undefined) {
      const parsedLength = Number(declaredLength);
      if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
        return res.status(400).json({ error: "Invalid Content-Length" });
      }
      if (parsedLength > MAX_BODY_BYTES) {
        return res.status(413).json({ error: "Request body too large" });
      }
    }

    if (!isPlainObject(req.body)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    if (Buffer.byteLength(JSON.stringify(req.body), "utf8") > MAX_BODY_BYTES) {
      return res.status(413).json({ error: "Request body too large" });
    }

    const result = contactSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    try {
      await send({
        to: process.env.EMAIL_FROM || "contact@nextwrld.com",
        subject: `Solicitud de DEMO AION WELLNESS y contacto: ${result.data.fullName}`,
        html: renderContactEmail(result.data),
      });
    } catch {
      console.error({ event: "contact_email_provider_failure" });
      return res.status(502).json({ error: PROVIDER_ERROR });
    }

    return res.status(200).json({ success: true, message: "Email sent successfully" });
  };
}

export default createContactHandler();
