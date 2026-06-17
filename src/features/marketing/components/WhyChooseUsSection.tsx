import React from "react";
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

  return (
    <section id="why-choose-us" className="bg-muted min-h-screen flex flex-col justify-center py-24 border-y border-muted-darker scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Intro Column */}
          <div className="lg:col-span-5 animate-fade-in-up">
            <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-4 block">
              {whyUs.badge}
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-dark mb-6 leading-tight">
              {whyUs.title}
            </h2>
            <p className="text-text-muted leading-relaxed mb-8 text-sm sm:text-base">
              {whyUs.description}
            </p>
            <div className="flex gap-8 border-t border-muted-darker pt-8">
              {whyUs.stats.map((stat, index) => (
                <div key={index}>
                  <span className="block font-heading font-bold text-3xl text-dark">{stat.value}</span>
                  <span className="text-xs font-bold text-text-muted tracking-wider uppercase">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Strengths List */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {whyUs.strengths.map((item, index) => {
              const IconComponent = iconMap[index] || Shield;
              return (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-premium animate-stagger hover-shadow" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                  <div className="inline-flex items-center justify-center p-2.5 rounded-lg bg-muted text-secondary mb-4 transition-all duration-300 hover:bg-secondary/20 hover:scale-110" aria-hidden="true">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-text-muted text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
