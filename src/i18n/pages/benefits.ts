import type { Lang } from '../content'

/** Product modules that exist today. Used by Benefits, How it works and Solutions. */
export type ModuleKey = 'billing' | 'access' | 'memberships' | 'reports' | 'branches'

type Module = { key: ModuleKey; badge: string; title: string; description: string; bullets: string[]; note?: string }

const es = {
  hero: {
    badge: 'BENEFICIOS',
    title: 'Más control y menos trabajo manual en tu negocio deportivo',
    subtitle:
      'AION reúne la operación de tu gimnasio en una sola herramienta: miembros, cobros, accesos, membresías, reportes y sedes. Estos son los beneficios que notarás en tu día a día.',
    cta: 'Agendar una demostración gratuita',
    secondary: 'Ver cómo funciona',
  },
  pillars: [
    {
      title: 'Todo centralizado',
      description:
        'Clientes, membresías, pagos, accesos y caja en un solo lugar. Buscas por nombre o cédula y ves el estado al instante.',
    },
    {
      title: 'Control a distancia',
      description:
        'Consulta cómo va tu negocio desde donde estés. Revisa ingresos, asistencia y estado de los miembros sin llamar a la recepción.',
    },
    {
      title: 'Operación más ordenada',
      description:
        'Cobros asentados al momento, cierre de caja con números claros y renovaciones que no dependen de la memoria de nadie.',
    },
  ],
  modulesHeading: {
    badge: 'MÓDULOS DISPONIBLES',
    title: 'Cinco módulos que trabajan juntos',
    subtitle: 'Cada módulo resuelve una parte de la operación y comparte la información con los demás.',
  },
  modules: [
    {
      key: 'billing',
      badge: 'REGISTRO Y COBRO',
      title: 'Da de alta a un miembro y cóbrale en el mismo lugar',
      description:
        'La ficha del miembro y sus pagos viven juntos. Cada cobro queda asentado en el momento y actualiza su membresía.',
      bullets: [
        'Ficha completa con datos de contacto y cédula',
        'Cobros asociados al miembro y al método de pago',
        'Cierre de caja diario con totales por método',
      ],
    },
    {
      key: 'access',
      badge: 'CONTROL DE ACCESO',
      title: 'Sabe al instante quién puede entrar',
      description:
        'La recepción ingresa el ID del cliente y AION verifica el estado de su membresía. Sin dudas ni conversaciones incómodas en la puerta.',
      bullets: [
        'Validación inmediata según el estado de la membresía',
        'Alerta visual clara: acceso permitido o denegado',
        'Registro automático de cada check-in',
      ],
      note: 'Próximamente: acceso por reconocimiento facial.',
    },
    {
      key: 'memberships',
      badge: 'MONITOREO DE MEMBRESÍAS',
      title: 'Renovaciones bajo control, sin depender de la memoria',
      description:
        'Ve de un vistazo quién está al día, quién está en período de gracia y quién venció, para actuar a tiempo.',
      bullets: [
        'Estados claros: al día, en gracia y vencido',
        'Membresías por vencer siempre visibles',
        'Renovaciones registradas con su cobro',
      ],
    },
    {
      key: 'reports',
      badge: 'REPORTES',
      title: 'Decide con números, no con suposiciones',
      description:
        'Consulta ingresos, asistencias y membresías sin armar hojas de cálculo, desde la recepción o desde tu casa.',
      bullets: [
        'Ingresos por período y por método de pago',
        'Asistencias y check-ins registrados',
        'Estado general de las membresías',
      ],
    },
    {
      key: 'branches',
      badge: 'VARIAS SEDES',
      title: 'Todas tus sedes en una sola cuenta',
      description:
        'Administra cada sede por separado o mira el negocio completo. El mismo flujo de trabajo en todas tus ubicaciones.',
      bullets: [
        'Vista consolidada o por sede',
        'Cobros, accesos y miembros de cada ubicación',
        'Compara cómo va cada sede',
      ],
    },
  ] satisfies Module[],
  roles: {
    badge: 'PARA TODO TU EQUIPO',
    title: 'Beneficios para cada persona de tu negocio',
    items: [
      {
        role: 'Dueño',
        points: [
          'Ves ingresos, asistencias y membresías sin estar en el gimnasio.',
          'Tomas decisiones con números claros.',
          'Creces a nuevas sedes con la misma herramienta.',
        ],
      },
      {
        role: 'Administración',
        points: [
          'Cobros y cierres de caja ordenados.',
          'Renovaciones bajo control.',
          'Reportes listos sin armar hojas de cálculo.',
        ],
      },
      {
        role: 'Recepción',
        points: [
          'Encuentra a cualquier miembro en segundos.',
          'Sabe al instante quién puede entrar.',
          'Menos conversaciones incómodas en la puerta.',
        ],
      },
    ],
  },
  comparison: {
    badge: 'ANTES Y DESPUÉS',
    title: 'Lo que cambia con AION',
    columns: ['Tema', 'Sin AION', 'Con AION'],
    rows: [
      ['Datos de miembros', 'Cuadernos, Excel y mensajes', 'Una ficha por miembro, en un solo lugar'],
      ['Cobros', 'Se anotan después, a veces no', 'Se registran en el momento'],
      ['Renovaciones', 'Dependen de la memoria', 'Estados visibles: al día, gracia, vencido'],
      ['Acceso', 'Decide quien está en la puerta', 'Validación por ID del cliente'],
      ['Cierre de caja', 'Suma manual y diferencias', 'Totales por método de pago'],
      ['Visibilidad', 'Tienes que estar presente', 'Reportes desde cualquier lugar'],
      ['Sedes', 'Cada sede con su propio desorden', 'Todas las sedes en una cuenta'],
    ],
  },
  comingSoon: {
    badge: 'LO QUE VIENE',
    title: 'Seguimos construyendo AION',
    subtitle: 'Estas funciones están en desarrollo y llegarán en próximas versiones.',
    items: [
      {
        title: 'Módulo para entrenadores',
        description: 'Herramientas para que tu equipo de entrenadores organice su trabajo y haga seguimiento de sus alumnos.',
      },
      {
        title: 'Acceso por reconocimiento facial',
        description: 'Ingreso sin escribir el ID: el sistema reconocerá al miembro en la entrada.',
      },
    ],
  },
}

