// components/ButtonLink.tsx
import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function ButtonLink({ href, children, className = "" }: Props) {
  return (
    <Link href={href}>
      {/* Using a <button> inside Link to match your example */}
      <button
        className={`inline-flex items-center justify-center px-5 py-2 rounded-2xl font-medium shadow-sm ${className}`}
        type="button"
      >
        {children}
      </button>
    </Link>
  );
}
