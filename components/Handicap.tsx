// components/Handicap.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Handicap() {
  const [count, setCount] = useState<number>(0);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => Math.max(0, c - 1));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp") increment();
      if (e.key === "ArrowDown") decrement();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="min-h-screen flex items-start justify-center relative bg-white">
      {/* Background image */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/handicap-bg.jpg" alt="" fill style={{ objectFit: "cover" }} priority />
        <div className="absolute inset-0 bg-white/30" />
      </div>

      <div className="relative z-10 mt-24 flex flex-col items-center gap-8">
        <Link href="/">
          <a className="text-base font-medium">← Back</a>
        </Link>

        {/* Title label (from Figma) */}
        <div className="text-center">
          <p className="text-xl font-medium">Take it back now yall</p>
        </div>

        {/* Counter visual */}
        <div className="bg-[#cfb87c] rounded-3xl w-[232px] h-[146px] flex items-center justify-center shadow-sm">
          <div className="text-[72px] leading-none font-semibold text-black select-none">{count}</div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6">
          <button
            aria-label="Increase count"
            onClick={increment}
            className="w-[116px] h-[115px] bg-white rounded-md flex items-center justify-center shadow hover:scale-[1.01] active:translate-y-0.5"
          >
            <Image src="/icon-up.svg" alt="Up" width={36} height={36} />
          </button>

          <button
            aria-label="Decrease count"
            onClick={decrement}
            className="w-[130px] h-[127px] bg-white rounded-md flex items-center justify-center shadow hover:scale-[1.01] active:translate-y-0.5"
          >
            <Image src="/icon-down.svg" alt="Down" width={36} height={36} />
          </button>
        </div>

        <p className="text-sm text-gray-600">Use the buttons or ArrowUp / ArrowDown keys</p>
      </div>
    </main>
  );
}
