import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { FOOTER_COMPANY_ITEMS, FOOTER_LEGAL_ITEMS } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { COMPANY, hasLinkedIn, hasGitHub, hasWhatsApp } from "@/config/company";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4" aria-label="Volver al inicio">
              <Image
                src="/logo-horizontal.png"
                alt={`${COMPANY.name} Logo`}
                width={200}
                height={48}
                className="h-9 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm text-sm leading-relaxed">
              {siteConfig.description}
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3">
              {hasLinkedIn && (
                <a
                  href={COMPANY.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-gray-300 hover:bg-secondary hover:text-white transition-all duration-300 hover-lift"
                  aria-label="Ir al perfil de LinkedIn corporativo"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              )}
              {hasWhatsApp && (
                <a
                  href={COMPANY.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-gray-300 hover:bg-secondary hover:text-white transition-all duration-300 hover-lift"
                  aria-label="Escríbenos por WhatsApp"
                >
                  <WhatsappIcon className="h-5 w-5" />
                </a>
              )}
              {hasGitHub && (
                <a
                  href={COMPANY.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-gray-300 hover:bg-secondary hover:text-white transition-all duration-300 hover-lift"
                  aria-label="Ir a la organización de GitHub"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Company Links Column */}
          <div>
            <h3 className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-300 mb-4">
              Compañía
            </h3>
            <ul className="space-y-3">
              {FOOTER_COMPANY_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm inline-flex items-center gap-2"
                  >
                    {item.label}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="font-heading font-semibold text-sm tracking-wider uppercase text-gray-300 mb-4">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <Mail className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{COMPANY.phone ? "Soporte Remoto e Integraciones" : ""}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} {COMPANY.name}. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6">
            {FOOTER_LEGAL_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-500 hover:text-gray-200 hover:underline underline-offset-2 transition-all duration-300 text-xs font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
