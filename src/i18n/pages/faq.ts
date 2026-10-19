import type { Lang } from '../content'

type QA = { q: string; a: string }
type Category = { id: string; title: string; items: QA[] }

const es = {
  hero: {
    badge: 'PREGUNTAS FRECUENTES',
    title: 'Tener dudas es normal. Nosotros tenemos respuestas.',
    subtitle: 'Todo lo que necesitas saber sobre AION, organizado por tema. Si no encuentras tu pregunta, escríbenos.',
  },
  search: {
    label: 'Buscar una pregunta',
    placeholder: 'Escribe una palabra, por ejemplo “sedes” o “acceso”',
    all: 'Todas',
    empty: 'No encontramos preguntas con esa búsqueda.',
    results: (n: number) => (n === 1 ? '1 pregunta' : `${n} preguntas`),
  },
  categories: [
    {
      id: 'producto',
      title: 'Producto',
      items: [
        {
          q: '¿Qué es AION?',
          a: 'AION es un sistema web para gestionar gimnasios y centros deportivos. Reúne miembros, membresías, cobros, control de acceso, reportes y sedes en una sola herramienta.',
        },
        {
          q: '¿Para qué tipo de negocios sirve?',
          a: 'Para gimnasios, boxes de entrenamiento funcional, estudios de yoga, pilates o baile, centros deportivos y clubes, instituciones con instalaciones deportivas y cadenas con varias sedes.',
        },
        {
          q: '¿Qué funciones incluye hoy?',
          a: 'Registro y cobro de miembros, control de acceso, monitoreo de membresías, reportes y gestión de varias sedes.',
        },
        {
          q: '¿Qué funciones vienen próximamente?',
          a: 'Estamos desarrollando un módulo para entrenadores y el control de acceso por reconocimiento facial.',
        },
        {
          q: '¿Puedo manejar varias sedes?',
          a: 'Sí. Puedes administrar cada sede por separado o ver el negocio completo desde una sola cuenta.',
        },
      ],
    },
    {
      id: 'implementacion',
      title: 'Implementación',
      items: [
        {
          q: '¿Es difícil migrar desde Excel o cuadernos?',
          a: 'No. Durante la puesta en marcha nuestro equipo te acompaña para cargar la información de tus miembros, sin que tengas que dejar de atender.',
        },
        {
          q: '¿Cuánto tiempo toma empezar?',
          a: 'Depende del tamaño de tu negocio y de cómo tengas tu información hoy. En la demo revisamos tu caso y te damos un estimado.',
        },
        {
          q: '¿Necesito conocimientos técnicos?',
          a: 'No. La interfaz está pensada para recepcionistas y dueños, y te acompañamos en la capacitación de tu equipo.',
        },
        {
          q: '¿Qué equipos necesito?',
          a: 'Solo una computadora o tablet con internet en la recepción. No necesitas instalar programas ni tener servidores propios.',
        },
      ],
    },
    {
      id: 'acceso',
      title: 'Acceso y recepción',
      items: [
        {
          q: '¿Cómo funciona el control de acceso?',
          a: 'En la recepción se ingresa el ID del cliente. AION verifica el estado de su membresía, muestra si puede entrar y registra el check-in.',
        },
        {
          q: '¿Tienen reconocimiento facial?',
          a: 'Todavía no. El acceso por reconocimiento facial está en desarrollo y llegará en una próxima versión.',
        },
        {
          q: '¿Qué pasa si un miembro tiene la membresía vencida?',
          a: 'El sistema lo indica con una alerta visual. La recepción puede registrar el cobro en ese momento y la membresía se actualiza.',
        },
      ],
    },
    {
      id: 'pagos',
      title: 'Cobros, caja y reportes',
      items: [
        {
          q: '¿Qué métodos de pago puedo registrar?',
          a: 'Registras los cobros con el método que uses en tu negocio, por ejemplo efectivo, transferencia o pago móvil. Cada cobro queda asociado al miembro.',
        },
        {
          q: '¿Cómo funciona el cierre de caja?',
          a: 'AION reúne los cobros del día por método de pago. Ves el total esperado y lo comparas con lo que hay en caja.',
        },
        {
          q: '¿Qué reportes ofrece?',
          a: 'Ingresos por período y método de pago, asistencias y estado de las membresías. Si tienes varias sedes, puedes verlos por sede o en conjunto.',
        },
      ],
    },
    {
      id: 'soporte',
      title: 'Soporte y demo',
      items: [
        {
          q: '¿Puedo ver una demostración antes?',
          a: 'Sí. Agenda una demostración gratuita y sin compromiso para conocer cómo funcionaría AION en tu negocio.',
        },
        {
          q: '¿Cuánto cuesta AION?',
          a: 'Te compartimos los planes y precios durante la demostración, según las necesidades de tu negocio.',
        },
        {
          q: '¿Cómo los contacto?',
          a: 'Por WhatsApp desde Venezuela o Argentina, por Instagram o con el formulario de la página de contacto.',
        },
        {
          q: '¿Ofrecen soporte después de la implementación?',
          a: 'Sí. Tienes soporte directo por WhatsApp para las dudas del día a día.',
        },
      ],
    },
  ] satisfies Category[],
  stillQuestions: {
    title: '¿No encontraste tu respuesta?',
    text: 'Escríbenos y te ayudamos con tu caso.',
    cta: 'Ir a contacto',
  },
}