export type BenefitsContent = typeof es

const en: BenefitsContent = {
  hero: {
    badge: 'BENEFITS',
    title: 'More control and less manual work in your sports business',
    subtitle:
      'AION brings your gym operations into one tool: members, billing, access, memberships, reports and locations. These are the benefits you will notice day to day.',
    cta: 'Book a free demo',
    secondary: 'See how it works',
  },
  pillars: [
    {
      title: 'Everything in one place',
      description:
        'Members, memberships, payments, access and cash in one place. Search by name or ID and see their status instantly.',
    },
    {
      title: 'Remote control',
      description:
        'Check how your business is doing from anywhere. Review revenue, attendance and member status without calling the front desk.',
    },
    {
      title: 'A more organized operation',
      description:
        'Payments recorded on the spot, cash closing with clear numbers and renewals that do not depend on anyone’s memory.',
    },
  ],
  modulesHeading: {
    badge: 'AVAILABLE MODULES',
    title: 'Five modules that work together',
    subtitle: 'Each module handles one part of the operation and shares information with the others.',
  },
  modules: [
    {
      key: 'billing',
      badge: 'REGISTRATION AND BILLING',
      title: 'Sign up a member and charge them in the same place',
      description:
        'The member profile and their payments live together. Every payment is recorded on the spot and updates the membership.',
      bullets: [
        'Full profile with contact details and ID number',
        'Payments linked to the member and the payment method',
        'Daily cash closing with totals by method',
      ],
    },
    {
      key: 'access',
      badge: 'ACCESS CONTROL',
      title: 'Know instantly who can come in',
      description:
        'The front desk enters the client ID and AION checks their membership status. No doubts or awkward conversations at the door.',
      bullets: [
        'Instant validation based on membership status',
        'Clear visual alert: access granted or denied',
        'Every check-in recorded automatically',
      ],
      note: 'Coming soon: facial recognition access.',
    },
    {
      key: 'memberships',
      badge: 'MEMBERSHIP MONITORING',
      title: 'Renewals under control, without relying on memory',
      description:
        'See at a glance who is up to date, who is in a grace period and who has expired, so you can act in time.',
      bullets: [
        'Clear statuses: up to date, grace period and expired',
        'Upcoming expirations always visible',
        'Renewals recorded together with their payment',
      ],
    },
    {
      key: 'reports',
      badge: 'REPORTS',
      title: 'Decide with numbers, not assumptions',
      description:
        'Check revenue, attendance and memberships without building spreadsheets, from the front desk or from home.',
      bullets: [
        'Revenue by period and payment method',
        'Recorded attendance and check-ins',
        'Overall membership status',
      ],
    },
    {
      key: 'branches',
      badge: 'MULTIPLE LOCATIONS',
      title: 'All your locations in one account',
      description:
        'Manage each location separately or see the whole business. The same workflow across all your sites.',
      bullets: [
        'Consolidated or per-location view',
        'Billing, access and members for each location',
        'Compare how each location is doing',
      ],
    },
  ],
  roles: {
    badge: 'FOR YOUR WHOLE TEAM',
    title: 'Benefits for everyone in your business',
    items: [
      {
        role: 'Owner',
        points: [
          'See revenue, attendance and memberships without being at the gym.',
          'Make decisions with clear numbers.',
          'Grow to new locations with the same tool.',
        ],
      },
      {
        role: 'Administration',
        points: [
          'Organized billing and cash closing.',
          'Renewals under control.',
          'Reports ready without building spreadsheets.',
        ],
      },
      {
        role: 'Front desk',
        points: [
          'Find any member in seconds.',
          'Know instantly who can come in.',
          'Fewer awkward conversations at the door.',
        ],
      },
    ],
  },
  comparison: {
    badge: 'BEFORE AND AFTER',
    title: 'What changes with AION',
    columns: ['Topic', 'Without AION', 'With AION'],
    rows: [
      ['Member data', 'Notebooks, spreadsheets and messages', 'One profile per member, in one place'],
      ['Payments', 'Written down later, sometimes not at all', 'Recorded on the spot'],
      ['Renewals', 'Depend on memory', 'Visible statuses: up to date, grace, expired'],
      ['Access', 'Whoever is at the door decides', 'Validation by client ID'],
      ['Cash closing', 'Manual sums and gaps', 'Totals by payment method'],
      ['Visibility', 'You have to be there', 'Reports from anywhere'],
      ['Locations', 'Each location with its own mess', 'All locations in one account'],
    ],
  },
  comingSoon: {
    badge: 'WHAT IS NEXT',
    title: 'We keep building AION',
    subtitle: 'These features are in development and will arrive in upcoming versions.',
    items: [
      {
        title: 'Trainer module',
        description: 'Tools for your coaching team to organize their work and follow up with their clients.',
      },
      {
        title: 'Facial recognition access',
        description: 'Entry without typing an ID: the system will recognize the member at the door.',
      },
    ],
  },
}

export const benefitsContent: Record<Lang, BenefitsContent> = { es, en }
