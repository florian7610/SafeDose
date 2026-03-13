import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { AppStateProvider } from "@/components/providers/app-state-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeDose",
  description: "Medication safety dashboard for tracking, adherence, and interaction review",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${playfair.variable}`}>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
