import * as React from "react";
import { Heading, Link, Row, Column, Section, Text } from "react-email";
import { EmailLayout } from "./EmailLayout";
import { formatLeadDate } from "../helpers/format-lead-date";
import type { LeadPayload } from "@/lib/notifications/channels/notification-channel.interface";

type ContactNotificationProps = LeadPayload;

const supabaseUrl = `https://supabase.com/dashboard/project/vdsdnunywmbhatolgwua/editor`;

export function ContactNotification({
  id,
  name,
  email,
  phone,
  company,
  serviceOfInterest,
  message,
  createdAt,
  status,
  origin,
}: ContactNotificationProps) {
  const shortId = id.slice(0, 8);

  return (
    <EmailLayout preview={`Nuevo lead de ${name} @ ${company}`}>

      {/* ── Encabezado ── */}
      <Heading style={styles.heading}>
        🔔 Nuevo Lead <span style={styles.badge}>#{shortId}</span>
      </Heading>
      <Text style={styles.subtitle}>
        Recibido el {formatLeadDate(createdAt)} · Origen: <strong>{origin}</strong>
      </Text>

      {/* ── Datos del contacto ── */}
      <Section style={styles.card}>
        <Heading as="h2" style={styles.cardTitle}>Información del contacto</Heading>

        <DataRow label="Nombre" value={name} />
        <DataRow label="Email" value={email} isEmail />
        <DataRow label="Teléfono" value={phone ?? "—"} />
        <DataRow label="Empresa" value={company} />
        <DataRow label="Servicio" value={serviceOfInterest} />
        <DataRow label="Estado" value={status} />
      </Section>

      {/* ── Mensaje ── */}
      <Section style={styles.card}>
        <Heading as="h2" style={styles.cardTitle}>Detalles del proyecto</Heading>
        <Text style={styles.messageText}>{message}</Text>
      </Section>

      {/* ── Links de acción ── */}
      <Section style={styles.actions}>
        <Link href={supabaseUrl} style={styles.actionButton}>
          Ver en Supabase →
        </Link>
        <Link href={`mailto:${email}`} style={styles.actionLinkSecondary}>
          Responder al lead
        </Link>
      </Section>

      {/* ── ID completo para trazabilidad ── */}
      <Text style={styles.uuidLine}>
        UUID completo: <span style={styles.uuid}>{id}</span>
      </Text>

    </EmailLayout>
  );
}

// ─── Sub-componente ───────────────────────────────────────────────────────────
function DataRow({
  label,
  value,
  isEmail = false,
}: {
  label: string;
  value: string;
  isEmail?: boolean;
}) {
  return (
    <Row style={styles.dataRow}>
      <Column style={styles.dataLabel}>{label}</Column>
      <Column style={styles.dataValue}>
        {isEmail ? (
          <Link href={`mailto:${value}`} style={styles.emailLink}>{value}</Link>
        ) : (
          value
        )}
      </Column>
    </Row>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  heading: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 8px",
  } as React.CSSProperties,

  badge: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333333",
    borderRadius: "4px",
    color: "#00F0FF",
    fontSize: "14px",
    fontWeight: "500",
    padding: "2px 8px",
  } as React.CSSProperties,

  subtitle: {
    color: "#888888",
    fontSize: "13px",
    margin: "0 0 24px",
  } as React.CSSProperties,

  card: {
    backgroundColor: "#161616",
    border: "1px solid #222222",
    borderRadius: "6px",
    marginBottom: "16px",
    padding: "20px 24px",
  } as React.CSSProperties,

  cardTitle: {
    color: "#aaaaaa",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    margin: "0 0 16px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,

  dataRow: {
    borderBottom: "1px solid #1e1e1e",
    padding: "8px 0",
  } as React.CSSProperties,

  dataLabel: {
    color: "#666666",
    fontSize: "13px",
    fontWeight: "500",
    width: "120px",
  } as React.CSSProperties,

  dataValue: {
    color: "#dddddd",
    fontSize: "13px",
  } as React.CSSProperties,

  emailLink: {
    color: "#00F0FF",
    textDecoration: "none",
  } as React.CSSProperties,

  messageText: {
    color: "#cccccc",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0",
    whiteSpace: "pre-wrap" as const,
  } as React.CSSProperties,

  actions: {
    marginTop: "24px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  actionButton: {
    backgroundColor: "#00F0FF",
    borderRadius: "6px",
    color: "#000000",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600",
    marginRight: "12px",
    padding: "10px 20px",
    textDecoration: "none",
  } as React.CSSProperties,

  actionLinkSecondary: {
    color: "#888888",
    fontSize: "13px",
    textDecoration: "none",
  } as React.CSSProperties,

  uuidLine: {
    borderTop: "1px solid #1e1e1e",
    color: "#444444",
    fontSize: "11px",
    marginTop: "24px",
    paddingTop: "16px",
  } as React.CSSProperties,

  uuid: {
    fontFamily: "monospace",
    fontSize: "10px",
  } as React.CSSProperties,
};
