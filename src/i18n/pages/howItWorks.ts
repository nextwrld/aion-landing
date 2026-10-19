import type { Lang } from '../content'

export type FlowMock = 'search' | 'memberships' | 'billing' | 'access' | 'cash'

type FlowStep = { mock: FlowMock; title: string; description: string; bullets: string[] }
type QA = { q: string; a: string }

const es = {
  hero: {
    badge: 'CÓMO FUNCIONA',
    title: 'Del primer contacto al día a día, sin complicaciones',
    subtitle:
      'Te acompañamos en la puesta en marcha y tu equipo incorpora AION a su rutina. Así es el camino, paso a paso.',
    cta: 'Agendar una demostración gratuita',
    secondary: 'Ver preguntas frecuentes',
  },
  onboarding: {
    badge: 'PUESTA EN MARCHA',
    title: 'Cinco pasos para empezar a operar con AION',
    subtitle: 'No tienes que hacerlo solo. Nuestro equipo te acompaña en cada etapa.',
    steps: [
      {
        title: 'Agenda una demo',
        description: 'Nos cuentas cómo funciona tu negocio y te mostramos AION con ejemplos de tu día a día.',
      },
      {
        title: 'Configuramos tu cuenta',
        description: 'Definimos tus planes, precios, métodos de pago y sedes.',
      },
      {
        title: 'Cargamos tus miembros',
        description: 'Te ayudamos a pasar la información que hoy tienes en cuadernos u hojas de cálculo.',
      },
      {
        title: 'Capacitamos a tu equipo',
        description: 'Recepción y administración practican el flujo diario con casos reales de tu negocio.',
      },
      {
        title: 'Empiezas a operar',
        description: 'Te acompañamos los primeros días con soporte directo por WhatsApp.',
      },
    ],
  },
  flow: {
    badge: 'EL DÍA A DÍA',
    title: 'Un día con AION en tu recepción',
    subtitle: 'Cinco acciones que se repiten con cada miembro, de la llegada al cierre del día.',
    stepLabel: 'Paso',
    steps: [
      {
        mock: 'search',
        title: 'Buscar al miembro',
        description: 'Cuando alguien llega, la recepción lo busca por nombre o cédula y abre su ficha en segundos.',
        bullets: ['Búsqueda instantánea', 'Ficha con datos, plan e historial'],
      },
      {
        mock: 'memberships',
        title: 'Ver su estado',
        description: 'AION muestra si la membresía está al día, en período de gracia o vencida.',
        bullets: ['Estado visible de un vistazo', 'Días restantes para el vencimiento'],
      },
      {
        mock: 'billing',
        title: 'Cobrar, si corresponde',
        description: 'Si debe renovar, se registra el pago con su método y la membresía se actualiza al momento.',
        bullets: ['Cobro asociado al miembro', 'Método de pago registrado'],
      },
      {
        mock: 'access',
        title: 'Permitir el acceso',
        description: 'Al ingresar el ID del cliente, el sistema indica si puede entrar y guarda el check-in.',
        bullets: ['Alerta visual: permitido o denegado', 'Check-in registrado automáticamente'],
      },
      {
        mock: 'cash',
        title: 'Cerrar la caja',
        description: 'Al final del día, AION suma los cobros por método de pago para que el cierre cuadre.',
        bullets: ['Totales por método de pago', 'Diferencias visibles al instante'],
      },
    ] satisfies FlowStep[],
  },
  requirements: {
    badge: 'REQUISITOS',
    title: 'Lo que necesitas para usar AION',
    items: [
      {
        title: 'Computadora o tablet con internet',
        description: 'AION funciona en el navegador. No tienes que instalar programas.',
      },
      {
        title: 'Sin servidores propios',
        description: 'El sistema funciona en la nube, así que no tienes equipos que mantener.',
      },
      {
        title: 'Tu equipo actual',
        description: 'Recepción y administración pueden usarlo sin conocimientos técnicos.',
      },
      {
        title: 'Acceso desde cualquier lugar',
        description: 'Como dueño, revisas tus reportes desde cualquier dispositivo con navegador.',
      },
    ],
  },
  faq: {
    title: 'Dudas frecuentes sobre la implementación',
    items: [
      {
        q: '¿Cuánto tiempo toma empezar?',
        a: 'Depende del tamaño de tu negocio y de cómo tengas tu información hoy. En la demo revisamos tu caso y te damos un estimado.',
      },
      {
        q: '¿Tengo que dejar de atender mientras implementamos?',
        a: 'No. La configuración y la carga de miembros se hacen en paralelo a tu operación normal.',
      },
      {
        q: '¿Qué pasa si mi equipo tiene dudas después?',
        a: 'Tienes soporte directo por WhatsApp para resolver dudas del día a día.',
      },
    ] satisfies QA[],
  },
}