export type FaqContent = typeof es

const en: FaqContent = {
  hero: {
    badge: 'FREQUENTLY ASKED QUESTIONS',
    title: 'Having questions is normal. We have answers.',
    subtitle: 'Everything you need to know about AION, organized by topic. If you cannot find your question, write to us.',
  },
  search: {
    label: 'Search a question',
    placeholder: 'Type a word, for example “locations” or “access”',
    all: 'All',
    empty: 'No questions match that search.',
    results: (n: number) => (n === 1 ? '1 question' : `${n} questions`),
  },
  categories: [
    {
      id: 'producto',
      title: 'Product',
      items: [
        {
          q: 'What is AION?',
          a: 'AION is a web-based system to manage gyms and sports centers. It brings members, memberships, billing, access control, reports and locations into one tool.',
        },
        {
          q: 'What kind of businesses is it for?',
          a: 'Gyms, functional training boxes, yoga, pilates or dance studios, sports centers and clubs, institutions with sports facilities and multi-location chains.',
        },
        {
          q: 'What features does it include today?',
          a: 'Member registration and billing, access control, membership monitoring, reports and multi-location management.',
        },
        {
          q: 'What features are coming soon?',
          a: 'We are building a trainer module and facial recognition access control.',
        },
        {
          q: 'Can I manage multiple locations?',
          a: 'Yes. You can manage each location separately or see the whole business from one account.',
        },
      ],
    },
    {
      id: 'implementacion',
      title: 'Onboarding',
      items: [
        {
          q: 'Is it hard to move from spreadsheets or notebooks?',
          a: 'No. During onboarding our team helps you load your member information, without you having to stop operating.',
        },
        {
          q: 'How long does it take to get started?',
          a: 'It depends on the size of your business and how your information is organized today. In the demo we review your case and give you an estimate.',
        },
        {
          q: 'Do I need technical knowledge?',
          a: 'No. The interface is designed for front desk staff and owners, and we help you train your team.',
        },
        {
          q: 'What equipment do I need?',
          a: 'Just a computer or tablet with internet at the front desk. No software to install and no servers of your own.',
        },
      ],
    },
    {
      id: 'acceso',
      title: 'Access and front desk',
      items: [
        {
          q: 'How does access control work?',
          a: 'The front desk enters the client ID. AION checks their membership status, shows whether they can come in and records the check-in.',
        },
        {
          q: 'Do you have facial recognition?',
          a: 'Not yet. Facial recognition access is in development and will arrive in an upcoming version.',
        },
        {
          q: 'What happens if a member’s membership has expired?',
          a: 'The system shows a visual alert. The front desk can record the payment right away and the membership updates.',
        },
      ],
    },
    {
      id: 'pagos',
      title: 'Billing, cash and reports',
      items: [
        {
          q: 'Which payment methods can I record?',
          a: 'You record payments with whatever method your business uses, for example cash, bank transfer or mobile payment. Each payment is linked to the member.',
        },
        {
          q: 'How does cash closing work?',
          a: 'AION groups the day’s payments by method. You see the expected total and compare it with what is in the till.',
        },
        {
          q: 'What reports does it offer?',
          a: 'Revenue by period and payment method, attendance and membership status. With multiple locations, you can view them per location or combined.',
        },
      ],
    },
    {
      id: 'soporte',
      title: 'Support and demo',
      items: [
        {
          q: 'Can I see a demo first?',
          a: 'Yes. Book a free, no-commitment demo to see how AION would work in your business.',
        },
        {
          q: 'How much does AION cost?',
          a: 'We share plans and pricing during the demo, based on your business needs.',
        },
        {
          q: 'How can I contact you?',
          a: 'On WhatsApp from Venezuela or Argentina, on Instagram or through the form on the contact page.',
        },
        {
          q: 'Do you offer support after onboarding?',
          a: 'Yes. You get direct support on WhatsApp for day-to-day questions.',
        },
      ],
    },
  ],
  stillQuestions: {
    title: 'Did not find your answer?',
    text: 'Write to us and we will help with your case.',
    cta: 'Go to contact',
  },
}

export const faqContent: Record<Lang, FaqContent> = { es, en }
