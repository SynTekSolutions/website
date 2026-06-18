import React from "react";
import { LeadStatus } from "@/lib/notifications/channels/notification-channel.interface";
import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_CONFIG } from "../config/status-config";

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const statusVariantMap: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  qualified: "secondary",
  contacted: "outline",
  proposal: "secondary",
  won: "default",
  lost: "destructive",
  closed: "outline",
};

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const config = LEAD_STATUS_CONFIG[status];
  const variant = statusVariantMap[status] || "outline";
  
  if (!config) return null;

  return (
    <Badge variant={variant} role="status">
      {config.label}
    </Badge>
  );
};
