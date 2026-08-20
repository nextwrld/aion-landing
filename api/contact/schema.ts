import { z } from "zod";

/**
 * Schema for POST /api/contact
 * - fullName, email, message are required with trim().min(1)
 * - phone, gymName, members are optional with default("")
 * - website (honeypot) and turnstileToken are optional
 * - Unknown fields are stripped (default Zod behaviour, explicit)
 */
export const contactRequestSchema = z
  .object({
    fullName: z.string().trim().min(1),
    email: z.string().trim().min(1),
    message: z.string().trim().min(1),
    phone: z.string().optional().default(""),
    gymName: z.string().optional().default(""),
    members: z.string().optional().default(""),
    website: z.string().optional().default(""),
    turnstileToken: z.string().optional(),
  })
  .strip();

export type ContactRequest = z.infer<typeof contactRequestSchema>;
