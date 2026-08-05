import { z } from "zod";

function hasUnsafeControl(value: string, allowMultiline = false): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    if (allowMultiline && (code === 9 || code === 10)) return false;
    return code < 32 || code === 127;
  });
}

const singleLine = (max: number) =>
  z.string().trim().min(1).max(max).refine((value) => !hasUnsafeControl(value));

const message = z
  .string()
  .transform((value) => value.replace(/\r\n/g, "\n"))
  .pipe(
    z
      .string()
      .trim()
      .min(1)
      .max(2000)
      .refine((value) => !hasUnsafeControl(value, true)),
  );

const phone = singleLine(32).refine((value) => {
  const digitCount = value.replace(/\D/g, "").length;
  return /^[0-9+().\-\s]+$/.test(value) && digitCount >= 7 && digitCount <= 15;
});

export const contactSchema = z.strictObject({
  fullName: singleLine(100),
  email: singleLine(254).pipe(z.email()),
  phone,
  gymName: singleLine(120),
  members: z.string().trim().pipe(z.enum(["lt_100", "100_400", "gt_400"])),
  message,
});

export type Contact = z.infer<typeof contactSchema>;

const memberLabels: Record<Contact["members"], string> = {
  lt_100: "Menos de 100",
  "100_400": "100 - 400",
  gt_400: "Más de 400",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function renderContactEmail(contact: Contact): string {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <h2 style="margin: 0 0 16px; color: #0b3b8f;">Solicitud de DEMO y contacto para usar AION Wellness</h2>
      <p style="margin: 0 0 20px; color: #334155;">Llegó un nuevo interesado desde el formulario web.</p>

      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #f8fafc;">
        <p style="margin: 0 0 10px;"><strong>Nombre:</strong> ${escapeHtml(contact.fullName)}</p>
        <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
        <p style="margin: 0 0 10px;"><strong>Teléfono:</strong> ${escapeHtml(contact.phone)}</p>
        <p style="margin: 0 0 10px;"><strong>Gimnasio:</strong> ${escapeHtml(contact.gymName)}</p>
        <p style="margin: 0 0 10px;"><strong>Miembros:</strong> ${escapeHtml(memberLabels[contact.members])}</p>
        <p style="margin: 0 0 6px;"><strong>Mensaje:</strong></p>
        <div style="white-space: pre-wrap; line-height: 1.5; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">${escapeHtml(contact.message)}</div>
      </div>
    </div>
  `;
}
