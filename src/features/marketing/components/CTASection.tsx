"use client";

import React from "react";
import { MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { COMPANY } from "@/config/company";
import { HOME_CONTENT } from "@/content/home";
import { CALENDLY_CONFIG, isCalendlyEnabled } from "@/config/calendly";
import { AnalyticsService } from "@/lib/analytics/analytics.service";

export const CTASection = () => {
  const { cta } = HOME_CONTENT;

  const handleWhatsappClick = () => {
    AnalyticsService.trackEvent("whatsapp_clicked", { location: "cta_section" });
  };

  const handleCalendlyClick = () => {
    if (isCalendlyEnabled) {
      AnalyticsService.trackEvent("calendly_clicked", { location: "cta_section" });
    } else {
      AnalyticsService.trackEvent("cta_clicked", { type: "calendly_fallback", location: "cta_section" });
    }
  };

  return (
    <section className="bg-white py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-dark rounded-3xl p-12 md:p-20 text-center shadow-premium overflow-hidden animate-fade-in-up">
          {/* Premium background accent */}
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-secondary rounded-full blur-3xl animate-blur-reveal" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-30 animate-blur-reveal" style={{ animationDelay: "0.2s" }} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Badge */}
            <span className="text-secondary text-xs font-bold uppercase tracking-widest mb-6 block animate-fade-in-up">
              {cta.badge}
            </span>

            {/* Title — maximum impact */}
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              {cta.title}
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-lg leading-relaxed mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {cta.description}
            </p>
            
            {/* Primary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Button
                href={COMPANY.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto px-8 hover-lift hover-shadow"
                onClick={handleWhatsappClick}
              >
                <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true" />
                {cta.primaryCta}
                <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>

              {isCalendlyEnabled ? (
                <Button
                  href={CALENDLY_CONFIG.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 text-white border-white/30 hover:bg-white/10 hover-lift hover-shadow"
                  onClick={handleCalendlyClick}
                >
                  <Calendar className="mr-2 h-5 w-5" aria-hidden="true" />
                  {cta.secondaryCta}
                </Button>
              ) : (
                <Button
                  href="#contact"
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 text-white border-white/30 hover:bg-white/10 hover-lift hover-shadow"
                  onClick={handleCalendlyClick}
                >
                  <Calendar className="mr-2 h-5 w-5" aria-hidden="true" />
                  {cta.secondaryCta}
                </Button>
              )}
            </div>
            
            {/* Alternative contact method */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <p className="text-gray-400 text-sm mb-2">
                O contáctanos directamente:
              </p>
              <a
                href={`mailto:${COMPANY.email}`}
                className="text-gray-300 hover:text-secondary text-sm font-semibold transition-all duration-300 inline-flex items-center gap-2 hover:translate-x-1 hover-color"
              >
                {COMPANY.email}
                <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
