import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Parking App",
  description: "Manage parking events and attendants",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
