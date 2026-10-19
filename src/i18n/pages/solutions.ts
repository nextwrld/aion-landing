import type { Lang } from '../content'
import type { SegmentSlug } from '../../site/routes'
import type { ModuleKey } from './benefits'

type Item = { title: string; description: string }
type QA = { q: string; a: string }

export type Segment = {
  slug: SegmentSlug
  name: string
  tag: string
  short: string
  examples: string
  metaTitle: string
  metaDescription: string
  hero: { badge: string; title: string; subtitle: string }
  pains: Item[]
  uses: Item[]
  modules: ModuleKey[]
  note?: string
  faq: QA[]
}

const es = {
  index: {
    hero: {
      badge: 'SOLUCIONES',
      title: 'Un sistema que se adapta a tu tipo de negocio deportivo',
      subtitle:
        'Gimnasios, boxes, estudios, clubes e instituciones tienen rutinas distintas. AION se ajusta a la forma en que trabajas.',
      cta: 'Agendar una demostración gratuita',
    },
    gridHeading: {
      badge: 'ELIGE TU TIPO DE NEGOCIO',
      title: '¿Qué tipo de negocio tienes?',
      subtitle: 'Mira cómo usan AION negocios como el tuyo.',
    },
    viewSolution: 'Ver solución',
    shared: {
      badge: 'EN TODOS LOS CASOS',
      title: 'La misma base para cualquier negocio deportivo',
      subtitle: 'Sin importar tu tamaño o disciplina, estos módulos están incluidos.',
    },
    notListed: {
      title: '¿No ves tu tipo de negocio?',
      text: 'Si gestionas miembros, membresías y accesos, AION probablemente te sirva. Cuéntanos tu caso.',
      cta: 'Hablar con el equipo',
    },
  },
  segmentLabels: {
    pains: 'Los desafíos de tu día a día',
    uses: 'Cómo lo usan negocios como el tuyo',
    modules: 'Módulos que más vas a usar',
    faq: 'Preguntas frecuentes',
    otherSegments: 'Otras soluciones',
    cta: 'Agendar una demostración gratuita',
    secondary: 'Ver todas las funciones',
  },
  segments: [
    {
      slug: 'gimnasios',
      name: 'Gimnasios',
      tag: 'Gimnasios',
      short: 'Control de miembros, cobros y acceso para gimnasios de cualquier tamaño.',
      examples: 'Gimnasios de barrio, gimnasios medianos y grandes',
      metaTitle: 'Sistema para gimnasios: miembros, cobros y acceso | AION Wellness',
      metaDescription:
        'AION centraliza miembros, membresías, cobros, control de acceso y reportes de tu gimnasio. Agenda una demostración gratuita.',
      hero: {
        badge: 'SOLUCIÓN PARA GIMNASIOS',
        title: 'El sistema para gimnasios que quieren ordenar su operación',
        subtitle:
          'De la recepción a los reportes del mes, AION centraliza lo que hoy tienes repartido en cuadernos, hojas de cálculo y mensajes.',
      },
      pains: [
        { title: 'Mucho movimiento en recepción', description: 'En horas pico se forma fila y es fácil dejar pasar a alguien sin verificar su membresía.' },
        { title: 'Membresías que vencen sin aviso', description: 'Con cientos de miembros, nadie alcanza a revisar quién vence cada semana.' },
        { title: 'Cobros difíciles de cuadrar', description: 'Efectivo, transferencias y pagos móviles mezclados hacen que el cierre de caja tome tiempo.' },
      ],
      uses: [
        { title: 'Recepción ágil', description: 'Ingresan el ID del cliente, ven su estado y registran el check-in sin detener la fila.' },
        { title: 'Renovaciones bajo control', description: 'Revisan quién está en gracia o vencido y lo contactan a tiempo.' },
        { title: 'Caja que cuadra', description: 'Cada cobro queda asentado con su método y el cierre se hace con totales claros.' },
        { title: 'Reportes del mes', description: 'El dueño revisa ingresos y asistencias sin pedir números a la recepción.' },
      ],
      modules: ['access', 'billing', 'memberships', 'reports'],
      faq: [
        { q: '¿AION sirve para un gimnasio pequeño?', a: 'Sí. Funciona igual para un gimnasio de barrio que para uno grande, y crece contigo si abres otra sede.' },
        { q: '¿Puedo seguir cobrando en efectivo?', a: 'Sí. Registras cada cobro con el método que uses y el cierre de caja los separa por método.' },
      ],
    },
    {
      slug: 'boxes-funcional',
      name: 'Boxes y entrenamiento funcional',
      tag: 'Boxes',
      short: 'Membresías, asistencias y cobros para boxes de CrossFit y centros de entrenamiento funcional.',
      examples: 'Boxes de CrossFit, entrenamiento funcional, HIIT',
      metaTitle: 'Sistema para boxes de CrossFit y entrenamiento funcional | AION Wellness',
      metaDescription:
        'Gestiona membresías, asistencias y cobros de tu box o centro de entrenamiento funcional con AION. Agenda una demostración gratuita.',
      hero: {
        badge: 'SOLUCIÓN PARA BOXES',
        title: 'Tu box enfocado en entrenar, no en perseguir pagos',
        subtitle:
          'Las comunidades de entrenamiento funcional son activas y cercanas. AION te ayuda a saber quién está al día y quién viene a entrenar.',
      },
      pains: [
        { title: 'Coaches que también hacen de recepción', description: 'Entre clase y clase, el coach cobra, anota y verifica pagos de memoria.' },
        { title: 'Asistencia que no se mide', description: 'Sin registro de check-ins es difícil saber quién viene seguido y quién se está alejando.' },
        { title: 'Pagos informales', description: 'Transferencias y pagos por mensaje que no siempre quedan anotados.' },
      ],
      uses: [
        { title: 'Check-in antes de la clase', description: 'Se ingresa el ID del atleta y queda registrada su asistencia en segundos.' },
        { title: 'Membresías visibles', description: 'El coach ve si el atleta está al día antes de que empiece el entrenamiento.' },
        { title: 'Cobros asentados', description: 'Cada pago queda registrado con su método, aunque llegue por transferencia.' },
        { title: 'Asistencias por período', description: 'Los reportes muestran cuántos check-ins tiene tu box en cada período.' },
      ],
      modules: ['access', 'memberships', 'billing', 'reports'],
      note: 'Próximamente: módulo para entrenadores, pensado para coaches y su seguimiento de atletas.',
      faq: [
        { q: '¿Necesito una persona fija en recepción?', a: 'No. El flujo es simple para que el mismo coach registre el acceso y los cobros entre clases.' },
        { q: '¿Tienen herramientas para coaches?', a: 'El módulo para entrenadores está en desarrollo. Hoy puedes gestionar miembros, cobros, accesos y reportes.' },
      ],
    },
    {
      slug: 'estudios',
      name: 'Estudios de yoga, pilates y baile',
      tag: 'Estudios',
      short: 'Alumnos, membresías y pagos ordenados para estudios boutique.',
      examples: 'Yoga, pilates, baile, spinning, barre',
      metaTitle: 'Sistema para estudios de yoga, pilates y baile | AION Wellness',
      metaDescription:
        'AION ordena alumnos, membresías, cobros y accesos de tu estudio de yoga, pilates o baile. Agenda una demostración gratuita.',
      hero: {
        badge: 'SOLUCIÓN PARA ESTUDIOS',
        title: 'Más tiempo para tus alumnos, menos para la administración',
        subtitle:
          'En un estudio, cada alumno cuenta. AION te ayuda a llevar membresías y pagos sin perder la cercanía con tu comunidad.',
      },
      pains: [
        { title: 'Administración entre clases', description: 'Instructores y dueños hacen la parte administrativa en los minutos libres.' },
        { title: 'Pagos por WhatsApp', description: 'Comprobantes que llegan por mensaje y hay que buscar después.' },
        { title: 'Renovaciones que dependen de recordarlas', description: 'Sin un aviso claro, los alumnos siguen viniendo con el plan vencido o dejan de venir.' },
      ],
      uses: [
        { title: 'Ficha de cada alumno', description: 'Datos, plan, pagos y asistencias de cada alumno en un solo lugar.' },
        { title: 'Cobros registrados', description: 'Los pagos que llegan por transferencia quedan asentados y asociados al alumno.' },
        { title: 'Membresías al día', description: 'Ves quién está por vencer y lo contactas antes de perderlo.' },
        { title: 'Visión del estudio', description: 'Reportes simples de ingresos y asistencia para tomar decisiones.' },
      ],
      modules: ['memberships', 'billing', 'access', 'reports'],
      faq: [
        { q: '¿Sirve para un estudio con pocos alumnos?', a: 'Sí. AION es útil desde los primeros alumnos y te evita depender de cuadernos y mensajes.' },
        { q: '¿Puedo manejar varios estudios?', a: 'Sí. Con la gestión de varias sedes ves cada estudio por separado o en conjunto.' },
      ],
    },
    {
      slug: 'centros-deportivos',
      name: 'Centros deportivos y clubes',
      tag: 'Clubes',
      short: 'Socios, cuotas y control de ingreso para clubes, academias y complejos deportivos.',
      examples: 'Clubes, academias de artes marciales, natación, complejos deportivos',
      metaTitle: 'Sistema para centros deportivos y clubes | AION Wellness',
      metaDescription:
        'Gestiona socios, cuotas, control de ingreso y reportes de tu club o centro deportivo con AION. Agenda una demostración gratuita.',
      hero: {
        badge: 'SOLUCIÓN PARA CLUBES',
        title: 'Socios, cuotas y accesos de tu club en un solo lugar',
        subtitle:
          'Clubes, academias y complejos deportivos manejan muchos socios y disciplinas. AION ordena las cuotas y el ingreso a tus instalaciones.',
      },
      pains: [
        { title: 'Muchos socios, varias disciplinas', description: 'El padrón de socios crece y se vuelve difícil de mantener en hojas de cálculo.' },
        { title: 'Cuotas mensuales atrasadas', description: 'Sin seguimiento claro, las cuotas atrasadas se acumulan.' },
        { title: 'Ingreso sin control', description: 'Es difícil saber quién entra a las instalaciones y si está al día.' },
      ],
      uses: [
        { title: 'Padrón de socios', description: 'Cada socio con su ficha, su membresía y su historial de pagos.' },
        { title: 'Cuotas al día', description: 'Ves quién está al día, en gracia o atrasado y actúas a tiempo.' },
        { title: 'Control de ingreso', description: 'El personal ingresa el ID del socio y el sistema indica si puede entrar.' },
        { title: 'Reportes para la directiva', description: 'Ingresos y asistencias claros para rendir cuentas.' },
      ],
      modules: ['memberships', 'access', 'billing', 'reports', 'branches'],
      faq: [
        { q: '¿Sirve para academias de artes marciales o natación?', a: 'Sí. Si gestionas alumnos o socios con cuotas y acceso a instalaciones, AION se adapta a tu caso.' },
        { q: '¿Puedo tener varias instalaciones?', a: 'Sí. La gestión de varias sedes te permite ver cada instalación por separado o en conjunto.' },
      ],
    },
    {
      slug: 'instituciones-deportivas',
      name: 'Instituciones deportivas',
      tag: 'Instituciones',
      short: 'Gimnasios e instalaciones deportivas de universidades, colegios, empresas y entes municipales.',
      examples: 'Áreas deportivas universitarias, gimnasios corporativos, polideportivos municipales',
      metaTitle: 'Gestión deportiva para universidades, empresas y polideportivos | AION Wellness',
      metaDescription:
        'AION ayuda a universidades, colegios, empresas y entes municipales a gestionar usuarios, membresías y acceso a sus instalaciones deportivas.',
      hero: {
        badge: 'SOLUCIÓN PARA INSTITUCIONES',
        title: 'Gestión deportiva para instituciones con gimnasio o instalaciones propias',
        subtitle:
          'Universidades, colegios, empresas y polideportivos municipales necesitan saber quién usa sus instalaciones deportivas y mantener sus membresías en orden.',
      },
      pains: [
        { title: 'Usuarios de distintos grupos', description: 'Estudiantes, empleados y miembros de la comunidad usan las mismas instalaciones.' },
        { title: 'Rendición de cuentas', description: 'La institución necesita datos de uso para justificar su programa deportivo.' },
        { title: 'Varias instalaciones', description: 'Gimnasio, canchas o piscina en distintos edificios o sedes.' },
      ],
      uses: [
        { title: 'Registro de usuarios', description: 'Cada usuario con su ficha y su membresía en el programa deportivo.' },
        { title: 'Acceso a las instalaciones', description: 'El personal ingresa el ID del usuario y el sistema valida su ingreso.' },
        { title: 'Reportes de uso', description: 'Asistencias y check-ins registrados para informar a la institución.' },
        { title: 'Varias sedes', description: 'Cada instalación por separado o el programa completo en una vista.' },
      ],
      modules: ['access', 'memberships', 'reports', 'branches'],
      faq: [
        { q: '¿Sirve para un gimnasio corporativo o universitario?', a: 'Sí. AION gestiona usuarios, membresías y accesos aunque las instalaciones sean parte de una institución más grande.' },
        { q: '¿Puedo usarlo en un polideportivo municipal?', a: 'Sí. Puedes registrar a los usuarios, controlar el ingreso y obtener reportes de uso de las instalaciones.' },
      ],
    },
    {
      slug: 'multisede',
      name: 'Cadenas y varias sedes',
      tag: 'Multisede',
      short: 'Todas tus sedes en una cuenta, con vista consolidada y por ubicación.',
      examples: 'Cadenas de gimnasios, franquicias, negocios con dos o más sedes',
      metaTitle: 'Sistema para cadenas de gimnasios con varias sedes | AION Wellness',
      metaDescription:
        'Administra todas las sedes de tu cadena de gimnasios desde una sola cuenta con AION. Vista consolidada y por sede.',
      hero: {
        badge: 'SOLUCIÓN MULTISEDE',
        title: 'Todas tus sedes, una sola vista',
        subtitle:
          'Cuando el negocio crece a varias ubicaciones, el desorden se multiplica. AION mantiene todas tus sedes bajo el mismo sistema.',
      },
      pains: [
        { title: 'Cada sede con su propio Excel', description: 'Cada encargado lleva la información a su manera y es imposible compararla.' },
        { title: 'Dependencia de los encargados', description: 'Para saber cómo va una sede tienes que llamar o ir en persona.' },
        { title: 'Crecer sin perder el control', description: 'Abrir una sede nueva significa repetir el desorden.' },
      ],
      uses: [
        { title: 'Vista consolidada', description: 'Ingresos, asistencias y membresías de todo el negocio en un vistazo.' },
        { title: 'Detalle por sede', description: 'Entras a cada sede para ver sus números y su operación.' },
        { title: 'Mismo flujo en todas', description: 'Todas las recepciones trabajan igual, con la misma herramienta.' },
        { title: 'Crecer sin cambiar de sistema', description: 'Cada sede nueva se suma a la misma cuenta.' },
      ],
      modules: ['branches', 'reports', 'billing', 'access', 'memberships'],
      faq: [
        { q: '¿Puedo ver el total de todas las sedes?', a: 'Sí. Tienes una vista consolidada y también el detalle de cada sede.' },
        { q: '¿Cada sede maneja sus propios cobros?', a: 'Sí. Cada sede registra sus cobros y accesos, y tú los ves por separado o en conjunto.' },
      ],
    },
  ] satisfies Segment[],
}

