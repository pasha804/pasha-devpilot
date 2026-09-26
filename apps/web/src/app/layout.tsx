import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientShell } from "@/components/ClientShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Pasha DevPilot — Your AI Software Engineer",
  description:
    "Understand. Plan. Build. Verify. Ship. Autonomous AI software engineering platform.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full bg-[#070b14] text-slate-100 antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
