import React from "react";
import { HeroSection } from "@/features/marketing/components/HeroSection";
import { ServicesSection } from "@/features/marketing/components/ServicesSection";
import { UseCasesSection } from "@/features/marketing/components/UseCasesSection";
import { WhyChooseUsSection } from "@/features/marketing/components/WhyChooseUsSection";
import { ProcessSection } from "@/features/marketing/components/ProcessSection";
import { FAQSection } from "@/features/marketing/components/FAQSection";
import { CTASection } from "@/features/marketing/components/CTASection";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { getOrgSchemaJsonLd } from "@/config/metadata";

export default function Home() {
  const orgSchema = getOrgSchemaJsonLd();

  return (
    <>
      {/* Organization Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* Hero section */}
      <HeroSection />

      {/* Services Section with secondary CTAs */}
      <ServicesSection />

      {/* Use Cases Section with secondary CTAs */}
      <UseCasesSection />

      {/* Value Proposition */}
      <WhyChooseUsSection />

      {/* Delivery Methodology */}
      <ProcessSection />

      {/* Accordion FAQ */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* Contact Form Section */}
      <section id="contact" className="min-h-screen flex flex-col justify-center bg-dark py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-4 block">
              Contacto Directo
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-6">
              Agenda tu Sesión Técnica
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Completa el formulario y un Arquitecto de Software Senior evaluará tu proyecto para estructurar una propuesta a medida.
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>
    </>
  );
}
