import { Metadata } from "next";
import { siteConfig } from "./site";
import { COMPANY } from "./company";

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    alternates: {
      canonical: siteConfig.url,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          alt: title,
        },
      ],
      type: "website",
      siteName: siteConfig.name,
      locale: "es_LA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    metadataBase: new URL(siteConfig.url),
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        { rel: "manifest", url: "/site.webmanifest" },
      ],
    },
  };
}

export function getOrgSchemaJsonLd() {
  const sameAs: string[] = [];
  if (COMPANY.linkedinUrl) sameAs.push(COMPANY.linkedinUrl);
  if (COMPANY.githubUrl) sameAs.push(COMPANY.githubUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": COMPANY.name,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo.png`,
    "email": COMPANY.email,
    "telephone": COMPANY.phone,
    "sameAs": sameAs,
  };
}
