export const COMPANY = {
  name: "Syntek Solutions",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@syntek.solutions",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+1 (555) 123-4567",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/15551234567",
  linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin.com/company/syntek-solutions",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/syntek-solutions",
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL || "", // Empty by default to test fallback state
} as const;

export const hasCalendly = Boolean(COMPANY.calendlyUrl);
export const hasWhatsApp = Boolean(COMPANY.whatsappUrl);
export const hasLinkedIn = Boolean(COMPANY.linkedinUrl);
export const hasGitHub = Boolean(COMPANY.githubUrl);
