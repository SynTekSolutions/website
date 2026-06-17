import { COMPANY } from "./company";

export const CALENDLY_CONFIG = {
  url: COMPANY.calendlyUrl,
  buttonText: "Agendar Reunión",
  durationMinutes: 30,
} as const;

export const isCalendlyEnabled = Boolean(CALENDLY_CONFIG.url);
export const hasWhatsappUrl = Boolean(COMPANY.whatsappUrl);
export const hasLinkedinUrl = Boolean(COMPANY.linkedinUrl);
export const hasGithubUrl = Boolean(COMPANY.githubUrl);
