import React from "react";

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-blue-600"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
    >
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
  );
}

export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/70 py-16 text-center">
      {icon && <div className="mb-4 text-6xl text-slate-300">{icon}</div>}
      <h3 className="mb-1 text-lg font-bold text-slate-700">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-slate-400">{description}</p>
      )}
      {action}
    </div>
  );
}
