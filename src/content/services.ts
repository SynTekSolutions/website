export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  features: string[];
  iconName: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: "custom-software",
    title: "Desarrollo de Software a Medida",
    description: "Soluciones de software diseñadas exclusivamente para resolver los desafíos específicos y flujos de trabajo de tu empresa.",
    longDescription: "Construimos aplicaciones web y móviles robustas y escalables con tecnologías modernas. Desde modernización de sistemas heredados hasta el diseño de nuevos productos digitales, garantizamos un código limpio y una experiencia de usuario excepcional.",
    features: [
      "Aplicaciones Web y Portales Corporativos",
      "Arquitecturas Cloud-Native",
      "Diseño y Desarrollo de APIs",
      "Modernización de Sistemas Heredados"
    ],
    iconName: "Code"
  },
  {
    id: "business-automation",
    title: "Automatización de Procesos",
    description: "Elimina tareas manuales repetitivas, reduce errores humanos y acelera la velocidad operativa de tu equipo.",
    longDescription: "Optimiza la eficiencia de tu negocio. Diseñamos e implementamos flujos de trabajo automatizados que conectan tus herramientas actuales, procesan datos en tiempo real, generan reportes y reducen costos operativos drásticamente.",
    features: [
      "Optimización de Flujos de Trabajo",
      "Automatización RPA e Integraciones",
      "Procesamiento Automatizado de Documentos",
      "Herramientas y Scripts Personalizados"
    ],
    iconName: "Cpu"
  },
  {
    id: "saas-platforms",
    title: "Plataformas SaaS",
    description: "Diseño y desarrollo completo de software como servicio, desde el prototipo hasta arquitecturas multinivel en la nube.",
    longDescription: "Transforma tu visión comercial en un producto SaaS exitoso. Desarrollamos arquitecturas multi-inquilino seguras con esquemas de suscripción, pasarelas de pago, paneles administrativos y control de acceso robusto.",
    features: [
      "Arquitectura Multi-Inquilino (Multi-tenant)",
      "Integración de Pagos y Suscripciones",
      "Paneles de Control y Analíticas",
      "Estructuras Cloud de Alta Disponibilidad"
    ],
    iconName: "Layers"
  },
  {
    id: "ai-solutions",
    title: "Soluciones de Inteligencia Artificial",
    description: "Integra modelos inteligentes en tus productos para automatizar decisiones y extraer el valor oculto de tus datos.",
    longDescription: "Aprovecha la IA para obtener ventajas competitivas reales. Integramos sistemas LLM corporativos, motores de búsqueda semántica (RAG) y algoritmos de analítica predictiva adaptados a los datos internos de tu organización.",
    features: [
      "Integración de LLMs y Agentes de IA",
      "Búsqueda Semántica y Sistemas RAG",
      "Analítica Predictiva y Modelos de Datos",
      "Procesamiento de Lenguaje Natural (NLP)"
    ],
    iconName: "Sparkles"
  },
  {
    id: "enterprise-integrations",
    title: "Integraciones Empresariales",
    description: "Conecta de forma segura tus sistemas CRM, ERP, bases de datos y herramientas de terceros en un único ecosistema.",
    longDescription: "Rompe los silos de información. Diseñamos middleware de integración de alta fiabilidad, webhooks y conectores seguros para sincronizar y proteger el flujo de datos entre tus plataformas críticas de negocio.",
    features: [
      "Sincronización de CRM y ERP (Salesforce, SAP)",
      "Middleware Personalizado y Webhooks",
      "Tuberías de Datos en Tiempo Real (Pipelines)",
      "Seguridad OAuth y Gestión de Acceso (IAM)"
    ],
    iconName: "Network"
  }
];
