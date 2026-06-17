"use client";

import React from "react";
import { Code, Cpu, Layers, Sparkles, Network, ArrowRight, MessageSquare, CheckCircle } from "lucide-react";
import { SERVICES } from "@/content/services";
import { Button } from "@/components/ui/Button";
import { COMPANY } from "@/config/company";
import { AnalyticsService } from "@/lib/analytics/analytics.service";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code: Code,
  Cpu: Cpu,
  Layers: Layers,
  Sparkles: Sparkles,
  Network: Network,
};

export const ServicesSection = () => {
  const handleServiceClick = (serviceId: string) => {
    AnalyticsService.trackEvent("service_viewed", { serviceId });
  };

  const handleSecondaryCtaClick = () => {
    AnalyticsService.trackEvent("cta_clicked", { location: "services_footer", label: "Solicitar Asesoría" });
  };

  return (
    <section id="services" className="bg-dark-muted min-h-screen flex flex-col justify-center py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — premium */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-4 block">
            Servicios Especializados
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-6">
            Soluciones tecnológicas de nivel empresarial
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Ofrecemos ingeniería de software de primer nivel, diseñando soluciones robustas que optimizan operaciones y potencian el crecimiento comercial.
          </p>
        </div>

        {/* Services Grid — premium cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {SERVICES.map((service, index) => {
            const IconComponent = iconMap[service.iconName] || Code;
            return (
              <div
                key={service.id}
                className="group bg-white/5 border border-white/10 rounded-2xl p-8 shadow-premium hover:shadow-2xl hover:border-secondary/30 hover:bg-white/8 transition-all duration-300 flex flex-col hover:-translate-y-1 animate-stagger hover-shadow"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                {/* Icon wrapper — premium style */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10 text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-all duration-300" aria-hidden="true">
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="font-heading font-bold text-xl text-white mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-white/50 text-sm leading-relaxed mb-6 flex-grow">
                  {service.description}
                </p>

                {/* Features List — premium bullets */}
                <ul className="space-y-2.5 border-t border-white/10 pt-6 mb-6" aria-label={`Características de ${service.title}`}>
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-xs font-medium text-white/80">
                      <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Link/CTA */}
                <a
                  href="#contact"
                  onClick={() => handleServiceClick(service.id)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors duration-200 mt-auto group/link"
                >
                  Cotizar Servicio
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden="true" />
                </a>
              </div>
            );
          })}
        </div>

        {/* CTA Section — premium card */}
        <div className="bg-gradient-to-br from-dark to-dark/95 rounded-3xl p-10 md:p-16 text-center shadow-premium overflow-hidden relative animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          {/* Subtle background accent */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h4 className="font-heading font-bold text-2xl text-white mb-4">
              ¿Tienes un requerimiento a medida?
            </h4>
            <p className="text-gray-300 text-base mb-8">
              Escríbenos directamente y un Ingeniero Senior evaluará tus necesidades para estructurar una propuesta técnica adaptada.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                href={COMPANY.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
                onClick={handleSecondaryCtaClick}
                className="hover-lift hover-shadow"
              >
                <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true" />
                Solicitar Asesoría
              </Button>
              <Button
                href="#contact"
                variant="outline-light"
                size="lg"
                className="hover-lift"
              >
                Enviar Requerimiento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
