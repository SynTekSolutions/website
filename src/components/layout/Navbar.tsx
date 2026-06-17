"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { MAIN_NAV_ITEMS } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "../ui/Button";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section based on scroll offset
      const sections = MAIN_NAV_ITEMS.map((item) => item.href.replace("#", ""));
      const scrollPosition = window.scrollY + 120; // offset for early highlighting

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(`#${section}`);
            return;
          }
        }
      }
      
      // Clear highlight if near the top
      if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on load
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "top-3 left-4 right-4 mx-auto max-w-7xl rounded-2xl bg-dark/80 backdrop-blur-xl border border-white/10 shadow-2xl"
          : "bg-transparent backdrop-blur-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#" className="flex items-center gap-2" aria-label="Volver al inicio">
              <Image
                src="/logo-horizontal.png"
                alt={`${siteConfig.name} Logo`}
                width={200}
                height={48}
                className="h-9 w-auto object-contain"
                priority
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center" aria-label="Navegación principal">
           {MAIN_NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
               className={`font-medium transition-all duration-300 relative group ${
                  activeSection === item.href
                    ? "text-secondary font-bold"
                    : scrolled
                      ? "text-white/70 hover:text-white"
                      : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
               <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-secondary to-transparent transition-all duration-300 ${
                 activeSection === item.href ? "w-full" : "w-0 group-hover:w-full"
               }`} />
             </a>
           ))}
            <Button
              href="#contact"
              size="sm"
              variant="primary"
              ariaLabel="Ir al formulario de contacto para iniciar tu proyecto"
              className="hover-lift hover-shadow"
            >
              Hablemos de tu Proyecto
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-secondary focus:outline-none p-2"
              aria-label="Abrir menú de navegación"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-96 opacity-100 border-b border-white/10 bg-dark/90 backdrop-blur-xl" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-3">
          {MAIN_NAV_ITEMS.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 font-medium transition-all duration-300 rounded-lg ${
                activeSection === item.href
                  ? "text-secondary font-bold bg-secondary/10"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
              style={{
                animation: isOpen ? `slideInUp 0.5s ease-out ${index * 0.05}s both` : "none"
              }}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 px-3">
            <Button
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="w-full hover-lift hover-shadow"
              variant="primary"
            >
              Hablemos de tu Proyecto
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
