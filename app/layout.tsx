import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { getSiteBaseUrl } from "@/lib/site-url";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const title = "Diet Tracker";
const description = "Registre suas escapadas da dieta e exercícios";

function metadataBase(): URL | undefined {
  try {
    return new URL(getSiteBaseUrl());
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title,
  description,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${nunito.variable} h-full`}
      style={{ colorScheme: "light" }}
    >
      <body className="flex h-full justify-center">
        <a
          href="#main-content"
          className="fixed left-4 top-0 z-[100] translate-y-[-120%] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md outline-none transition-transform duration-200 focus-visible:translate-y-4 focus-visible:ring-2 focus-visible:ring-ring"
        >
          Ir para o conteúdo principal
        </a>
        <div className="relative flex h-full w-full max-w-sm flex-col bg-background shadow-sm">
          {children}
        </div>
      </body>
    </html>
  );
}
