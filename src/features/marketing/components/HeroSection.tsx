"use client";

import React from "react";
import { Cpu, Code, Layers, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { COMPANY } from "@/config/company";
import { HOME_CONTENT } from "@/content/home";
import { CALENDLY_CONFIG, isCalendlyEnabled } from "@/config/calendly";
import { AnalyticsService } from "@/lib/analytics/analytics.service";

export const HeroSection = () => {
  const { hero } = HOME_CONTENT;

  const handleWhatsappClick = () => {
    AnalyticsService.trackEvent("whatsapp_clicked", { location: "hero" });
  };

  const handleCalendlyClick = () => {
    if (isCalendlyEnabled) {
      AnalyticsService.trackEvent("calendly_clicked", { location: "hero" });
    } else {
      AnalyticsService.trackEvent("cta_clicked", { type: "calendly_fallback", location: "hero" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-dark min-h-screen flex flex-col justify-center pt-20">
      {/* Premium background — animated blur reveal */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-muted to-dark opacity-100" />
        <div className="absolute -top-40 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-70 animate-blur-reveal" />
        <div className="absolute -bottom-32 -left-20 w-[32rem] h-[32rem] bg-primary/30 rounded-full blur-3xl opacity-50 animate-blur-reveal" style={{ animationDelay: "0.2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge — premium style */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold uppercase tracking-widest mb-8 animate-fade-in-up">
            <Cpu className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
            {hero.badge}
          </div>

          {/* Heading — maximum impact, clear hierarchy */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {hero.title}
          </h1>

          {/* Subheading — clear value prop */}
          <p className="text-white/60 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto mb-12 font-medium animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {hero.subtitle}
          </p>

          {/* Buttons — primary focus */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button
              href={COMPANY.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              variant="primary"
              className="w-full sm:w-auto px-8 hover-lift hover-shadow"
              onClick={handleWhatsappClick}
            >
              <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true" />
              {hero.primaryCta}
              <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>

            {isCalendlyEnabled ? (
              <Button
                href={CALENDLY_CONFIG.url}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                variant="outline-light"
                className="w-full sm:w-auto px-8"
                onClick={handleCalendlyClick}
              >
                <Calendar className="mr-2 h-5 w-5" aria-hidden="true" />
                {hero.secondaryCta}
              </Button>
            ) : (
              <Button
                href="#use-cases"
                size="lg"
                variant="outline-light"
                className="w-full sm:w-auto px-8"
                onClick={handleCalendlyClick}
              >
                <ArrowRight className="mr-2 h-5 w-5" aria-hidden="true" />
                {hero.secondaryCta}
              </Button>
            )}
          </div>

          {/* Trust Indicators — premium social proof */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-white/10 max-w-2xl mx-auto">
            {hero.trustIndicators.map((indicator, index) => {
              const icons = [Code, Layers, Cpu];
              const IconComponent = icons[index % icons.length];
              return (
                <div key={index} className="flex flex-col items-center gap-2.5 animate-stagger" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                  <div className="p-2.5 rounded-lg bg-secondary/15 text-secondary border border-secondary/20 transition-all duration-300 hover:bg-secondary/25 hover:scale-110" aria-hidden="true">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-white/80 tracking-wide uppercase">
                    {indicator.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
