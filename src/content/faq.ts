export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_CONTENT: FAQItem[] = [
  {
    question: "¿En qué tecnologías se especializa Syntek Solutions?",
    answer:
      "Desarrollamos principalmente con infraestructuras modernas y robustas basadas en Next.js, React, TypeScript, TailwindCSS, Node.js y Supabase/PostgreSQL. Implementamos soluciones en plataformas de alta disponibilidad como Vercel y AWS, garantizando escalabilidad y minimizando los costos de mantenimiento de servidores."
  },
  {
    question: "¿Cómo manejan la integración con nuestros sistemas de software actuales?",
    answer:
      "Diseñamos e implementamos middleware y conectores API personalizados (REST o GraphQL) para sincronizar bases de datos legacy, ERPs (como SAP o Dynamics) y CRMs (como Salesforce o HubSpot). Toda la comunicación está protegida con cifrado SSL, validaciones de seguridad y gestión segura de llaves de API."
  },
  {
    question: "¿La aplicación soportará futuras funciones de SaaS como suscripciones o portales?",
    answer:
      "Totalmente. Estructuramos todos nuestros desarrollos utilizando arquitectura limpia orientada a features. Esto significa que cuando decidas implementar pasarelas de pago (Stripe), autenticación avanzada (Clerk) o integraciones de IA (Pinecone/Vectores), podrás hacerlo de forma modular sin tener que reescribir la base del código."
  },
  {
    question: "¿Firmarían un Acuerdo de Confidencialidad (NDA) antes de iniciar?",
    answer:
      "Sí. Firmamos acuerdos de confidencialidad antes de que compartas cualquier detalle técnico, base de datos o lógica interna de tu negocio. La seguridad de la información y la propiedad intelectual de nuestros clientes es una prioridad absoluta."
  },
  {
    question: "¿Qué tipo de soporte ofrecen después de desplegar el software?",
    answer:
      "Ofrecemos acuerdos de nivel de servicio (SLAs) flexibles para monitoreo de errores en tiempo real, actualizaciones de seguridad, soporte técnico y desarrollo iterativo de nuevas funcionalidades para garantizar que la plataforma opere de manera óptima a largo plazo."
  }
];
