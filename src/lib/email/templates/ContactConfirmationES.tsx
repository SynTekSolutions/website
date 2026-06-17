import * as React from "react";
import { Heading, Link, Section, Text, Hr } from "react-email";
import { EmailLayout } from "./EmailLayout";
import { formatLeadDate } from "../helpers/format-lead-date";
import { COMPANY } from "@/config/company";
import type { LeadPayload } from "@/lib/notifications/channels/notification-channel.interface";

/**
 * Email de confirmación al cliente — sufijo ES para i18n.
 * Cuando exista ContactConfirmationEN, ambos coexisten sin romper nada.
 */
type ContactConfirmationESProps = Pick<
  LeadPayload,
  "id" | "name" | "company" | "serviceOfInterest" | "createdAt"
>;

export function ContactConfirmationES({
  id,
  name,
  company,
  serviceOfInterest,
  createdAt,
}: ContactConfirmationESProps) {
  const shortId = id.slice(0, 8);
  const firstName = name.split(" ")[0];

  return (
    <EmailLayout preview={`Hemos recibido tu solicitud, ${firstName}. Te contactaremos en menos de 24 horas.`}>

      {/* ── Saludo ── */}
      <Heading style={styles.heading}>
        Hola {firstName},
      </Heading>
      <Text style={styles.intro}>
        Gracias por contactar a <strong>Syntek Solutions</strong>. Hemos recibido
        tu solicitud correctamente.
      </Text>
      <Text style={styles.body}>
        En las próximas <strong>24 horas</strong> un Arquitecto de Software
        revisará tu requerimiento y se pondrá en contacto contigo para
        discutir los detalles de tu proyecto.
      </Text>

      {/* ── Resumen ── */}
      <Section style={styles.summary}>
        <Text style={styles.summaryTitle}>RESUMEN DE TU SOLICITUD</Text>
        <Hr style={styles.summaryDivider} />

        <SummaryRow label="Número de solicitud" value={`#${shortId}`} highlight />
        <SummaryRow label="Servicio solicitado" value={serviceOfInterest} />
        <SummaryRow label="Empresa" value={company} />
        <SummaryRow label="Fecha de recepción" value={formatLeadDate(createdAt)} />
      </Section>

      {/* ── CTAs ── */}
      <Text style={styles.ctaIntro}>Mientras tanto, puedes:</Text>

      <Section style={styles.ctaSection}>
        {COMPANY.calendlyUrl && (
          <Link href={COMPANY.calendlyUrl} style={styles.ctaPrimary}>
            Agendar una reunión →
          </Link>
        )}
        {COMPANY.whatsappUrl && (
          <Link href={COMPANY.whatsappUrl} style={styles.ctaSecondary}>
            Escribirnos por WhatsApp
          </Link>
        )}
      </Section>

      {/* ── Cierre ── */}
      <Text style={styles.closing}>
        Saludos,
        <br />
        <strong>Equipo Syntek Solutions</strong>
      </Text>

    </EmailLayout>
  );
}

// ─── Sub-componente ───────────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Section style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={highlight ? styles.summaryValueHighlight : styles.summaryValue}>
        {value}
      </Text>
    </Section>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  heading: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 16px",
  } as React.CSSProperties,

  intro: {
    color: "#cccccc",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 12px",
  } as React.CSSProperties,

  body: {
    color: "#aaaaaa",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 28px",
  } as React.CSSProperties,

  summary: {
    backgroundColor: "#161616",
    border: "1px solid #222222",
    borderRadius: "6px",
    marginBottom: "24px",
    padding: "20px 24px",
  } as React.CSSProperties,

  summaryTitle: {
    color: "#666666",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    margin: "0 0 12px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,

  summaryDivider: {
    borderColor: "#222222",
    margin: "0 0 16px",
  } as React.CSSProperties,

  summaryRow: {
    marginBottom: "10px",
  } as React.CSSProperties,

  summaryLabel: {
    color: "#666666",
    fontSize: "11px",
    fontWeight: "500",
    letterSpacing: "0.04em",
    margin: "0 0 2px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,

  summaryValue: {
    color: "#dddddd",
    fontSize: "14px",
    margin: "0",
  } as React.CSSProperties,

  summaryValueHighlight: {
    color: "#00F0FF",
    fontFamily: "monospace",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0",
  } as React.CSSProperties,

  ctaIntro: {
    color: "#888888",
    fontSize: "13px",
    margin: "0 0 16px",
  } as React.CSSProperties,

  ctaSection: {
    marginBottom: "28px",
  } as React.CSSProperties,

  ctaPrimary: {
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

  ctaSecondary: {
    color: "#888888",
    fontSize: "13px",
    textDecoration: "none",
  } as React.CSSProperties,

  closing: {
    borderTop: "1px solid #1e1e1e",
    color: "#aaaaaa",
    fontSize: "14px",
    lineHeight: "1.8",
    marginTop: "28px",
    paddingTop: "20px",
  } as React.CSSProperties,
};
