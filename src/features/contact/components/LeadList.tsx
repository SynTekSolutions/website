import React from "react";
import { motion } from "framer-motion";
import { LeadListItemDTO } from "../types";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { formatLeadDate } from "@/lib/email/helpers/format-lead-date";

interface LeadListProps {
  leads: LeadListItemDTO[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const LeadList = ({ leads, selectedId, onSelect }: LeadListProps) => {
  if (leads.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center p-12 text-center bg-dark-muted/20 border border-white/5 rounded-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.svg
          className="w-12 h-12 text-slate-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </motion.svg>
        <p className="text-slate-400 font-medium">No se encontraron leads</p>
        <p className="text-slate-500 text-sm mt-1">
          Prueba ajustando los filtros o realizando otra búsqueda.
        </p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.ul 
      className="space-y-3" 
      role="list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {leads.map((lead) => {
        const isSelected = lead.id === selectedId;
        return (
          <motion.li key={lead.id} variants={itemVariants}>
            <motion.button
              onClick={() => onSelect(lead.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2 ${
                isSelected
                  ? "bg-secondary/10 border-secondary shadow-md shadow-secondary/5"
                  : "bg-dark-muted/10 border-white/5 hover:border-white/10 hover:bg-dark-muted/20"
              }`}
              aria-pressed={isSelected}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-start justify-between gap-4 w-full">
                <div className="min-w-0">
                  <h3 className="text-slate-100 font-semibold truncate text-sm sm:text-base">
                    {lead.name}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm truncate">
                    {lead.company}
                  </p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <LeadStatusBadge status={lead.status} />
                </motion.div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 w-full mt-1 border-t border-white/5 pt-2">
                <span className="truncate max-w-[180px]">
                  {lead.service}
                </span>
                <time suppressHydrationWarning dateTime={typeof lead.created_at === 'string' ? lead.created_at : new Date(lead.created_at).toISOString()}>
                  {formatLeadDate(lead.created_at)}
                </time>
              </div>
            </motion.button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
};
