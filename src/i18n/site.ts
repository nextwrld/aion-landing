// Shared, site-wide copy for the multi-page site (NW-AION-2.0).
// Page-specific copy lives in ./pages/*. The home page keeps using ./content.ts.
import type { Lang } from './content'
import type { PageKey } from '../site/routes'

type PageInfo = { label: string; description: string; title: string; metaDescription: string }

const es = {
  pages: {
    home: {
      label: 'Inicio',
      description: 'Conoce AION en un vistazo.',
      title: 'AION Wellness - Todo tu negocio fitness bajo control',
      metaDescription:
        'AION es el sistema que ayuda a ordenar, controlar y hacer crecer tu negocio de fitness y bienestar. Centraliza clientes, membresías, pagos, accesos y caja en un solo lugar.',
    },
    solutions: {
      label: 'Soluciones',
      description: 'Cómo se adapta AION a gimnasios, boxes, estudios, clubes e instituciones.',
      title: 'Soluciones para gimnasios, boxes, estudios y clubes | AION Wellness',
      metaDescription:
        'AION se adapta a gimnasios, boxes de entrenamiento funcional, estudios, centros deportivos, instituciones deportivas y cadenas con varias sedes.',
    },
    problems: {
      label: 'Problemas',
      description: 'Los problemas más comunes al gestionar un gimnasio y cómo resolverlos.',
      title: 'Problemas comunes en la gestión de gimnasios | AION Wellness',
      metaDescription:
        'Información dispersa, pagos sin registrar, renovaciones perdidas y control de acceso manual. Descubre cómo AION resuelve los problemas diarios de tu gimnasio.',
    },
    benefits: {
      label: 'Beneficios',
      description: 'Módulos, beneficios por rol y lo que cambia con AION.',
      title: 'Beneficios de AION para tu gimnasio | AION Wellness',
      metaDescription:
        'Registro y cobro, control de acceso, monitoreo de membresías, reportes y varias sedes en una sola herramienta. Conoce los beneficios de AION.',
    },
    howItWorks: {
      label: 'Cómo funciona',
      description: 'La puesta en marcha y el flujo diario en recepción, paso a paso.',
      title: 'Cómo funciona AION, paso a paso | AION Wellness',
      metaDescription:
        'De la demo a la operación diaria: así se implementa AION y así se usa cada día en la recepción de tu gimnasio o centro deportivo.',
    },
    faq: {
      label: 'Preguntas',
      description: 'Respuestas sobre el producto, la implementación, los pagos y el soporte.',
      title: 'Preguntas frecuentes sobre AION | AION Wellness',
      metaDescription:
        'Resolvemos tus dudas sobre AION: funciones, implementación, control de acceso, cobros, reportes, varias sedes y soporte.',
    },
    contact: {
      label: 'Contacto',
      description: 'Agenda una demo o escríbenos por WhatsApp.',
      title: 'Contacto y demostración gratuita | AION Wellness',
      metaDescription:
        'Agenda una demostración gratuita de AION o escríbenos por WhatsApp desde Venezuela o Argentina. Sin compromiso.',
    },
  } satisfies Record<PageKey, PageInfo>,
  nav: {
    ariaLabel: 'Principal',
    mobileAriaLabel: 'Navegación móvil',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    solutionsMenu: 'Soluciones por tipo de negocio',
    allSolutions: 'Ver todas las soluciones',
    demo: 'Solicitar demo',
    homeAria: 'AION Wellness, ir al inicio',
  },
  breadcrumbs: { ariaLabel: 'Ruta de navegación' },
  status: { available: 'Disponible', comingSoon: 'Próximamente' },
  ctaBand: {
    title: '¿Listo para ordenar tu negocio deportivo?',
    subtitle:
      'Agenda una demostración gratuita y conoce cómo funcionaría AION en tu operación. Sin compromiso.',
    primary: 'Agendar demostración',
    secondary: 'Escribir por WhatsApp',
  },
  crossLinks: { title: 'Sigue explorando', more: 'Ver más' },
  testimonials: {
    badge: 'TESTIMONIOS',
    title: 'Así se vive AION en el día a día',
    disclaimer: 'Testimonios de ejemplo con fines ilustrativos.',
    items: [
      {
        quote:
          'Antes cerrábamos caja con una calculadora y siempre faltaba algo. Ahora vemos el total por método de pago y terminamos en minutos.',
        name: 'María Fernanda R.',
        role: 'Dueña de gimnasio',
        place: 'Valencia, Venezuela',
      },
      {
        quote:
          'La recepción ya no discute en la puerta. Ingresan el ID del cliente y el sistema dice si puede pasar.',
        name: 'Carlos M.',
        role: 'Administrador de box funcional',
        place: 'Caracas, Venezuela',
      },
      {
        quote:
          'Tenemos dos sedes y por fin puedo revisar las dos desde el teléfono, sin llamar a nadie.',
        name: 'Javier P.',
        role: 'Dueño de cadena de gimnasios',
        place: 'Buenos Aires, Argentina',
      },
      {
        quote:
          'Las renovaciones dejaron de depender de mi memoria. Veo quién vence esta semana y lo contacto a tiempo.',
        name: 'Luciana G.',
        role: 'Directora de estudio de pilates',
        place: 'Córdoba, Argentina',
      },
    ],
  },
  contactChannels: {
    whatsappLabel: 'WhatsApp',
    countries: { ve: 'Venezuela', ar: 'Argentina' },
    instagramLabel: 'Instagram',
    emailLabel: 'Correo',
    whatsappMessage: 'Hola, quiero saber más sobre AION.',
  },
  footer: {
    description:
      'AION es el sistema que ayuda a ordenar, controlar y hacer crecer tu negocio de fitness y bienestar.',
    productTitle: 'Producto',
    solutionsTitle: 'Soluciones',
    contactTitle: 'Contacto',
    rights: '2026 AION Wellness. Todos los derechos reservados.',
    version: 'Versión 2.0',
  },
  notFound: {
    title: 'Página no encontrada',
    text: 'La página que buscas no existe o cambió de dirección.',
    cta: 'Volver al inicio',
    metaTitle: 'Página no encontrada | AION Wellness',
  },
  backToTop: 'Volver arriba',
  mock: {
    searchPlaceholder: 'Buscar por nombre o cédula',
    member: 'Miembro',
    plan: 'Plan',
    monthly: 'Mensual',
    upToDate: 'Al día',
    grace: 'En gracia',
    expired: 'Vencido',
    expiresIn: 'Vence en',
    days: 'días',
    paymentTitle: 'Registrar cobro',
    amount: 'Monto',
    method: 'Método',
    cash: 'Efectivo',
    transfer: 'Transferencia',
    mobilePay: 'Pago móvil',
    paymentDone: 'Cobro registrado',
    accessTitle: 'Control de acceso',
    clientId: 'ID del cliente',
    accessAllowed: 'Acceso permitido',
    accessDenied: 'Membresía vencida',
    checkinSaved: 'Check-in registrado',
    membershipsTitle: 'Membresías',
    reportsTitle: 'Ingresos del mes',
    checkins: 'Check-ins',
    activeMembers: 'Miembros activos',
    branchesTitle: 'Sedes',
    allBranches: 'Todas las sedes',
    branchNames: ['Sede Centro', 'Sede Norte', 'Sede Este'],
    cashTitle: 'Cierre de caja',
    total: 'Total del día',
    difference: 'Diferencia',
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  },
}

