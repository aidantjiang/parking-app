import { ReactNode } from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      {children && <div className="mt-2 text-sm text-gray-700">{children}</div>}
    </div>
  );
}
