"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

interface PageShellProps {
  heading?: string;
  subheading?: string;
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
}

export function PageShell({ heading, subheading, children, className, hideNav }: PageShellProps) {
  return (
    <div className="min-h-screen">
      {!hideNav && <Navbar />}
      <main className={cn("mx-auto w-full max-w-6xl px-4 py-8", className)}>
        {(heading || subheading) && (
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {heading && <h1 className="font-display text-3xl text-onyx-700">{heading}</h1>}
            {subheading && <p className="text-sm uppercase tracking-[0.3em] text-primary-600">{subheading}</p>}
          </motion.header>
        )}
        {children}
      </main>
    </div>
  );
}
