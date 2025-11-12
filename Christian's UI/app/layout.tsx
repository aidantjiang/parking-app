import "./globals.css";
import { ReactNode } from "react";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const display = Playfair_Display({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-display" });

export const metadata = {
  title: "CU Boulder Parking Ops",
  description: "Vision-node aware attendant tooling for big events",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-buff-50 text-onyx-600">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.08),_transparent_55%)]" />
          <AppProviders>
            <div className="relative z-10 min-h-screen">{children}</div>
          </AppProviders>
        </div>
      </body>
    </html>
  );
}
