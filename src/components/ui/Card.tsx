import React from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200/80 bg-white/88 p-6 shadow-card backdrop-blur-sm",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-card-hover",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex justify-between items-start mb-5", className)}>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; up: boolean };
  sub?: string;
  valueColor?: string;
}

export function StatCard({ label, value, icon, trend, sub, valueColor }: StatCardProps) {
  return (
    <Card hover className="relative overflow-hidden border-slate-200 bg-white">
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        {icon && (
          <div className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm">{icon}</div>
        )}
      </div>
      <p
        className={cn("text-3xl font-bold mt-2 mb-1 text-slate-950", valueColor)}
      >
        {value}
      </p>
      {trend && (
        <p
          className={cn(
            "text-xs flex items-center gap-1",
            trend.up ? "text-emerald-600" : "text-red-500"
          )}
        >
          {trend.up ? "↑" : "↓"} {trend.value}
        </p>
      )}
      {sub && <p className="text-xs font-medium text-slate-500">{sub}</p>}
    </Card>
  );
}