export type SiteContent = typeof es

const en: SiteContent = {
  pages: {
    home: {
      label: 'Home',
      description: 'AION at a glance.',
      title: 'AION Wellness - Your whole fitness business under control',
      metaDescription:
        'AION is the system that helps you organize, control and grow your fitness and wellness business. Members, memberships, payments, access and cash in one place.',
    },
    solutions: {
      label: 'Solutions',
      description: 'How AION adapts to gyms, boxes, studios, clubs and institutions.',
      title: 'Solutions for gyms, boxes, studios and clubs | AION Wellness',
      metaDescription:
        'AION adapts to gyms, functional training boxes, studios, sports centers, sports institutions and multi-location chains.',
    },
    problems: {
      label: 'Problems',
      description: 'The most common problems when running a gym and how to solve them.',
      title: 'Common gym management problems | AION Wellness',
      metaDescription:
        'Scattered information, unrecorded payments, missed renewals and manual access control. See how AION solves the daily problems of your gym.',
    },
    benefits: {
      label: 'Benefits',
      description: 'Modules, benefits by role and what changes with AION.',
      title: 'AION benefits for your gym | AION Wellness',
      metaDescription:
        'Registration and billing, access control, membership monitoring, reports and multiple locations in one tool. Discover the benefits of AION.',
    },
    howItWorks: {
      label: 'How it works',
      description: 'Onboarding and the daily front desk flow, step by step.',
      title: 'How AION works, step by step | AION Wellness',
      metaDescription:
        'From the demo to daily operations: this is how AION is set up and how it is used every day at the front desk of your gym or sports center.',
    },
    faq: {
      label: 'Questions',
      description: 'Answers about the product, onboarding, payments and support.',
      title: 'AION frequently asked questions | AION Wellness',
      metaDescription:
        'Answers about AION: features, onboarding, access control, billing, reports, multiple locations and support.',
    },
    contact: {
      label: 'Contact',
      description: 'Book a demo or message us on WhatsApp.',
      title: 'Contact and free demo | AION Wellness',
      metaDescription:
        'Book a free AION demo or message us on WhatsApp from Venezuela or Argentina. No commitment.',
    },
  },
  nav: {
    ariaLabel: 'Main',
    mobileAriaLabel: 'Mobile navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    solutionsMenu: 'Solutions by business type',
    allSolutions: 'See all solutions',
    demo: 'Request demo',
    homeAria: 'AION Wellness, go to home',
  },
  breadcrumbs: { ariaLabel: 'Breadcrumb' },
  status: { available: 'Available', comingSoon: 'Coming soon' },
  ctaBand: {
    title: 'Ready to organize your sports business?',
    subtitle:
      'Book a free demo and see how AION would work in your operation. No commitment.',
    primary: 'Book a demo',
    secondary: 'Message us on WhatsApp',
  },
  crossLinks: { title: 'Keep exploring', more: 'Learn more' },
  testimonials: {
    badge: 'TESTIMONIALS',
    title: 'What everyday life with AION looks like',
    disclaimer: 'Sample testimonials for illustrative purposes.',
    items: [
      {
        quote:
          'We used to close the till with a calculator and something was always missing. Now we see the total by payment method and finish in minutes.',
        name: 'María Fernanda R.',
        role: 'Gym owner',
        place: 'Valencia, Venezuela',
      },
      {
        quote:
          'The front desk no longer argues at the door. They enter the client ID and the system says whether they can come in.',
        name: 'Carlos M.',
        role: 'Functional training box manager',
        place: 'Caracas, Venezuela',
      },
      {
        quote:
          'We have two locations and I can finally check both from my phone without calling anyone.',
        name: 'Javier P.',
        role: 'Gym chain owner',
        place: 'Buenos Aires, Argentina',
      },
      {
        quote:
          'Renewals no longer depend on my memory. I see who expires this week and reach out in time.',
        name: 'Luciana G.',
        role: 'Pilates studio director',
        place: 'Córdoba, Argentina',
      },
    ],
  },
  contactChannels: {
    whatsappLabel: 'WhatsApp',
    countries: { ve: 'Venezuela', ar: 'Argentina' },
    instagramLabel: 'Instagram',
    emailLabel: 'Email',
    whatsappMessage: 'Hi, I would like to know more about AION.',
  },
  footer: {
    description:
      'AION is the system that helps you organize, control and grow your fitness and wellness business.',
    productTitle: 'Product',
    solutionsTitle: 'Solutions',
    contactTitle: 'Contact',
    rights: '2026 AION Wellness. All rights reserved.',
    version: 'Version 2.0',
  },
  notFound: {
    title: 'Page not found',
    text: 'The page you are looking for does not exist or has moved.',
    cta: 'Back to home',
    metaTitle: 'Page not found | AION Wellness',
  },
  backToTop: 'Back to top',
  mock: {
    searchPlaceholder: 'Search by name or ID',
    member: 'Member',
    plan: 'Plan',
    monthly: 'Monthly',
    upToDate: 'Up to date',
    grace: 'Grace period',
    expired: 'Expired',
    expiresIn: 'Expires in',
    days: 'days',
    paymentTitle: 'Record payment',
    amount: 'Amount',
    method: 'Method',
    cash: 'Cash',
    transfer: 'Bank transfer',
    mobilePay: 'Mobile payment',
    paymentDone: 'Payment recorded',
    accessTitle: 'Access control',
    clientId: 'Client ID',
    accessAllowed: 'Access granted',
    accessDenied: 'Membership expired',
    checkinSaved: 'Check-in recorded',
    membershipsTitle: 'Memberships',
    reportsTitle: 'Monthly revenue',
    checkins: 'Check-ins',
    activeMembers: 'Active members',
    branchesTitle: 'Locations',
    allBranches: 'All locations',
    branchNames: ['Downtown', 'North', 'East'],
    cashTitle: 'Cash closing',
    total: 'Daily total',
    difference: 'Difference',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
}

export const siteContent: Record<Lang, SiteContent> = { es, en }
