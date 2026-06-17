export const HOME_CONTENT = {
  hero: {
    badge: "Software de Ingeniería Empresarial",
    title: "Construimos el software que tu empresa necesita para operar sin fricción y escalar sin riesgos.",
    subtitle: "Sistemas a medida, automatizaciones críticas y plataformas SaaS desarrolladas por ingenieros senior — sin código tercerizado, sin promesas vacías.",
    primaryCta: "Habla con un Ingeniero Senior",
    secondaryCta: "Ver casos de aplicación",
    trustIndicators: [
      { label: "100% ingenieros senior" },
      { label: "Cero código tercerizado" },
      { label: "Arquitectura escalable desde día 1" }
    ]
  },
  useCases: {
    title: "Casos de Aplicación Real",
    subtitle: "Descubre cómo nuestras soluciones de software y automatización optimizan la operativa diaria de las empresas.",
    items: [
      {
        badge: "Automatización de Procesos",
        title: "Orquestación Automatizada de Cadena de Suministro",
        description: "Conectamos ERPs heredados y bases de datos aisladas para automatizar el ruteo de órdenes de compra, reduciendo el trabajo manual en un 85% y liberando 30 horas semanales de gestión administrativa.",
        metrics: "Procesamiento 85% más rápido",
        metricType: "speed"
      },
      {
        badge: "Plataformas SaaS e IA",
        title: "Portal de Clientes Inteligente y Multi-inquilino",
        description: "Desarrollamos un portal centralizado que integra autenticación segura, control de suscripciones y un asistente de IA (RAG) capaz de resolver consultas técnicas al instante usando bases de conocimiento históricas.",
        metrics: "Reducción del 60% en tickets de soporte",
        metricType: "support"
      },
      {
        badge: "Desarrollo de Software",
        title: "Panel de Gestión de Inventario en Tiempo Real",
        description: "Reemplazamos un sistema de escritorio obsoleto con un panel web en la nube de alta disponibilidad, equipado con permisos granulares (RBAC), auditorías de acceso y sincronización de datos instantánea.",
        metrics: "99.99% de disponibilidad garantizada",
        metricType: "uptime"
      }
    ]
  },
  whyUs: {
    badge: "El Estándar Syntek",
    title: "Software diseñado para soportar el crecimiento de tu negocio",
    description: "No creamos prototipos frágiles que deban reescribirse desde cero en unos meses. Desarrollamos con patrones de arquitectura limpia y escalable que se adaptan a medida que tu empresa evoluciona.",
    stats: [
      { value: "100%", label: "Ingenieros Senior" },
      { value: "Cero", label: "Código Tercerizado" }
    ],
    strengths: [
      {
        title: "Ingeniería 100% Senior",
        description: "Sin desarrolladores junior. Tus proyectos son diseñados y programados únicamente por arquitectos de software con amplia experiencia."
      },
      {
        title: "Código Limpio y Reutilizable",
        description: "Seguimos estrictamente los principios SOLID y arquitecturas basadas en features, facilitando el mantenimiento y la extensibilidad del código."
      },
      {
        title: "Seguridad de Nivel Empresarial",
        description: "Implementamos validación estricta de datos en servidor, cifrado de variables y control de acceso robusto desde el primer día."
      },
      {
        title: "Optimización de Rendimiento y SEO",
        description: "Estructuramos código optimizado para tiempos de carga ultrarrápidos, optimización de imágenes y máxima indexación en motores de búsqueda."
      }
    ]
  },
  process: {
    title: "Nuestra Metodología de Entrega",
    subtitle: "Un proceso de ingeniería estructurado y transparente para garantizar predictibilidad, calidad y seguridad.",
    steps: [
      {
        step: "01",
        title: "Descubrimiento y Alineación",
        description: "Evaluamos tu arquitectura técnica actual, documentamos tus requerimientos comerciales y estructuramos una propuesta clara antes de programar."
      },
      {
        step: "02",
        title: "Diseño y Prototipado",
        description: "Diseñamos interfaces intuitivas y definimos esquemas de bases de datos para alinear las expectativas de comportamiento del software."
      },
      {
        step: "03",
        title: "Desarrollo y Pruebas",
        description: "Escribimos código type-safe bajo estrictos estándares, realizamos pruebas de integración e implementamos tuberías de despliegue continuo."
      },
      {
        step: "04",
        title: "Optimización y Lanzamiento",
        description: "Medimos el rendimiento y web vitals, configuramos sistemas de logs en producción y desplegamos la plataforma de manera segura."
      }
    ]
  },
  cta: {
    badge: "Inicia tu Proyecto",
    title: "¿Listo para optimizar las operaciones de tu empresa?",
    description: "Trabaja con Syntek Solutions para construir plataformas tecnológicas robustas, automatizar flujos de trabajo críticos y eliminar ineficiencias. Agenda una sesión técnica de alineación hoy mismo.",
    primaryCta: "Hablemos de tu Proyecto",
    secondaryCta: "Agendar Reunión"
  }
} as const;
