import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeInitializer } from "@/components/theme-initializer";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDR Intelligence Engine — Turn Calls Into Closable Deals",
  description:
    "Free AI-powered sales call analyzer. Paste any sales transcript and instantly extract objections, competitors, CRM-ready summaries, action plans, and personalized follow-up emails.",
  keywords: [
    "SDR",
    "sales development",
    "call analysis",
    "sales intelligence",
    "CRM",
    "follow-up email",
    "AI sales assistant",
    "objection handling",
  ],
  authors: [{ name: "SDR Intelligence Engine" }],
  openGraph: {
    title: "SDR Intelligence Engine — Turn Calls Into Closable Deals",
    description:
      "Free AI-powered sales call analyzer. Paste any transcript to extract objections, CRM summaries, action plans, and personalized follow-ups in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SDR Intelligence Engine",
    description: "Turn sales calls into closable deals. Free AI analysis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          <ThemeInitializer />
          {children}
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
