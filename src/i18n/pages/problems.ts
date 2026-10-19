import type { Lang } from '../content'
import type { PageKey } from '../../site/routes'

type Problem = {
  id: string
  title: string
  situation: string
  cost: string
  solution: string
  link: PageKey
}

const es = {
  hero: {
    badge: 'PROBLEMAS QUE RESOLVEMOS',
    title: 'Lo que frena a tu gimnasio no es la falta de clientes, es el desorden',
    subtitle:
      'Cuando la operación depende de cuadernos, hojas de cálculo y mensajes, se pierden pagos, renovaciones y tiempo. Estos son los problemas más comunes y cómo AION los resuelve.',
    cta: 'Agendar una demostración gratuita',
    secondary: 'Ver los beneficios',
    imageAlts: ['Cuaderno con registros a mano', 'Hoja de cálculo desordenada', 'Mensajes en el teléfono'],
  },
  labels: {
    situation: 'Lo que pasa',
    cost: 'Lo que te cuesta',
    solution: 'Cómo lo resuelve AION',
    learnMore: 'Ver cómo funciona',
  },
  listHeading: {
    badge: 'SEIS PROBLEMAS FRECUENTES',
    title: 'Situaciones que se repiten en casi todos los gimnasios',
    subtitle:
      'Ninguna parece grave por sí sola. Juntas, hacen que el negocio dependa de la memoria y de la presencia del dueño.',
  },
  problems: [
    {
      id: 'informacion-dispersa',
      title: 'Información dispersa',
      situation:
        'Los datos de cada miembro están repartidos entre un cuaderno, un Excel y el WhatsApp de la recepción. Encontrar el historial de alguien toma minutos.',
      cost: 'Errores al cobrar, datos duplicados y decisiones tomadas sin información completa.',
      solution:
        'AION reúne la ficha de cada miembro en un solo lugar: datos, membresía, pagos y asistencias. La encuentras por nombre o cédula en segundos.',
      link: 'benefits',
    },
    {
      id: 'renovaciones-perdidas',
      title: 'Renovaciones que se pierden',
      situation:
        'Nadie revisa a tiempo quién está por vencer. El miembro deja de venir y nadie lo nota hasta semanas después.',
      cost: 'Ingresos recurrentes que se escapan y miembros que se van sin que nadie los llame.',
      solution:
        'El monitoreo de membresías muestra quién está al día, en período de gracia o vencido, para que actúes antes de perderlo.',
      link: 'benefits',
    },
    {
      id: 'pagos-sin-registrar',
      title: 'Pagos sin registrar',
      situation:
        'Cobros en efectivo, transferencias y pagos móviles que no quedan asentados o se anotan después, de memoria.',
      cost: 'Dinero que no cuadra, discusiones con miembros y ninguna forma de comprobar qué pasó.',
      solution:
        'Cada cobro se registra en el momento, asociado al miembro y al método de pago. La membresía se actualiza sola.',
      link: 'howItWorks',
    },
    {
      id: 'cierre-de-caja',
      title: 'Cierre de caja a ciegas',
      situation:
        'Al final del día se suma a mano lo que entró. Si no cuadra, nadie sabe dónde está la diferencia.',
      cost: 'Tiempo perdido, faltantes sin explicación y poca confianza en los números.',
      solution:
        'El cierre de caja reúne los cobros del día por método de pago. Ves el total esperado y lo comparas con lo que hay.',
      link: 'howItWorks',
    },
    {
      id: 'acceso-manual',
      title: 'Control de acceso manual',
      situation:
        'Quien está en la puerta decide si alguien entra, muchas veces sin saber si pagó. Las conversaciones incómodas son diarias.',
      cost: 'Personas entrenando con la membresía vencida y una recepción que depende de la memoria.',
      solution:
        'En recepción se ingresa el ID del cliente y AION muestra al instante si puede entrar. El check-in queda registrado.',
      link: 'howItWorks',
    },
    {
      id: 'sin-visibilidad',
      title: 'Sin visibilidad a distancia',
      situation:
        'Para saber cómo va el día tienes que estar en el gimnasio o llamar a la recepción.',
      cost: 'El negocio depende de tu presencia y es difícil crecer o abrir otra sede.',
      solution:
        'Los reportes te muestran ingresos, asistencias y membresías desde donde estés, de una sede o de todas.',
      link: 'benefits',
    },
  ] satisfies Problem[],
  checklist: {
    badge: 'AUTODIAGNÓSTICO',
    title: '¿Te identificas con alguna de estas situaciones?',
    subtitle: 'Marca las que vives hoy en tu negocio.',
    items: [
      'Tengo datos de miembros en cuadernos, Excel o mensajes',
      'No sé con certeza quién vence esta semana',
      'Algunos cobros se anotan después o no se anotan',
      'El cierre de caja casi nunca cuadra a la primera',
      'La recepción decide el acceso de memoria',
      'Necesito llamar para saber cómo va el día',
    ],
    results: {
      none: 'Marca las situaciones que te resultan familiares.',
      few: 'Hay espacio para ordenar tu operación. AION puede ayudarte con eso.',
      many: 'AION está pensado justo para esto. Agenda una demo y te mostramos cómo resolverlo.',
    },
    counter: (n: number, total: number) => `${n} de ${total} situaciones`,
    cta: 'Agendar una demostración gratuita',
  },
}