export type HowItWorksContent = typeof es

const en: HowItWorksContent = {
  hero: {
    badge: 'HOW IT WORKS',
    title: 'From first contact to daily operations, without complications',
    subtitle:
      'We guide you through onboarding and your team builds AION into its routine. Here is the path, step by step.',
    cta: 'Book a free demo',
    secondary: 'See frequently asked questions',
  },
  onboarding: {
    badge: 'ONBOARDING',
    title: 'Five steps to start operating with AION',
    subtitle: 'You do not have to do it alone. Our team supports you at every stage.',
    steps: [
      {
        title: 'Book a demo',
        description: 'Tell us how your business works and we show you AION with examples from your daily routine.',
      },
      {
        title: 'We set up your account',
        description: 'We define your plans, prices, payment methods and locations.',
      },
      {
        title: 'We load your members',
        description: 'We help you move the information you keep today in notebooks or spreadsheets.',
      },
      {
        title: 'We train your team',
        description: 'Front desk and administration practice the daily flow with real cases from your business.',
      },
      {
        title: 'You start operating',
        description: 'We stay with you during the first days with direct support on WhatsApp.',
      },
    ],
  },
  flow: {
    badge: 'DAY TO DAY',
    title: 'A day with AION at your front desk',
    subtitle: 'Five actions repeated with every member, from arrival to the end of the day.',
    stepLabel: 'Step',
    steps: [
      {
        mock: 'search',
        title: 'Find the member',
        description: 'When someone arrives, the front desk searches by name or ID and opens their profile in seconds.',
        bullets: ['Instant search', 'Profile with details, plan and history'],
      },
      {
        mock: 'memberships',
        title: 'Check their status',
        description: 'AION shows whether the membership is up to date, in a grace period or expired.',
        bullets: ['Status visible at a glance', 'Days left until expiration'],
      },
      {
        mock: 'billing',
        title: 'Charge, if needed',
        description: 'If they need to renew, the payment is recorded with its method and the membership updates instantly.',
        bullets: ['Payment linked to the member', 'Payment method recorded'],
      },
      {
        mock: 'access',
        title: 'Grant access',
        description: 'When the client ID is entered, the system shows whether they can come in and saves the check-in.',
        bullets: ['Visual alert: granted or denied', 'Check-in recorded automatically'],
      },
      {
        mock: 'cash',
        title: 'Close the till',
        description: 'At the end of the day, AION adds up payments by method so the closing balances.',
        bullets: ['Totals by payment method', 'Gaps visible instantly'],
      },
    ],
  },
  requirements: {
    badge: 'REQUIREMENTS',
    title: 'What you need to use AION',
    items: [
      {
        title: 'A computer or tablet with internet',
        description: 'AION runs in the browser. There is nothing to install.',
      },
      {
        title: 'No servers of your own',
        description: 'The system runs in the cloud, so there is no equipment to maintain.',
      },
      {
        title: 'Your current team',
        description: 'Front desk and administration can use it without technical knowledge.',
      },
      {
        title: 'Access from anywhere',
        description: 'As the owner, you check your reports from any device with a browser.',
      },
    ],
  },
  faq: {
    title: 'Common questions about onboarding',
    items: [
      {
        q: 'How long does it take to get started?',
        a: 'It depends on the size of your business and how your information is organized today. In the demo we review your case and give you an estimate.',
      },
      {
        q: 'Do I have to stop operating during onboarding?',
        a: 'No. Setup and member loading happen alongside your normal operations.',
      },
      {
        q: 'What if my team has questions later?',
        a: 'You get direct support on WhatsApp for day-to-day questions.',
      },
    ],
  },
}

export const howItWorksContent: Record<Lang, HowItWorksContent> = { es, en }
