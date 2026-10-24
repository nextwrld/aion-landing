// Public contact channels shown across the site.
export const CONTACT = {
  email: 'contact@nextwrld.com',
  instagram: {
    handle: '@nextwrld.tech',
    url: 'https://www.instagram.com/nextwrld.tech/',
  },
  whatsapp: [
    { country: 've', display: '+58 424-4587200', number: '584244587200' },
    { country: 'ar', display: '+54 9 11 7367-8601', number: '5491173678601' },
  ],
} as const

export type WhatsAppCountry = (typeof CONTACT.whatsapp)[number]['country']

export function whatsappUrl(number: string, text?: string): string {
  const base = `https://wa.me/${number}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
