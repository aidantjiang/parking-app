"use client";
import React from "react";

interface LotDropdownProps {
  lots: string[];
  selectedLot: string;
  onChange: (lot: string) => void;
}

export default function LotDropdown({ lots, selectedLot, onChange }: LotDropdownProps) {
  return (
    <div className="flex flex-col items-start gap-2 text-black">
      <label htmlFor="lotSelect" className="font-medium text-sm">Lot</label>
      <select
        id="lotSelect"
        value={selectedLot}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {lots.map((lot) => (
          <option key={lot} value={lot}>{lot}</option>
        ))}
      </select>
    </div>
  );
}
