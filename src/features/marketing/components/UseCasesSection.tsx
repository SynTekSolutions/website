"use client";

import React from "react";
import { BarChart3, ShieldCheck, Zap, Calendar, MessageSquare } from "lucide-react";
import { HOME_CONTENT } from "@/content/home";
import { Button } from "@/components/ui/Button";
import { CALENDLY_CONFIG, isCalendlyEnabled } from "@/config/calendly";
import { COMPANY } from "@/config/company";
import { AnalyticsService } from "@/lib/analytics/analytics.service";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  speed: Zap,
  support: BarChart3,
  uptime: ShieldCheck,
};

export const UseCasesSection = () => {
  const { useCases } = HOME_CONTENT;

  const handleSecondaryCtaClick = () => {
    if (isCalendlyEnabled) {
      AnalyticsService.trackEvent("calendly_clicked", { location: "use_cases_footer" });
    } else {
      AnalyticsService.trackEvent("whatsapp_clicked", { location: "use_cases_footer" });
    }
  };

  return (
    <section id="use-cases" className="bg-muted min-h-screen flex flex-col justify-center py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-dark mb-4">
            {useCases.title}
          </h2>
          <p className="text-text-muted text-base sm:text-lg">
            {useCases.subtitle}
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {useCases.items.map((useCase, index) => {
            const IconComponent = iconMap[useCase.metricType] || Zap;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-premium flex flex-col hover:border-secondary/30 transition-all duration-300 animate-stagger hover-shadow"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                {/* Badge */}
                <span className="inline-block text-[11px] font-bold text-secondary tracking-wider uppercase mb-4">
                  {useCase.badge}
                </span>

                {/* Title */}
                <h3 className="font-heading font-bold text-xl text-dark mb-3">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-text-muted text-sm leading-relaxed mb-6 flex-grow">
                  {useCase.description}
                </p>

                {/* Metrics Callout */}
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted border border-muted-darker mt-auto">
                  <div className="p-1.5 rounded bg-white text-secondary shadow-sm" aria-hidden="true">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-dark uppercase tracking-wide">
                    {useCase.metrics}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary CTA */}
        <div className="bg-muted p-8 rounded-2xl border border-muted-darker text-center max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h4 className="font-heading font-bold text-lg text-dark mb-2">
            ¿Quieres evaluar la viabilidad de tu idea técnica?
          </h4>
          <p className="text-text-muted text-sm mb-6">
            Programa una sesión de alineación con un Ingeniero de Staff para estructurar tu propuesta.
          </p>
          <div className="flex items-center justify-center">
            {isCalendlyEnabled ? (
              <Button
                href={CALENDLY_CONFIG.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="md"
                onClick={handleSecondaryCtaClick}
                className="hover-lift hover-shadow"
              >
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                Agendar Reunión de Diagnóstico
              </Button>
            ) : (
              <Button
                href={COMPANY.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="md"
                onClick={handleSecondaryCtaClick}
                className="hover-lift hover-shadow"
              >
                <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                Consultar Vía WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
