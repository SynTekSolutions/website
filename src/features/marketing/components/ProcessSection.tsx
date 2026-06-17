import React from "react";
import { HOME_CONTENT } from "@/content/home";

export const ProcessSection = () => {
  const { process } = HOME_CONTENT;

  return (
    <section id="process" className="bg-dark min-h-screen flex flex-col justify-center py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mb-4">
            {process.title}
          </h2>
          <p className="text-white/60 text-base sm:text-lg">
            {process.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connecting line for desktop layout */}
          <div className="hidden lg:block absolute top-1/2 left-1/8 right-1/8 h-0.5 bg-white/10 -translate-y-12 z-0 animate-fade-in" aria-hidden="true" />

          {process.steps.map((item, index) => (
            <div key={index} className="relative z-10 flex flex-col group animate-stagger hover-shadow" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
              {/* Step number badge */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/15 text-secondary font-heading font-bold text-xl mb-6 border border-secondary/20 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                {item.step}
              </div>

              {/* Title */}
              <h3 className="font-heading font-bold text-lg text-white mb-3">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-white/50 text-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
