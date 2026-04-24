import React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "gray" | "blue" | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-blue-50 text-blue-700 ring-blue-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function roleVariant(role: string): BadgeVariant {
  if (role === "student") return "primary";
  if (role === "teacher") return "warning";
  if (role === "admin") return "purple";
  return "gray";
}

export function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    active: "success",
    admitted: "success",
    good: "success",
    approved: "success",
    published: "success",
    paid: "success",
    present: "success",
    pending: "warning",
    pending_advisor: "warning",
    pending_head: "warning",
    payment_pending: "warning",
    draft: "gray",
    warning: "warning",
    late: "warning",
    upcoming: "blue",
    open: "success",
    rejected: "danger",
    absent: "danger",
    critical: "danger",
    closed: "gray",
    inactive: "gray",
    excused: "blue",
  };
  return map[status.toLowerCase()] ?? "gray";
}