export type SolutionsContent = typeof es

const en: SolutionsContent = {
  index: {
    hero: {
      badge: 'SOLUTIONS',
      title: 'A system that adapts to your type of sports business',
      subtitle:
        'Gyms, boxes, studios, clubs and institutions have different routines. AION adapts to the way you work.',
      cta: 'Book a free demo',
    },
    gridHeading: {
      badge: 'CHOOSE YOUR BUSINESS TYPE',
      title: 'What kind of business do you run?',
      subtitle: 'See how businesses like yours use AION.',
    },
    viewSolution: 'See solution',
    shared: {
      badge: 'IN EVERY CASE',
      title: 'The same foundation for any sports business',
      subtitle: 'Whatever your size or discipline, these modules are included.',
    },
    notListed: {
      title: 'Don’t see your type of business?',
      text: 'If you manage members, memberships and access, AION will probably work for you. Tell us about your case.',
      cta: 'Talk to the team',
    },
  },
  segmentLabels: {
    pains: 'Your daily challenges',
    uses: 'How businesses like yours use it',
    modules: 'Modules you will use the most',
    faq: 'Frequently asked questions',
    otherSegments: 'Other solutions',
    cta: 'Book a free demo',
    secondary: 'See all features',
  },
  segments: [
    {
      slug: 'gimnasios',
      name: 'Gyms',
      tag: 'Gyms',
      short: 'Member, billing and access control for gyms of any size.',
      examples: 'Neighborhood, mid-size and large gyms',
      metaTitle: 'Gym management system: members, billing and access | AION Wellness',
      metaDescription:
        'AION brings your gym members, memberships, billing, access control and reports together. Book a free demo.',
      hero: {
        badge: 'SOLUTION FOR GYMS',
        title: 'The system for gyms that want to organize their operations',
        subtitle:
          'From the front desk to monthly reports, AION centralizes what you keep today across notebooks, spreadsheets and messages.',
      },
      pains: [
        { title: 'A busy front desk', description: 'At peak hours a line forms and it is easy to let someone in without checking their membership.' },
        { title: 'Memberships expiring unnoticed', description: 'With hundreds of members, nobody has time to check who expires each week.' },
        { title: 'Payments that are hard to balance', description: 'Mixed cash, transfers and mobile payments make the cash closing slow.' },
      ],
      uses: [
        { title: 'A fast front desk', description: 'They enter the client ID, see their status and record the check-in without stopping the line.' },
        { title: 'Renewals under control', description: 'They review who is in a grace period or expired and reach out in time.' },
        { title: 'A till that balances', description: 'Every payment is recorded with its method and the closing uses clear totals.' },
        { title: 'Monthly reports', description: 'The owner reviews revenue and attendance without asking the front desk for numbers.' },
      ],
      modules: ['access', 'billing', 'memberships', 'reports'],
      faq: [
        { q: 'Does AION work for a small gym?', a: 'Yes. It works the same for a neighborhood gym as for a large one, and grows with you if you open another location.' },
        { q: 'Can I keep taking cash?', a: 'Yes. You record each payment with the method you use and the cash closing separates them by method.' },
      ],
    },
    {
      slug: 'boxes-funcional',
      name: 'Boxes and functional training',
      tag: 'Boxes',
      short: 'Memberships, attendance and billing for CrossFit boxes and functional training centers.',
      examples: 'CrossFit boxes, functional training, HIIT',
      metaTitle: 'Management system for CrossFit boxes and functional training | AION Wellness',
      metaDescription:
        'Manage memberships, attendance and billing for your box or functional training center with AION. Book a free demo.',
      hero: {
        badge: 'SOLUTION FOR BOXES',
        title: 'Keep your box focused on training, not chasing payments',
        subtitle:
          'Functional training communities are active and close-knit. AION helps you know who is up to date and who comes to train.',
      },
      pains: [
        { title: 'Coaches doubling as front desk', description: 'Between classes, the coach collects payments, takes notes and checks memberships from memory.' },
        { title: 'Attendance nobody measures', description: 'Without check-in records it is hard to know who comes often and who is drifting away.' },
        { title: 'Informal payments', description: 'Transfers and payments by message that are not always written down.' },
      ],
      uses: [
        { title: 'Check-in before class', description: 'The athlete ID is entered and attendance is recorded in seconds.' },
        { title: 'Visible memberships', description: 'The coach sees whether the athlete is up to date before the workout starts.' },
        { title: 'Recorded payments', description: 'Every payment is recorded with its method, even when it arrives by transfer.' },
        { title: 'Attendance by period', description: 'Reports show how many check-ins your box has in each period.' },
      ],
      modules: ['access', 'memberships', 'billing', 'reports'],
      note: 'Coming soon: a trainer module built for coaches and athlete follow-up.',
      faq: [
        { q: 'Do I need a dedicated front desk person?', a: 'No. The flow is simple enough for the coach to record access and payments between classes.' },
        { q: 'Do you have tools for coaches?', a: 'The trainer module is in development. Today you can manage members, billing, access and reports.' },
      ],
    },
    {
      slug: 'estudios',
      name: 'Yoga, pilates and dance studios',
      tag: 'Studios',
      short: 'Organized students, memberships and payments for boutique studios.',
      examples: 'Yoga, pilates, dance, spinning, barre',
      metaTitle: 'Management system for yoga, pilates and dance studios | AION Wellness',
      metaDescription:
        'AION organizes students, memberships, billing and access for your yoga, pilates or dance studio. Book a free demo.',
      hero: {
        badge: 'SOLUTION FOR STUDIOS',
        title: 'More time for your students, less for admin',
        subtitle:
          'In a studio, every student counts. AION helps you handle memberships and payments without losing the closeness with your community.',
      },
      pains: [
        { title: 'Admin between classes', description: 'Instructors and owners do the admin work in their spare minutes.' },
        { title: 'Payments over WhatsApp', description: 'Receipts arrive by message and have to be found later.' },
        { title: 'Renewals that depend on remembering', description: 'Without a clear reminder, students keep coming on an expired plan or stop coming.' },
      ],
      uses: [
        { title: 'A profile for every student', description: 'Details, plan, payments and attendance for each student in one place.' },
        { title: 'Recorded payments', description: 'Payments received by transfer are recorded and linked to the student.' },
        { title: 'Memberships up to date', description: 'See who is about to expire and reach out before losing them.' },
        { title: 'A view of the studio', description: 'Simple revenue and attendance reports to make decisions.' },
      ],
      modules: ['memberships', 'billing', 'access', 'reports'],
      faq: [
        { q: 'Does it work for a studio with few students?', a: 'Yes. AION is useful from your first students and saves you from relying on notebooks and messages.' },
        { q: 'Can I manage several studios?', a: 'Yes. With multi-location management you see each studio separately or together.' },
      ],
    },
    {
      slug: 'centros-deportivos',
      name: 'Sports centers and clubs',
      tag: 'Clubs',
      short: 'Members, dues and entry control for clubs, academies and sports complexes.',
      examples: 'Clubs, martial arts academies, swimming, sports complexes',
      metaTitle: 'Management system for sports centers and clubs | AION Wellness',
      metaDescription:
        'Manage members, dues, entry control and reports for your club or sports center with AION. Book a free demo.',
      hero: {
        badge: 'SOLUTION FOR CLUBS',
        title: 'Your club’s members, dues and access in one place',
        subtitle:
          'Clubs, academies and sports complexes handle many members and disciplines. AION organizes dues and entry to your facilities.',
      },
      pains: [
        { title: 'Many members, several disciplines', description: 'The member roster grows and becomes hard to maintain in spreadsheets.' },
        { title: 'Late monthly dues', description: 'Without clear follow-up, late dues pile up.' },
        { title: 'Uncontrolled entry', description: 'It is hard to know who enters the facilities and whether they are up to date.' },
      ],
      uses: [
        { title: 'Member roster', description: 'Each member with their profile, membership and payment history.' },
        { title: 'Dues up to date', description: 'See who is up to date, in a grace period or late and act in time.' },
        { title: 'Entry control', description: 'Staff enter the member ID and the system shows whether they can come in.' },
        { title: 'Reports for the board', description: 'Clear revenue and attendance figures for accountability.' },
      ],
      modules: ['memberships', 'access', 'billing', 'reports', 'branches'],
      faq: [
        { q: 'Does it work for martial arts or swimming academies?', a: 'Yes. If you manage students or members with dues and facility access, AION adapts to your case.' },
        { q: 'Can I have several facilities?', a: 'Yes. Multi-location management lets you see each facility separately or together.' },
      ],
    },
    {
      slug: 'instituciones-deportivas',
      name: 'Sports institutions',
      tag: 'Institutions',
      short: 'Gyms and sports facilities at universities, schools, companies and municipalities.',
      examples: 'University sports areas, corporate gyms, municipal sports centers',
      metaTitle: 'Sports management for universities, companies and municipal centers | AION Wellness',
      metaDescription:
        'AION helps universities, schools, companies and municipalities manage users, memberships and access to their sports facilities.',
      hero: {
        badge: 'SOLUTION FOR INSTITUTIONS',
        title: 'Sports management for institutions with their own gym or facilities',
        subtitle:
          'Universities, schools, companies and municipal sports centers need to know who uses their sports facilities and keep memberships in order.',
      },
      pains: [
        { title: 'Users from different groups', description: 'Students, employees and community members share the same facilities.' },
        { title: 'Accountability', description: 'The institution needs usage data to justify its sports program.' },
        { title: 'Several facilities', description: 'A gym, courts or a pool in different buildings or locations.' },
      ],
      uses: [
        { title: 'User registration', description: 'Each user with their profile and membership in the sports program.' },
        { title: 'Facility access', description: 'Staff enter the user ID and the system validates their entry.' },
        { title: 'Usage reports', description: 'Recorded attendance and check-ins to report to the institution.' },
        { title: 'Multiple locations', description: 'Each facility separately or the whole program in one view.' },
      ],
      modules: ['access', 'memberships', 'reports', 'branches'],
      faq: [
        { q: 'Does it work for a corporate or university gym?', a: 'Yes. AION manages users, memberships and access even when the facilities belong to a larger institution.' },
        { q: 'Can a municipal sports center use it?', a: 'Yes. You can register users, control entry and get facility usage reports.' },
      ],
    },
    {
      slug: 'multisede',
      name: 'Chains and multiple locations',
      tag: 'Multi-site',
      short: 'All your locations in one account, with consolidated and per-location views.',
      examples: 'Gym chains, franchises, businesses with two or more locations',
      metaTitle: 'Management system for multi-location gym chains | AION Wellness',
      metaDescription:
        'Manage every location of your gym chain from one account with AION. Consolidated and per-location views.',
      hero: {
        badge: 'MULTI-LOCATION SOLUTION',
        title: 'All your locations, one single view',
        subtitle:
          'When the business grows to several locations, the mess multiplies. AION keeps all your locations on the same system.',
      },
      pains: [
        { title: 'Each location with its own spreadsheet', description: 'Each manager tracks information their own way and it is impossible to compare.' },
        { title: 'Depending on managers', description: 'To know how a location is doing you have to call or go in person.' },
        { title: 'Growing without losing control', description: 'Opening a new location means repeating the mess.' },
      ],
      uses: [
        { title: 'Consolidated view', description: 'Revenue, attendance and memberships for the whole business at a glance.' },
        { title: 'Per-location detail', description: 'Open each location to see its numbers and operations.' },
        { title: 'The same flow everywhere', description: 'Every front desk works the same way, with the same tool.' },
        { title: 'Grow without switching systems', description: 'Each new location joins the same account.' },
      ],
      modules: ['branches', 'reports', 'billing', 'access', 'memberships'],
      faq: [
        { q: 'Can I see the total for all locations?', a: 'Yes. You get a consolidated view and the detail for each location.' },
        { q: 'Does each location handle its own payments?', a: 'Yes. Each location records its payments and access, and you see them separately or together.' },
      ],
    },
  ],
}

export const solutionsContent: Record<Lang, SolutionsContent> = { es, en }

export function getSegment(lang: Lang, slug: SegmentSlug): Segment {
  const found = solutionsContent[lang].segments.find((s) => s.slug === slug)
  if (!found) throw new Error(`Unknown segment: ${slug}`)
  return found
}
