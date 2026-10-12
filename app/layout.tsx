import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/DataContext";
import PasscodeGate from "@/components/PasscodeGate";
import AppShell from "@/components/AppShell";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://momentum-habits.vercel.app"),
  title: {
    default: "Momentum — Privacy-First Habit Tracker",
    template: "%s | Momentum",
  },
  description:
    "A calm, privacy-first habit tracker that keeps your data 100% on your device. Track daily routines, streaks, milestones, notes, and analytics with zero cloud accounts.",
  keywords: [
    "habit tracker",
    "privacy-first habit tracker",
    "local-first",
    "offline habits",
    "streak tracker",
    "productivity dashboard",
    "Next.js PWA",
    "self-hosted habit tracker",
  ],
  authors: [{ name: "Memoona" }],
  creator: "Memoona",
  publisher: "Momentum",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Momentum — Privacy-First Habit Tracker",
    description:
      "Build better routines without compromising your privacy. 100% local-first habit tracking with streak analytics, widgets, and account-free device sync.",
    url: "https://momentum-habits.vercel.app",
    siteName: "Momentum",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentum — Privacy-First Habit Tracker",
    description:
      "A quiet, distraction-free habit tracker stored entirely in your browser. Zero logins, zero telemetry.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Momentum",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Momentum Habit Tracker",
  url: "https://momentum-habits.vercel.app",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "All",
  description:
    "A privacy-first, local-only habit tracking application built with Next.js and Tailwind CSS.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "100% local-first storage without server logins",
    "Streak heatmaps & milestone badges",
    "Device-to-device smart merge sync",
    "PWA offline installable support",
    "Privacy passcode lock gate",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <noscript>
          <div style={{ padding: "2rem", background: "#0c0e12", color: "#f3ede2", fontFamily: "sans-serif", maxWidth: "640px", margin: "2rem auto", borderRadius: "12px", border: "1px solid #262b35" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", color: "#d4af37" }}>Momentum — Habit Tracker</h1>
            <p style={{ lineHeight: "1.6", marginBottom: "1rem", color: "#9ca3af" }}>
              Momentum is a local-first, privacy-focused habit tracking dashboard. All your habits, streaks, and analytics stay securely in your browser with zero remote database dependencies.
            </p>
            <p style={{ lineHeight: "1.6", color: "#e5e7eb" }}>
              Please enable JavaScript in your browser to access the interactive dashboard, streak heatmaps, and habit logging tools.
            </p>
          </div>
        </noscript>
        <DataProvider>
          <PasscodeGate>
            <AppShell>{children}</AppShell>
          </PasscodeGate>
        </DataProvider>
      </body>
    </html>
  );
}
