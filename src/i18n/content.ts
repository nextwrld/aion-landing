export type Lang = "es" | "en";

export const content = {
  es: {
    navbar: {
      links: [
        { label: "Soluciones", href: "#soluciones" },
        { label: "Funciones", href: "#funciones" },
        { label: "FAQs", href: "#precios" },
      ],
      login: "Iniciar sesión",
      demo: "Solicitar demo",
    },
    logo: { tagline: "GESTIONA. CONECTA. CRECE." },
    hero: {
      badge: "PLATAFORMA DE GESTIÓN PARA GIMNASIOS",
      title:
        "AION Wellness: Tu socio integral para simplificar y controlar tu gimnasio.",
      subtitle:
        "El software esencial diseñado para gimnasios pequeños y medianos que operan hoy con cuadernos y Excel. Resuelve el 80% de tu caos diario.",
      cta: "Solicitar demo early adopter",
      stats: [
        { value: "200+", label: "gimnasios" },
        { value: "4.9/5", label: "calificación" },
        { value: "98%", label: "satisfacción" },
      ],
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
      title: "¿Cansado del caos operativo de cuadernos, Excel y WhatsApp?",
      subtitle:
        "La mayoría de los gimnasios pequeños pierden horas cada día gestionando información fragmentada. Estos son los tres dolores más comunes.",
      items: [
        {
          image: "/assets/illust-notebook.png",
          title: "Información fragmentada",
          description:
            "Perdiendo tiempo buscando datos de miembros entre hojas sueltas, notas de WhatsApp y archivos desordenados.",
        },
        {
          image: "/assets/illust-excel.png",
          title: "Finanzas opacas",
          description:
            "Errores de facturación recurrentes y falta de control en la caja diaria. Nunca sabés exactamente cuánto ingresaste.",
        },
        {
          image: "/assets/illust-phone.png",
          title: "Comunicación ineficiente",
          description:
            "Avisos de vencimiento que se pierden entre cientos de mensajes. Los miembros se enteran tarde de sus vencimientos.",
        },
      ],
    },
    benefits: {
      title: "Centraliza lo esencial. Enfócate en tus miembros.",
      subtitle:
        "Todo lo que necesitas para operar tu gimnasio en una sola plataforma. Sin funciones que nunca usarás.",
      items: [
        {
          title: "Control total de miembros",
          description:
            "Vista instantánea del estado de cada miembro: Activo, Gracia o Vencido. Búsqueda rápida por nombre o DNI.",
        },
        {
          title: "Membresías flexibles",
          description:
            "Seguimiento automático de planes mensuales, semanales o por pack de usos. Renovaciones sin esfuerzo.",
        },
        {
          title: "Check-in ágil",
          description:
            "Validación visual inmediata en la recepción. Sube de color según el estado del miembro en tiempo real.",
        },
        {
          title: "Finanzas bajo control",
          description:
            "Cierres de caja diarios precisos y recibos digitales automáticos. Sabes exactamente cuánto ingresó cada día.",
        },
      ],
    },
    frontDesk: {
      badge: "EXPERIENCIA EN RECEPCIÓN",
      title: "Control de acceso sin fricciones",
      description:
        "Mantén la fila en movimiento. Busca miembros al instante por nombre o DNI. El sistema proporciona alertas visuales claras para permitir o denegar el ingreso según el estado de pago en tiempo real, evitando conversaciones incómodas en la puerta.",
      accessAllowed: "Acceso permitido",
      realTimeValidation: "Validación en tiempo real",
      features: [
        "Búsqueda instantánea por nombre o DNI",
        "Alertas visuales de estado en tiempo real",
        "Registro automático de check-ins",
      ],
      cta: "Ver cómo funciona",
      imageAlt: "Experiencia en recepción con AION Wellness",
    },
    howItWorks: {
      badge: "CÓMO FUNCIONA",
      title: "Un flujo diario validado.",
      subtitle:
        "De la búsqueda al cierre de caja. Así funciona AION en tu recepción cada día.",
      steps: [
        {
          title: "Buscar miembro",
          desc: "Busca por nombre o DNI. Encuentra el perfil en segundos.",
        },
        {
          title: "Ver estado",
          desc: "Verifica si está al día, en gracia o vencido de un vistazo.",
        },
        {
          title: "Cobrar (si corresponde)",
          desc: "Registra el pago en el momento. El sistema actualiza todo automáticamente.",
        },
        {
          title: "Permitir acceso",
          desc: "El semáforo visual indica si puede ingresar. Check-in registrado.",
        },
        {
          title: "Cerrar caja",
          desc: "Cierre de caja diario con recibo digital. Fin del día sin sorpresas.",
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
          q: "¿Puedo probarlo antes?",
          a: "Sí, ofrecemos prueba gratuita de 14 días con acceso completo y sin tarjeta de crédito.",
        },
      ],
    },
    mvp: {
      badge: "NUESTRA FILOSOFÍA",
      title: "Un producto altamente enfocado.",
      description:
        "Este MVP resuelve el 80% core de tus operaciones diarias. Sin tiers confusos, sin funciones hinchadas. Pronto: Portales de miembros y automatizaciones avanzadas.",
      roadmap: [
        "Portales de miembros",
        "Automatizaciones avanzadas",
        "Reportes avanzados",
        "App móvil",
      ],
    },
    leadForm: {
      title: "Prueba AION Wellness hoy",
      subtitle:
        "Únete a los gimnasios que ya dejaron el caos operativo atrás. Empieza gratis, sin tarjeta de crédito.",
      benefits: [
        "Prueba gratuita de 14 días",
        "Sin tarjeta de crédito",
        "Implementación en 24 horas",
        "Soporte personalizado",
      ],
      successTitle: "¡Gracias! Te contactaremos pronto.",
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
      submit: "Empezar a operar mejor",
      sending: "Enviando...",
      privacy:
        "Al enviar, aceptas nuestra política de privacidad. No compartimos tus datos.",
      required: "Campo requerido",
      invalidEmail: "Email inválido",
      selectOption: "Selecciona una opción",
    },
    footer: {
      description:
        "Plataforma SaaS para la gestión inteligente de gimnasios y centros de bienestar.",
      productTitle: "Producto",
      supportTitle: "Soporte",
      productLinks: ["Funciones", "Precios", "API"],
      supportLinks: [
        "Centro de ayuda",
        "Contacto",
        "Estado del sistema",
        "Blog",
      ],
      rights: "2026 AION Wellness. Todos los derechos reservados.",
      version: "Versión 1.0",
    },
  },
  en: {
    navbar: {
      links: [
        { label: "Solutions", href: "#soluciones" },
        { label: "Features", href: "#funciones" },
        { label: "FAQs", href: "#precios" },
      ],
      login: "Log in",
      demo: "Request demo",
    },
    logo: { tagline: "MANAGE. CONNECT. GROW." },
    hero: {
      badge: "GYM MANAGEMENT PLATFORM",
      title:
        "AION Wellness: Your all-in-one partner to simplify and control your gym.",
      subtitle:
        "Essential software for small and mid-sized gyms still running on notebooks and spreadsheets. Solve 80% of your daily chaos.",
      cta: "Request early adopter demo",
      stats: [
        { value: "200+", label: "gyms" },
        { value: "4.9/5", label: "rating" },
        { value: "98%", label: "satisfaction" },
      ],
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
      title: "Tired of operational chaos across notebooks, Excel and WhatsApp?",
      subtitle:
        "Most small gyms lose hours every day managing fragmented information. These are the three most common pain points.",
      items: [
        {
          image: "/assets/illust-notebook.png",
          title: "Fragmented information",
          description:
            "Wasting time searching member data across loose sheets, WhatsApp notes, and scattered files.",
        },
        {
          image: "/assets/illust-excel.png",
          title: "Opaque finances",
          description:
            "Recurring billing errors and poor control of daily cash closing. You never know exactly how much came in.",
        },
        {
          image: "/assets/illust-phone.png",
          title: "Inefficient communication",
          description:
            "Due-date reminders get lost among hundreds of messages. Members learn too late about expirations.",
        },
      ],
    },
    benefits: {
      title: "Centralize what matters. Focus on your members.",
      subtitle:
        "Everything you need to run your gym in one platform. No features you will never use.",
      items: [
        {
          title: "Total member control",
          description:
            "Instant view of each member status: Active, Grace, or Expired. Fast search by name or ID.",
        },
        {
          title: "Flexible memberships",
          description:
            "Automatic tracking for monthly, weekly, or usage-pack plans. Effortless renewals.",
        },
        {
          title: "Fast check-in",
          description:
            "Immediate visual validation at front desk with real-time status color signals.",
        },
        {
          title: "Finances under control",
          description:
            "Accurate daily cash closing and automated digital receipts. Know exactly what came in each day.",
        },
      ],
    },
    frontDesk: {
      badge: "FRONT DESK EXPERIENCE",
      title: "Frictionless access control",
      description:
        "Keep the line moving. Search members instantly by name or ID. The system provides clear visual alerts to allow or deny access based on real-time payment status.",
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
      title: "A validated daily workflow.",
      subtitle:
        "From member lookup to daily cash closing. This is how AION works at your front desk every day.",
      steps: [
        {
          title: "Search member",
          desc: "Search by name or ID. Find the profile in seconds.",
        },
        {
          title: "Check status",
          desc: "Verify whether the member is active, in grace period, or expired at a glance.",
        },
        {
          title: "Charge (if needed)",
          desc: "Register the payment on the spot. The system updates everything automatically.",
        },
        {
          title: "Allow access",
          desc: "A visual traffic-light indicator shows if access is allowed. Check-in is logged.",
        },
        {
          title: "Close cash",
          desc: "Daily cash closing with digital receipt. End your day with no surprises.",
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
          q: "Can I try it before committing?",
          a: "Yes, there is a 14-day free trial with full access and no credit card required.",
        },
      ],
    },
    mvp: {
      badge: "OUR PHILOSOPHY",
      title: "A highly focused product.",
      description:
        "This MVP solves the core 80% of your daily operations. No confusing tiers, no bloated features. Coming soon: Member portals and advanced automations.",
      roadmap: [
        "Member portals",
        "Advanced automations",
        "Advanced reports",
        "Mobile app",
      ],
    },
    leadForm: {
      title: "Try AION Wellness today",
      subtitle:
        "Join gyms that already left operational chaos behind. Start free, no credit card required.",
      benefits: [
        "14-day free trial",
        "No credit card required",
        "24-hour onboarding",
        "Personalized support",
      ],
      successTitle: "Thanks! We will contact you soon.",
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
      submit: "Start operating better",
      sending: "Sending...",
      privacy:
        "By submitting, you accept our privacy policy. We do not share your data.",
      required: "Required field",
      invalidEmail: "Invalid email",
      selectOption: "Select an option",
    },
    footer: {
      description:
        "SaaS platform for smart management of gyms and wellness centers.",
      productTitle: "Product",
      supportTitle: "Support",
      productLinks: ["Features", "Pricing", "API"],
      supportLinks: ["Help center", "Contact", "System status", "Blog"],
      rights: "2026 AION Wellness. All rights reserved.",
      version: "Version 1.0",
    },
  },
} as const;
