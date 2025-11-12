import { cn } from "@/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <label className="flex w-full flex-col space-y-1 text-sm">
      {label && <span className="font-semibold text-onyx-700">{label}</span>}
      <input
        {...props}
        className={cn(
          "rounded-2xl border border-onyx-500/15 bg-white px-4 py-2 text-base shadow-sm transition placeholder:text-onyx-500/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
          error && "border-danger focus:ring-danger/30",
          className
        )}
      />
      {(hint || error) && <span className={cn("text-xs", error ? "text-danger" : "text-onyx-500/70")}>{error ?? hint}</span>}
    </label>
  );
}
