"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const AdminNavbar = () => {
  return (
    <div className="sticky top-0 z-40 w-full bg-dark/95 backdrop-blur-lg border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2" aria-label="Volver al inicio">
              <Image
                src="/logo-horizontal.png"
                alt={`${siteConfig.name} Logo`}
                width={200}
                height={48}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Admin Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-secondary tracking-widest uppercase px-3 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full">
              Consola Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
