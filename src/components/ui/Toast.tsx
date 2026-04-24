"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, Warning, X, Info, XCircle } from "@phosphor-icons/react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-[420px] flex-col gap-3 sm:right-6 sm:top-6 sm:w-auto"
      >
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle size={22} weight="fill" className="text-emerald-500" />,
    error: <XCircle size={22} weight="fill" className="text-red-500" />,
    warning: <Warning size={22} weight="fill" className="text-amber-500" />,
    info: <Info size={22} weight="fill" className="text-indigo-500" />,
  };

  const borders = {
    success: "border-l-emerald-500",
    error: "border-l-red-500",
    warning: "border-l-amber-500",
    info: "border-l-indigo-500",
  };

  return (
    <div className={`animate-slide-in flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 border-l-4 bg-white/95 px-4 py-3 shadow-card-hover backdrop-blur ${borders[toast.type]} sm:min-w-[320px]`}>
      {icons[toast.type]}
      <span className="flex-1 text-sm font-medium text-slate-700">{toast.message}</span>
      <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
