import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  title?: string;
  subtitle?: string;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ title, subtitle, badge, children, className, onClick }: CardProps) {
  return (
    <article
      onClick={onClick}
      className={cn(
        "group relative rounded-3xl border border-onyx-500/10 bg-white/90 p-5 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl",
        onClick && "cursor-pointer",
        className
      )}
    >
      {(title || badge) && (
        <div className="flex items-start justify-between gap-2">
          <div>
            {title && <h3 className="font-display text-xl text-onyx-700">{title}</h3>}
            {subtitle && <p className="text-sm text-onyx-500/80">{subtitle}</p>}
          </div>
          {badge}
        </div>
      )}
      {children && <div className="mt-3 text-sm text-onyx-600">{children}</div>}
      <div className="pointer-events-none absolute inset-x-4 bottom-0 h-1 rounded-full bg-gradient-to-r from-primary-300/0 via-primary-400/20 to-primary-300/0 opacity-0 transition group-hover:opacity-100" />
    </article>
  );
}
