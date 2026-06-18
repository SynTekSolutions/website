"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { FAQ_CONTENT } from "@/content/faq";
import { Button } from "@/components/ui/Button";
import { COMPANY } from "@/config/company";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQSection = () => {
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

        {/* FAQ Items — shadcn Accordion */}
        <div className="mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Accordion type="single" collapsible className="space-y-2.5">
            {FAQ_CONTENT.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl border border-gray-200 shadow-premium overflow-hidden transition-[border-color,box-shadow,background-color] duration-300 hover:border-secondary/20 hover:shadow-premium-hover relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3.5px] before:bg-secondary before:scale-y-0 data-[state=open]:before:scale-y-100 before:transition-transform before:duration-300 before:origin-center data-[state=open]:border-secondary/20 data-[state=open]:shadow-md data-[state=open]:bg-slate-50/10"
                style={{
                  animation: `stagger 0.5s ease-out ${0.1 + index * 0.08}s both`,
                }}
              >
                <AccordionTrigger className="group px-5 py-3.5 font-heading font-semibold text-dark hover:text-secondary transition-colors duration-200 text-left data-[state=open]:text-secondary">
                  <span className="text-base sm:text-[17px] leading-snug transition-transform duration-200 group-hover:translate-x-0.5 inline-block pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 pt-0 bg-gray-50/30 border-t border-gray-100">
                  <p className="text-text-muted text-sm leading-relaxed pt-3">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
