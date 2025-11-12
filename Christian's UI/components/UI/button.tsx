import { forwardRef } from "react";
import { cn } from "@/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", fullWidth, className, loading, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      aria-live="polite"
      disabled={disabled || loading}
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:translate-y-px",
        variant === "primary" &&
          "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-400",
        variant === "secondary" &&
          "bg-white text-onyx-700 border border-onyx-500/20 hover:bg-buff-100 focus-visible:ring-onyx-500/40",
        variant === "ghost" && "text-onyx-600 hover:bg-buff-100 focus-visible:ring-buff-300",
        variant === "danger" && "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/70",
        fullWidth && "w-full",
        disabled || loading ? "opacity-60 cursor-not-allowed" : "",
        className
      )}
    >
      {loading && (
        <span className="mr-2 inline-flex h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
      )}
      {children}
    </button>
  );
});
