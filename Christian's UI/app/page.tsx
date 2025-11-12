"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-onyx-900 to-onyx-700 px-4 text-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-buff-300">Vision Node Network</p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-buff-50">
          CU Boulder Parking Attendant Console
        </h1>
        <p className="mt-3 text-lg text-buff-200">
          Join live events, claim your lot, and sync occupancy with every vision node in seconds.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button variant="primary" className="bg-primary-500 px-6 py-3 text-base hover:bg-primary-600">
              Enter Console
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="ghost" className="text-white">
              Watch demo
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
