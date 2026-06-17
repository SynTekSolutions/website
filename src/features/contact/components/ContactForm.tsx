"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { SERVICES } from "@/content/services";
import { Button } from "@/components/ui/Button";
import { contactSchema, ContactFormData } from "../validations/contact.schema";
import { ContactService } from "../services/contact.service";
import { AnalyticsService } from "@/lib/analytics/analytics.service";
import { COMPANY } from "@/config/company";

export const ContactForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      serviceOfInterest: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setErrorMessage(null);
    try {
      const response = await ContactService.submitForm(data);
      if (response.success) {
        setIsSuccess(true);
        AnalyticsService.trackEvent("contact_form_submitted", {
          service: data.serviceOfInterest,
          company: data.company,
        });
        reset();
      } else {
        setErrorMessage(response.message);
      }
    } catch {
      setErrorMessage(`Ocurrió un error. Escríbenos a ${COMPANY.email}`);
    }
  };

  if (isSuccess) {
    return (
      <div 
        className="bg-white p-8 md:p-10 rounded-2xl shadow-premium border border-gray-200 text-center max-w-xl mx-auto animate-fade-in-up"
        role="status"
        aria-live="polite"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-6 animate-scale-in" aria-hidden="true">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-heading font-bold text-2xl text-dark mb-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          ¡Mensaje Enviado!
        </h3>
        <p className="text-text-muted text-base leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Gracias por contactarnos. Un Ingeniero Senior evaluará tu requerimiento y se comunicará en menos de 24 horas.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="mx-auto hover-lift hover-shadow animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          Enviar Otro Mensaje
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-premium border border-gray-200 max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h3 className="font-heading font-bold text-2xl text-dark mb-2">
          Iniciemos tu Proyecto
        </h3>
        <p className="text-text-muted text-base">
          Completa este formulario y un especialista se comunicará contigo para detallar la propuesta técnica.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {errorMessage && (
          <div 
            className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100 text-sm animate-fade-in-up"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-dark">
              Nombre Completo <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`w-full px-4 py-3 rounded-lg border text-text bg-white transition-all duration-200 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 ${
                errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 hover:border-gray-300"
              }`}
              {...register("name")}
            />
            {errors.name && (
              <span id="name-error" className="text-xs text-red-600 font-medium" role="alert">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-dark">
              Correo de Contacto <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="juan@empresa.com"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full px-4 py-3 rounded-lg border text-text bg-white transition-all duration-200 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 ${
                errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 hover:border-gray-300"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <span id="email-error" className="text-xs text-red-600 font-medium" role="alert">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Company & Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-col gap-2">
            <label htmlFor="company" className="text-sm font-semibold text-dark">
              Empresa <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="company"
              type="text"
              placeholder="Acme Corp"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={errors.company ? "true" : "false"}
              aria-describedby={errors.company ? "company-error" : undefined}
              className={`w-full px-4 py-3 rounded-lg border text-text bg-white transition-all duration-200 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 ${
                errors.company ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 hover:border-gray-300"
              }`}
              {...register("company")}
            />
            {errors.company && (
              <span id="company-error" className="text-xs text-red-600 font-medium" role="alert">
                {errors.company.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="serviceOfInterest" className="text-sm font-semibold text-dark">
              Servicio de Interés <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="serviceOfInterest"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={errors.serviceOfInterest ? "true" : "false"}
              aria-describedby={errors.serviceOfInterest ? "service-error" : undefined}
              className={`w-full px-4 py-3 rounded-lg border text-text bg-white transition-all duration-200 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 ${
                errors.serviceOfInterest ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 hover:border-gray-300"
              }`}
              {...register("serviceOfInterest")}
            >
              <option value="">Selecciona un servicio...</option>
              {SERVICES.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
              <option value="other">Otro requerimiento</option>
            </select>
            {errors.serviceOfInterest && (
              <span id="service-error" className="text-xs text-red-600 font-medium" role="alert">
                {errors.serviceOfInterest.message}
              </span>
            )}
          </div>
        </div>

        {/* Full-width Message */}
        <div className="flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <label htmlFor="message" className="text-sm font-semibold text-dark">
            Detalles del Proyecto <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="Describe brevemente tu objetivo, el alcance y plazo..."
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`w-full px-4 py-3 rounded-lg border text-text bg-white transition-all duration-200 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none ${
              errors.message ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 hover:border-gray-300"
            }`}
            {...register("message")}
          />
          {errors.message && (
            <span id="message-error" className="text-xs text-red-600 font-medium" role="alert">
              {errors.message.message}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full justify-center py-3 text-base hover-lift hover-shadow animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
          ariaLabel={isSubmitting ? "Enviando..." : "Enviar consulta"}
        >
          {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
        </Button>
      </form>
    </div>
  );
};