export type ProblemsContent = typeof es

const en: ProblemsContent = {
  hero: {
    badge: 'PROBLEMS WE SOLVE',
    title: 'What holds your gym back is not a lack of clients, it is disorder',
    subtitle:
      'When operations depend on notebooks, spreadsheets and messages, payments, renewals and time get lost. These are the most common problems and how AION solves them.',
    cta: 'Book a free demo',
    secondary: 'See the benefits',
    imageAlts: ['Notebook with handwritten records', 'Messy spreadsheet', 'Messages on a phone'],
  },
  labels: {
    situation: 'What happens',
    cost: 'What it costs you',
    solution: 'How AION solves it',
    learnMore: 'See how it works',
  },
  listHeading: {
    badge: 'SIX COMMON PROBLEMS',
    title: 'Situations that repeat in almost every gym',
    subtitle:
      'None of them seems serious on its own. Together, they make the business depend on memory and on the owner being there.',
  },
  problems: [
    {
      id: 'informacion-dispersa',
      title: 'Scattered information',
      situation:
        'Member data is split between a notebook, a spreadsheet and the front desk WhatsApp. Finding someone’s history takes minutes.',
      cost: 'Billing mistakes, duplicate records and decisions made without complete information.',
      solution:
        'AION keeps each member’s profile in one place: details, membership, payments and attendance. Find it by name or ID in seconds.',
      link: 'benefits',
    },
    {
      id: 'renovaciones-perdidas',
      title: 'Missed renewals',
      situation:
        'Nobody checks in time who is about to expire. The member stops coming and nobody notices until weeks later.',
      cost: 'Recurring revenue slipping away and members leaving without anyone calling them.',
      solution:
        'Membership monitoring shows who is up to date, in a grace period or expired, so you can act before losing them.',
      link: 'benefits',
    },
    {
      id: 'pagos-sin-registrar',
      title: 'Unrecorded payments',
      situation:
        'Cash, bank transfers and mobile payments that are not recorded, or are written down later from memory.',
      cost: 'Money that does not add up, disputes with members and no way to check what happened.',
      solution:
        'Every payment is recorded on the spot, linked to the member and the payment method. The membership updates automatically.',
      link: 'howItWorks',
    },
    {
      id: 'cierre-de-caja',
      title: 'Closing the till blind',
      situation:
        'At the end of the day someone adds up the takings by hand. If it does not match, nobody knows where the gap is.',
      cost: 'Wasted time, unexplained shortfalls and little trust in the numbers.',
      solution:
        'Cash closing groups the day’s payments by method. You see the expected total and compare it with what is in the till.',
      link: 'howItWorks',
    },
    {
      id: 'acceso-manual',
      title: 'Manual access control',
      situation:
        'Whoever is at the door decides who comes in, often without knowing whether they paid. Awkward conversations happen daily.',
      cost: 'People training with an expired membership and a front desk that depends on memory.',
      solution:
        'The front desk enters the client ID and AION instantly shows whether they can come in. The check-in is recorded.',
      link: 'howItWorks',
    },
    {
      id: 'sin-visibilidad',
      title: 'No remote visibility',
      situation:
        'To know how the day is going you have to be at the gym or call the front desk.',
      cost: 'The business depends on you being there, which makes it hard to grow or open another location.',
      solution:
        'Reports show revenue, attendance and memberships wherever you are, for one location or all of them.',
      link: 'benefits',
    },
  ],
  checklist: {
    badge: 'SELF-ASSESSMENT',
    title: 'Do any of these situations sound familiar?',
    subtitle: 'Tick the ones you deal with today.',
    items: [
      'Member data lives in notebooks, spreadsheets or messages',
      'I am not sure who expires this week',
      'Some payments are written down later or not at all',
      'The till rarely balances on the first try',
      'The front desk decides access from memory',
      'I have to call to know how the day is going',
    ],
    results: {
      none: 'Tick the situations that sound familiar.',
      few: 'There is room to organize your operation. AION can help with that.',
      many: 'AION is built for exactly this. Book a demo and we will show you how to solve it.',
    },
    counter: (n: number, total: number) => `${n} of ${total} situations`,
    cta: 'Book a free demo',
  },
}

export const problemsContent: Record<Lang, ProblemsContent> = { es, en }
