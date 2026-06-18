"use client";

import React from "react";
import { motion } from "framer-motion";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="services" className="bg-dark-muted min-h-screen flex flex-col justify-center py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — premium */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-4 block">
            Servicios Especializados
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-6">
            Soluciones tecnológicas de nivel empresarial
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Ofrecemos ingeniería de software de primer nivel, diseñando soluciones robustas que optimizan operaciones y potencian el crecimiento comercial.
          </p>
        </motion.div>

        {/* Services Grid — premium cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {SERVICES.map((service) => {
            const IconComponent = iconMap[service.iconName] || Code;
            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{ 
                  y: -8,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group bg-white/5 border border-white/10 rounded-2xl p-8 shadow-premium hover:shadow-2xl hover:border-secondary/30 hover:bg-white/8 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Icon wrapper — premium style */}
                <motion.div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10 text-secondary mb-6 group-hover:bg-secondary group-hover:text-white transition-all duration-300" 
                  aria-hidden="true"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <IconComponent className="w-7 h-7" />
                </motion.div>

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
                    <motion.li 
                      key={index} 
                      className="flex items-center gap-3 text-xs font-medium text-white/80"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" aria-hidden="true" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {/* Link/CTA */}
                <motion.a
                  href="#contact"
                  onClick={() => handleServiceClick(service.id)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors duration-200 mt-auto group/link"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  Cotizar Servicio
                  <motion.span
                    className="inline-block"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </motion.span>
                </motion.a>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section — premium card */}
        <motion.div 
          className="bg-gradient-to-br from-dark to-dark/95 rounded-3xl p-10 md:p-16 text-center shadow-premium overflow-hidden relative animate-fade-in-up"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          whileHover={{ boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)" }}
        >
          {/* Subtle background accent */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.h4 
              className="font-heading font-bold text-2xl text-white mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              ¿Tienes un requerimiento a medida?
            </motion.h4>
            <motion.p 
              className="text-gray-300 text-base mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
            >
              Escríbenos directamente y un Ingeniero Senior evaluará tus necesidades para estructurar una propuesta técnica adaptada.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  href="#contact"
                  variant="outline-light"
                  size="lg"
                  className="hover-lift"
                >
                  Enviar Requerimiento
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
