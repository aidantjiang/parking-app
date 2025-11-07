"use client";
import React from "react";

interface EventDropdownProps {
  events: string[];
  selectedEvent: string;
  onChange: (event: string) => void;
}

export default function EventDropdown({ events, selectedEvent, onChange }: EventDropdownProps) {
  return (
    <div className="flex flex-col items-start gap-2 text-black">
      <label htmlFor="eventSelect" className="font-medium text-sm">Event</label>
      <select
        id="eventSelect"
        value={selectedEvent}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {events.map((evt) => (
          <option key={evt} value={evt}>{evt}</option>
        ))}
      </select>
    </div>
  );
}
