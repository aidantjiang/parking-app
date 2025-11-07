"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface CounterProps {
  initialValue?: number;
}

export default function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => Math.max(0, c - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") increment();
      if (e.key === "ArrowDown") decrement();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 text-black">
      <div className="bg-yellow-300 rounded-3xl w-[200px] h-[120px] flex items-center justify-center shadow">
        <div className="text-5xl font-bold">{count}</div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={increment}
          className="w-[80px] h-[80px] bg-white rounded-md flex items-center justify-center shadow hover:scale-[1.01] active:translate-y-0.5"
        >
          ↑
        </button>
        <button
          onClick={decrement}
          className="w-[80px] h-[80px] bg-white rounded-md flex items-center justify-center shadow hover:scale-[1.01] active:translate-y-0.5"
        >
          ↓
        </button>
      </div>
    </div>
  );
}
