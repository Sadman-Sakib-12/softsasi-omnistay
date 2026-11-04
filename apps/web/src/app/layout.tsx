import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { AiConciergeChat } from "@/components/ai/ai-concierge-chat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "OmniStay 360 | Luxury Hospitality & Travel Marketplace",
  description:
    "Book luxury hotels, private yacht charters, executive fleets, safari expeditions, and banquet spaces with unified one-click checkout.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-sky-500 selection:text-white overflow-x-hidden">
        <Providers>
          <PublicHeader />
          <main className="flex-1 overflow-x-hidden">{children}</main>
          <PublicFooter />
          <AiConciergeChat />
        </Providers>
      </body>
    </html>
  );
}
