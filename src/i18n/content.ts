export type Lang = "es" | "en";

export const content = {
  es: {
    navbar: {
      links: [
        { label: "Problemas", href: "#problemas" },
        { label: "Beneficios", href: "#beneficios" },
        { label: "Cómo funciona", href: "#flujo" },
        { label: "Preguntas", href: "#preguntas" },
      ],
      login: "Iniciar sesión",
      demo: "Solicitar demo",
    },
    logo: { tagline: "ORDENA. CONTROLA. CRECE." },
    hero: {
      badge: "SISTEMA PARA GIMNASIOS Y CENTROS DE BIENESTAR",
      title: "Todo tu negocio fitness bajo control",
      subtitle:
        "Gestiona clientes, membresías, pagos, accesos y caja desde un solo lugar.",
      positioning:
        "AION es el sistema que ayuda a ordenar, controlar y hacer crecer tu negocio de fitness y bienestar.",
      cta: "Agendar una demostración gratuita",
      support:
        "Conoce cómo funcionaría AION en tu gimnasio. Sin compromiso.",
      mockup: {
        summary: "Resumen",
        statLabels: [
          "Miembros activos",
          "Check-ins hoy",
          "Ingresos del mes",
          "Retención",
        ],
        attendance: "Asistencias",
        last7days: "Últimos 7 días",
        memberships: "Membresías",
        donut: ["Activos", "Gracia", "Vencidos"],
        bottom: ["Membresías", "Accesos", "Pagos", "Reportes", "Bienestar"],
        search: "Buscar miembro...",
      },
    },
    painPoints: {
      title: "El día a día de tu gimnasio se vuelve caótico sin un sistema",
      subtitle:
        "Información dispersa, pagos no registrados, renovaciones olvidadas y dependencia de la recepción son problemas comunes en gimnasios que aún operan con cuadernos y mensajes.",
      items: [
        {
          image: "/assets/illust-notebook.png",
          title: "Información fragmentada y renovaciones que se pierden",
          description:
            "Datos de miembros repartidos entre cuadernos, Excel y mensajes. Vencimientos que nadie controla a tiempo y miembros que se enteran tarde de su estado de cuenta.",
        },
        {
          image: "/assets/illust-excel.png",
          title: "Pagos no registrados y caja opaca",
          description:
            "Cobros que no quedan asentados, errores de facturación y cierre de caja diario sin números claros. Es difícil saber con certeza cuánto ingresó en el día.",
        },
        {
          image: "/assets/illust-phone.png",
          title: "Dependencia de la recepción y control manual",
          description:
            "El acceso depende de quién esté en la puerta. Sin alertas visuales ni registro automático, las decisiones se toman de memoria y la visibilidad remota es limitada.",
        },
      ],
    },
    benefits: {
      title: "Tres formas en que AION te ayuda cada día",
      subtitle:
        "Beneficios claros, sin funciones que no necesitas. Así se siente operar tu gimnasio con AION.",
      items: [
        {
          title: "Todo centralizado",
          description:
            "Clientes, membresías, pagos, accesos y caja en un solo lugar. Buscas por nombre o cédula y ves el estado al instante.",
        },
        {
          title: "Control a distancia",
          description:
            "Consulta cómo va tu gimnasio desde donde estés. Revisa ingresos, asistencia y estado de los miembros sin llamar a la recepción.",
        },
        {
          title: "Operación más ordenada",
          description:
            "Cobros asentados al momento, cierre de caja con números claros y renovaciones que no dependen de la memoria de nadie.",
        },
      ],
    },
    frontDesk: {
      badge: "EXPERIENCIA EN RECEPCIÓN",
      title: "Control de acceso claro y sin fricciones",
      description:
        "Mantén la fila en movimiento. Busca miembros al instante por nombre o cédula. El sistema muestra alertas visuales para permitir o denegar el ingreso según el estado de pago, sin conversaciones incómodas en la puerta.",
      accessAllowed: "Acceso permitido",
      realTimeValidation: "Validación en tiempo real",
      features: [
        "Búsqueda instantánea por nombre o cédula",
        "Alertas visuales de estado en tiempo real",
        "Registro automático de check-ins",
      ],
      cta: "Ver cómo funciona",
      imageAlt: "Experiencia en recepción con AION Wellness",
    },
    howItWorks: {
      badge: "CÓMO FUNCIONA",
      title: "Un flujo diario pensado para tu recepción",
      subtitle:
        "De la búsqueda al cierre de caja. Así se usa AION en tu gimnasio cada día.",
      steps: [
        {
          title: "Buscar miembro",
          desc: "Busca por nombre o cédula. Encuentra el perfil en segundos.",
        },
        {
          title: "Ver estado",
          desc: "Verifica si está al día, en gracia o vencido de un vistazo.",
        },
        {
          title: "Cobrar (si corresponde)",
          desc: "Registra el pago en el momento. El sistema actualiza todo de inmediato.",
        },
        {
          title: "Permitir acceso",
          desc: "El semáforo visual indica si puede ingresar. El check-in queda registrado.",
        },
        {
          title: "Cerrar caja",
          desc: "Cierre de caja diario con números claros. Fin del día sin sorpresas.",
        },
      ],
    },
    resources: {
      title: "Recursos para potenciar tu negocio",
      subtitle:
        "Descarga gratis nuestras guías prácticas para dueños de gimnasios.",
      items: [
        {
          tag: "EBOOK GRATIS",
          image: "/assets/ebook-excel.jpg",
          title: "La guía del dueño de gimnasio para dejar Excel",
          description:
            "Aprende el proceso paso a paso para migrar tu gimnasio de cuadernos y hojas de cálculo a un sistema profesional.",
        },
        {
          tag: "PLANTILLA GRATIS",
          image: "/assets/ebook-cash.jpg",
          title: "Plantilla: Protocolo de cierre de caja diario",
          description:
            "Una plantilla descargable para establecer un proceso de cierre de caja claro y sin errores en tu gimnasio.",
        },
      ],
      download: "Descargar gratis",
      modalSubtitle: "Ingresa tu correo para recibir el recurso gratis.",
      modalInput: "correo@tugimnasio.com",
      modalButton: "Enviar y descargar",
    },
    faq: {
      title: "Tener dudas es normal. Nosotros tenemos respuestas.",
      items: [
        {
          q: "¿Es difícil migrar desde Excel?",
          a: "No, AION está diseñado para una transición sin fricciones. Puedes empezar a usarlo en minutos y migrar tus datos fácilmente con nuestra plantilla de importación.",
        },
        {
          q: "¿Necesito conocimientos técnicos?",
          a: "No. La interfaz es intuitiva para recepcionistas y dueños. No requiere capacitación técnica.",
        },
        {
          q: "¿Qué hardware necesito?",
          a: "Solo computadora o tablet con internet en recepción. No necesitas instalación local ni servidores propios.",
        },
        {
          q: "¿Cuánto tiempo lleva implementarlo?",
          a: "La mayoría opera en menos de 24 horas. La configuración inicial toma alrededor de 30 minutos.",
        },
        {
          q: "¿Puedo ver una demostración antes?",
          a: "Sí. Puedes agendar una demostración gratuita para conocer cómo funcionaría AION en tu gimnasio.",
        },
      ],
    },
    mvp: {
      badge: "NUESTRO ENFOQUE",
      title: "Un sistema pensado para el día a día",
      description:
        "AION se enfoca en resolver el día a día de tu negocio de fitness y bienestar. Sin funciones que no necesitas, sin configuraciones complejas. Próximamente: portales para miembros y automatizaciones para crecer.",
      roadmap: [
        "Portales de miembros",
        "Automatizaciones avanzadas",
        "Reportes avanzados",
        "App móvil",
      ],
    },
    leadForm: {
      title: "Agendar una demostración gratuita",
      subtitle:
        "Conoce cómo funcionaría AION en tu gimnasio. Sin compromiso, con acompañamiento directo del equipo.",
      benefits: [
        "Demostración sin compromiso",
        "Acompañamiento personalizado",
        "Configuración con apoyo del equipo",
        "Soporte directo durante la puesta en marcha",
      ],
      successTitle: "Gracias. Te contactaremos pronto.",
      successSubtitle: "Revisa tu correo para confirmar tu solicitud.",
      formTitle: "Solicitar demo",
      error: "Hubo un error. Por favor intenta de nuevo.",
      placeholders: {
        nombre: "Nombre completo",
        gimnasio: "Nombre de tu gimnasio",
        email: "correo@tugimnasio.com",
        telefono: "Teléfono / WhatsApp",
        miembros: "Número estimado de miembros",
        mensaje: "Contanos brevemente qué necesitás",
      },
      membersOptions: ["Menos de 100", "100 - 400", "Más de 400"],
      submit: "Agendar demostración",
      sending: "Enviando...",
      privacy:
        "Al enviar, aceptas nuestra política de privacidad. No compartimos tus datos.",
      required: "Campo requerido",
      invalidEmail: "Email inválido",
      selectOption: "Selecciona una opción",
    },
    footer: {
      description:
        "AION es el sistema que ayuda a ordenar, controlar y hacer crecer tu negocio de fitness y bienestar.",
      productTitle: "Producto",
      supportTitle: "Soporte",
      productLinks: ["Funciones", "Cómo funciona", "Preguntas frecuentes"],
      supportLinks: [
        "Contacto"
      ],
      rights: "2026 AION Wellness. Todos los derechos reservados.",
      version: "Versión 1.0",
    },
  },
  en: {
    navbar: {
      links: [
        { label: "Problems", href: "#problemas" },
        { label: "Benefits", href: "#beneficios" },
        { label: "How it works", href: "#flujo" },
        { label: "Questions", href: "#preguntas" },
      ],
      login: "Log in",
      demo: "Request demo",
    },
    logo: { tagline: "ORGANIZE. CONTROL. GROW." },
    hero: {
      badge: "SYSTEM FOR GYMS AND WELLNESS CENTERS",
      title: "Your entire fitness business under control",
      subtitle:
        "Manage clients, memberships, payments, access and daily cash from one place.",
      positioning:
        "AION is the system that helps you organize, control and grow your fitness and wellness business.",
      cta: "Book a free demo",
      support:
        "See how AION would work at your gym. No commitment.",
      mockup: {
        summary: "Overview",
        statLabels: [
          "Active members",
          "Today check-ins",
          "Monthly revenue",
          "Retention",
        ],
        attendance: "Attendance",
        last7days: "Last 7 days",
        memberships: "Memberships",
        donut: ["Active", "Grace", "Expired"],
        bottom: ["Memberships", "Access", "Payments", "Reports", "Wellness"],
        search: "Search member...",
      },
    },
    painPoints: {
      title: "Your daily operations become chaotic without a system",
      subtitle:
        "Scattered information, unregistered payments, missed renewals and front-desk dependency are common problems for gyms still relying on notebooks and messages.",
      items: [
        {
          image: "/assets/illust-notebook.png",
          title: "Scattered information and missed renewals",
          description:
            "Member data spread across notebooks, spreadsheets and messages. Renewals no one tracks on time, and members learning too late about their account status.",
        },
        {
          image: "/assets/illust-excel.png",
          title: "Unregistered payments and unclear cash flow",
          description:
            "Charges that are not recorded, billing errors and daily cash closing without clear numbers. It is hard to know how much actually came in.",
        },
        {
          image: "/assets/illust-phone.png",
          title: "Front-desk dependency and manual access",
          description:
            "Access depends on who is at the door. Without visual alerts or automatic logs, decisions rely on memory and remote visibility is limited.",
        },
      ],
    },
    benefits: {
      title: "Three ways AION helps you every day",
      subtitle:
        "Clear benefits, no features you do not need. This is what running your gym with AION feels like.",
      items: [
        {
          title: "Everything centralized",
          description:
            "Clients, memberships, payments, access and cash in one place. Search by name or ID and see status instantly.",
        },
        {
          title: "Remote visibility",
          description:
            "Check how your gym is doing from anywhere. Review revenue, attendance and member status without calling the front desk.",
        },
        {
          title: "More organized operations",
          description:
            "Payments recorded on the spot, daily cash closing with clear numbers and renewals that do not depend on anyone's memory.",
        },
      ],
    },
    frontDesk: {
      badge: "FRONT DESK EXPERIENCE",
      title: "Clear, frictionless access control",
      description:
        "Keep the line moving. Search members instantly by name or ID. The system shows visual alerts to allow or deny access based on payment status, without awkward conversations at the door.",
      accessAllowed: "Access granted",
      realTimeValidation: "Real-time validation",
      features: [
        "Instant search by name or ID",
        "Real-time visual status alerts",
        "Automatic check-in logging",
      ],
      cta: "See how it works",
      imageAlt: "Front desk experience with AION Wellness",
    },
    howItWorks: {
      badge: "HOW IT WORKS",
      title: "A daily workflow designed for your front desk",
      subtitle:
        "From member lookup to daily cash closing. This is how AION is used at your gym every day.",
      steps: [
        {
          title: "Search member",
          desc: "Search by name or ID. Find the profile in seconds.",
        },
        {
          title: "Check status",
          desc: "Verify whether the member is active, in grace, or expired at a glance.",
        },
        {
          title: "Charge (if needed)",
          desc: "Register the payment on the spot. The system updates everything immediately.",
        },
        {
          title: "Allow access",
          desc: "A visual traffic-light indicator shows if access is allowed. The check-in is logged.",
        },
        {
          title: "Close cash",
          desc: "Daily cash closing with clear numbers. End the day with no surprises.",
        },
      ],
    },
    resources: {
      title: "Resources to boost your business",
      subtitle: "Download practical guides for gym owners for free.",
      items: [
        {
          tag: "FREE EBOOK",
          image: "/assets/ebook-excel.jpg",
          title: "Gym owner guide to leave Excel behind",
          description:
            "Learn the step-by-step process to migrate your gym from notebooks and spreadsheets to a professional system.",
        },
        {
          tag: "FREE TEMPLATE",
          image: "/assets/ebook-cash.jpg",
          title: "Template: Daily cash closing protocol",
          description:
            "A downloadable template to establish a clear and error-free daily cash closing process.",
        },
      ],
      download: "Download free",
      modalSubtitle: "Enter your email to receive the free resource.",
      modalInput: "email@yourgym.com",
      modalButton: "Send and download",
    },
    faq: {
      title: "Questions are normal. We have answers.",
      items: [
        {
          q: "Is migrating from Excel difficult?",
          a: "No. AION is designed for a smooth transition, and you can start in minutes.",
        },
        {
          q: "Do I need technical skills?",
          a: "Not at all. The interface is intuitive for front desk teams and owners.",
        },
        {
          q: "What hardware do I need?",
          a: "Only a computer or tablet with internet access at your front desk.",
        },
        {
          q: "How long does implementation take?",
          a: "Most users are operating in less than 24 hours.",
        },
        {
          q: "Can I see a demo first?",
          a: "Yes. You can book a free demo to see how AION would work at your gym.",
        },
      ],
    },
    mvp: {
      badge: "OUR APPROACH",
      title: "A system built for your daily operations",
      description:
        "AION focuses on solving the day-to-day of your fitness and wellness business. No features you do not need, no complex configuration. Coming soon: member portals and automations to grow.",
      roadmap: [
        "Member portals",
        "Advanced automations",
        "Advanced reports",
        "Mobile app",
      ],
    },
    leadForm: {
      title: "Book a free demo",
      subtitle:
        "See how AION would work at your gym. No commitment, with direct support from the team.",
      benefits: [
        "Free demo, no commitment",
        "Personalized guidance",
        "Setup support from the team",
        "Direct support during go-live",
      ],
      successTitle: "Thanks. We will contact you soon.",
      successSubtitle: "Check your email to confirm your request.",
      formTitle: "Request demo",
      error: "There was an error. Please try again.",
      placeholders: {
        nombre: "Full name",
        gimnasio: "Gym name",
        email: "email@yourgym.com",
        telefono: "Phone / WhatsApp",
        miembros: "Estimated number of members",
        mensaje: "Briefly tell us what you need",
      },
      membersOptions: ["Less than 100", "100 - 400", "More than 400"],
      submit: "Book demo",
      sending: "Sending...",
      privacy:
        "By submitting, you accept our privacy policy. We do not share your data.",
      required: "Required field",
      invalidEmail: "Invalid email",
      selectOption: "Select an option",
    },
    footer: {
      description:
        "AION is the system that helps you organize, control and grow your fitness and wellness business.",
      productTitle: "Product",
      supportTitle: "Support",
      productLinks: ["Features", "How it works", "Questions"],
      supportLinks: ["Contact"],
      rights: "2026 AION Wellness. All rights reserved.",
      version: "Version 1.0",
    },
  },
} as const;
