import { cn } from "@/utils/cn";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "muted";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
}

export function Badge({ label, variant = "info", pulse, className }: BadgeProps) {
  const palette: Record<BadgeVariant, string> = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
    info: "bg-primary-500/10 text-primary-700",
    muted: "bg-onyx-500/10 text-onyx-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        palette[variant],
        className
      )}
    >
      {pulse && <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_6px_currentColor]" />}
      {label}
    </span>
  );
}
