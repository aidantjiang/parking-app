"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dataStore } from "@/lib/data-store";
import type { LotDoc } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface CounterAdjustProps {
  lot: LotDoc;
  userId: string;
}

export function CounterAdjust({ lot, userId }: CounterAdjustProps) {
  const [optimisticCount, setOptimisticCount] = useState(lot.count);
  const [loading, setLoading] = useState(false);
  const [customDelta, setCustomDelta] = useState(0);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    setOptimisticCount(lot.count);
  }, [lot.count]);

  const adjust = async (delta: number) => {
    const next = Math.min(Math.max(optimisticCount + delta, 0), lot.capacity);
    if (next === optimisticCount) return;
    setOptimisticCount(next);
    setLoading(true);
    try {
      await dataStore.adjustCount(lot.id, delta, userId);
      toast.success(`Count ${delta > 0 ? "increased" : "decreased"}`);
    } catch (error) {
      setOptimisticCount(lot.count);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-onyx-700 p-6 text-white shadow-2xl">
      <p className="text-xs uppercase tracking-[0.4em] text-buff-200">Current count</p>
      <div className="my-4 flex items-baseline gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={optimisticCount}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="font-display text-7xl"
          >
            {optimisticCount}
          </motion.span>
        </AnimatePresence>
        <span className="text-lg text-buff-200">/ {lot.capacity}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => adjust(-5)} disabled={loading}>
          -5
        </Button>
        <Button variant="secondary" onClick={() => adjust(-1)} disabled={loading}>
          -1
        </Button>
        <Button variant="secondary" onClick={() => adjust(1)} disabled={loading}>
          +1
        </Button>
        <Button variant="primary" onClick={() => adjust(-10)} disabled={loading}>
          -10
        </Button>
        <Button variant="primary" onClick={() => adjust(+10)} disabled={loading}>
          +10
        </Button>
        <Button variant="ghost" onClick={() => setShowCustom((v) => !v)}>
          Custom
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {showCustom && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 space-y-2">
            <Input
              type="number"
              value={customDelta}
              onChange={(event) => setCustomDelta(Number(event.target.value))}
              label="Custom delta"
              hint="Positive to add, negative to remove"
            />
            <Button variant="secondary" onClick={() => adjust(customDelta)} disabled={loading}>
              Apply
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
