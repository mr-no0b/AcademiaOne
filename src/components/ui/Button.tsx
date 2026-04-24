import React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "danger-soft";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white border-transparent shadow-[0_12px_24px_-16px_rgba(37,99,235,0.9)] hover:bg-blue-700 hover:shadow-[0_16px_30px_-18px_rgba(37,99,235,0.95)] active:bg-blue-800",
  outline:
    "bg-white/90 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300 hover:text-slate-950",
  ghost:
    "bg-transparent text-slate-500 border-transparent hover:bg-slate-900/5 hover:text-slate-800",
  danger:
    "bg-red-600 text-white border-transparent shadow-[0_12px_24px_-16px_rgba(220,38,38,0.9)] hover:bg-red-700",
  "danger-soft":
    "bg-red-50 text-red-700 border-red-100 hover:bg-red-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs min-h-8",
  md: "px-4 py-2 text-sm min-h-10",
  lg: "px-5 py-2.5 text-base min-h-11",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
