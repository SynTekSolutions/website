import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";
import { COMPANY } from "@/config/company";

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://syntek.solutions";

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  // En desarrollo local (localhost), los servidores de Gmail no pueden acceder a tu puerto 3000.
  // Usamos el fallback de GitHub para que la imagen renderice correctamente en pruebas locales.
  const logoSrc = isLocalhost
    ? "https://raw.githubusercontent.com/SynTekSolutions/website/main/public/logo-horizontal.png"
    : `${baseUrl}/logo-horizontal.png`;

  return (
    <Html lang="es">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* ── Header / Logo ── */}
          <Section style={styles.header}>
            <Img
              src={logoSrc}
              alt="Syntek Solutions"
              width={160}
              style={styles.logo}
            />
          </Section>

          <Hr style={styles.divider} />

          {/* ── Contenido del email ── */}
          <Section style={styles.content}>
            {children}
          </Section>

          <Hr style={styles.divider} />

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Text style={styles.footerCompany}>{COMPANY.name}</Text>
            <Text style={styles.footerLinks}>
              <Link href={baseUrl} style={styles.footerLink}>Website</Link>
              {COMPANY.linkedinUrl && (
                <> &nbsp;·&nbsp; <Link href={COMPANY.linkedinUrl} style={styles.footerLink}>LinkedIn</Link></>
              )}
              {COMPANY.whatsappUrl && (
                <> &nbsp;·&nbsp; <Link href={COMPANY.whatsappUrl} style={styles.footerLink}>WhatsApp</Link></>
              )}
            </Text>
            <Text style={styles.copyright}>
              © {new Date().getFullYear()} {COMPANY.name}. Todos los derechos reservados.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  body: {
    backgroundColor: "#0a0a0a",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: "0",
    padding: "0",
  } as React.CSSProperties,

  container: {
    backgroundColor: "#111111",
    border: "1px solid #222222",
    borderRadius: "8px",
    margin: "40px auto",
    maxWidth: "600px",
    padding: "0",
  } as React.CSSProperties,

  header: {
    padding: "28px 40px 24px",
  } as React.CSSProperties,

  logo: {
    display: "block",
  } as React.CSSProperties,

  divider: {
    borderColor: "#222222",
    borderTopWidth: "1px",
    margin: "0",
  } as React.CSSProperties,

  content: {
    padding: "32px 40px",
  } as React.CSSProperties,

  footer: {
    padding: "24px 40px 28px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  footerCompany: {
    color: "#666666",
    fontSize: "13px",
    fontWeight: "600",
    margin: "0 0 8px",
  } as React.CSSProperties,

  footerLinks: {
    color: "#555555",
    fontSize: "12px",
    margin: "0 0 12px",
  } as React.CSSProperties,

  footerLink: {
    color: "#555555",
    textDecoration: "none",
  } as React.CSSProperties,

  copyright: {
    color: "#444444",
    fontSize: "11px",
    margin: "0",
  } as React.CSSProperties,
};
