"use client";

import React, { useState } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import { FAQ_CONTENT } from "@/content/faq";
import { Button } from "@/components/ui/Button";
import { COMPANY } from "@/config/company";

export const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-white min-h-screen flex flex-col justify-center py-24 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — premium */}
        <div className="text-center mb-20 animate-fade-in-up">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-4 block">
            Preguntas Frecuentes
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-dark mb-6">
            Todo lo que necesitas saber
          </h2>
          <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Respuestas claras sobre nuestros servicios, procesos y compromisos empresariales.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 mb-16">
          {FAQ_CONTENT.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-premium overflow-hidden transition-all duration-300 hover:border-secondary/20 hover:shadow-premium-hover animate-stagger hover-shadow"
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left font-heading font-bold text-dark hover:text-secondary focus:outline-none transition-colors duration-200"
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${index}`}
                >
                  <span className="text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-secondary flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-content-${index}`}
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
                    <p className="text-text-muted text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary CTA */}
        <div className="bg-muted rounded-2xl border border-gray-200 p-8 text-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <h4 className="font-heading font-bold text-lg text-dark mb-2">
            ¿No encuentras respuesta?
          </h4>
          <p className="text-text-muted text-sm mb-6">
            Nuestro equipo está disponible para responder cualquier consulta adicional.
          </p>
          <Button
            href={COMPANY.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="md"
            className="hover-lift hover-shadow"
          >
            <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
            Contactar al Equipo
          </Button>
        </div>
      </div>
    </section>
  );
};
