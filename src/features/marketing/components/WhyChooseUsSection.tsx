"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Code2, Users } from "lucide-react";
import { HOME_CONTENT } from "@/content/home";

const iconMap: Record<number, React.ComponentType<{ className?: string }>> = {
  0: Users,
  1: Code2,
  2: Shield,
  3: Zap,
};

export const WhyChooseUsSection = () => {
  const { whyUs } = HOME_CONTENT;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="why-choose-us" className="bg-muted min-h-screen flex flex-col justify-center py-16 sm:py-24 border-y border-muted-darker scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Intro Column */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-4 block">
              {whyUs.badge}
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-dark mb-4 sm:mb-6 leading-tight">
              {whyUs.title}
            </h2>
            <p className="text-text-muted leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              {whyUs.description}
            </p>
            <motion.div 
              className="flex flex-wrap gap-4 sm:gap-8 border-t border-muted-darker pt-6 sm:pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              {whyUs.stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className="block font-heading font-bold text-2xl sm:text-3xl text-dark">{stat.value}</span>
                  <span className="text-xs font-bold text-text-muted tracking-wider uppercase">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Strengths List */}
          <motion.div 
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {whyUs.strengths.map((item, index) => {
              const IconComponent = iconMap[index] || Shield;
              return (
                <motion.div
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ 
                    y: -6,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white p-5 sm:p-6 lg:p-7 rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                >
                  <motion.div 
                    className="inline-flex items-center justify-center p-2.5 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 text-secondary mb-4 transition-all duration-300" 
                    aria-hidden="true"
                    whileHover={{ 
                      scale: 1.15,
                      rotate: 10,
                      backgroundColor: "rgba(var(--secondary-rgb), 0.2)"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-lg text-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
