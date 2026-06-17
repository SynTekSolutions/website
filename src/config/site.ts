export const siteConfig = {
  name: "Syntek Solutions",
  shortName: "Syntek",
  description: "Desarrollo de Software a Medida, Automatización de Procesos, Plataformas SaaS y Soluciones de Inteligencia Artificial.",
  url: "https://syntek.solutions",
  ogImage: "/og-image.png",
} as const;

export type SiteConfig = typeof siteConfig;
