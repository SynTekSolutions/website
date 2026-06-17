export interface NavItem {
  label: string;
  href: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Servicios", href: "#services" },
  { label: "Casos de Éxito", href: "#use-cases" },
  { label: "Por Qué Nosotros", href: "#why-choose-us" },
  { label: "Metodología", href: "#process" },
  { label: "Preguntas Frecuentes", href: "#faq" },
];

export const FOOTER_COMPANY_ITEMS: NavItem[] = [
  { label: "Sobre Nosotros", href: "#" },
  { label: "Contacto", href: "#contact" },
];

export const FOOTER_LEGAL_ITEMS: NavItem[] = [
  { label: "Política de Privacidad", href: "#" },
  { label: "Términos de Servicio", href: "#" },
];
