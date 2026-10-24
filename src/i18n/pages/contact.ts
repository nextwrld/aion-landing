import type { Lang } from '../content'

const es = {
  hero: {
    badge: 'CONTACTO',
    title: 'Hablemos de tu negocio',
    subtitle:
      'Agenda una demostración gratuita o escríbenos directamente. Te mostramos cómo funcionaría AION en tu operación, sin compromiso.',
  },
  channels: {
    badge: 'CANALES DIRECTOS',
    title: '¿Prefieres escribirnos?',
    subtitle: 'Elige el canal que te quede más cómodo.',
    whatsappCta: 'Abrir WhatsApp',
    instagramCta: 'Ver perfil',
    emailCta: 'Enviar correo',
  },
  nextSteps: {
    badge: 'QUÉ PASA DESPUÉS',
    title: 'Después de enviar tu solicitud',
    steps: [
      { title: 'Recibimos tu solicitud', description: 'Tu mensaje llega directo a nuestro equipo.' },
      { title: 'Te contactamos', description: 'Coordinamos contigo el mejor día y horario para la demo.' },
      { title: 'Te mostramos AION', description: 'Vemos juntos cómo se aplicaría a tu negocio y resolvemos tus dudas.' },
    ],
  },
}

export type ContactContent = typeof es

const en: ContactContent = {
  hero: {
    badge: 'CONTACT',
    title: 'Let’s talk about your business',
    subtitle:
      'Book a free demo or write to us directly. We will show you how AION would work in your operation, no commitment.',
  },
  channels: {
    badge: 'DIRECT CHANNELS',
    title: 'Prefer to message us?',
    subtitle: 'Choose the channel that suits you best.',
    whatsappCta: 'Open WhatsApp',
    instagramCta: 'View profile',
    emailCta: 'Send email',
  },
  nextSteps: {
    badge: 'WHAT HAPPENS NEXT',
    title: 'After you send your request',
    steps: [
      { title: 'We receive your request', description: 'Your message goes straight to our team.' },
      { title: 'We contact you', description: 'We agree on the best day and time for the demo.' },
      { title: 'We show you AION', description: 'Together we see how it would apply to your business and answer your questions.' },
    ],
  },
}

export const contactContent: Record<Lang, ContactContent> = { es, en }
