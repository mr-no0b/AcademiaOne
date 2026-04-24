"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  BellRinging,
  Check,
  ClipboardText,
  Flag,
  GraduationCap,
  List,
  Megaphone,
  PushPin,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, breadcrumb, onMenuClick }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.data ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleBellClick = async () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleClearAll = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = (n: Notification) => {
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const typeIcon: Record<string, React.ReactNode> = {
    registration: <ClipboardText size={16} />,
    notice: <Megaphone size={16} />,
    announcement: <PushPin size={16} />,
    election: <Flag size={16} />,
    result: <GraduationCap size={16} />,
    general: <BellRinging size={16} />,
  };

  return (
    <header
      className="glass-panel relative z-[90] flex flex-shrink-0 items-center justify-between border-x-0 border-t-0 px-4 sm:px-6"
      style={{ height: "var(--header-height)" }}
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 lg:hidden"
          aria-label="Open navigation"
        >
          <List size={20} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-950">{title}</p>
          {breadcrumb && <p className="truncate text-xs font-medium text-slate-500">{breadcrumb}</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            className="relative rounded-lg border border-slate-200 bg-white/85 p-2 text-slate-500 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full z-[120] mt-3 w-[calc(100vw-2rem)] max-w-96 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-modal sm:w-96">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/85 px-4 py-3">
                <span className="text-sm font-bold text-slate-800">Notifications</span>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash size={13} />
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-600">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Check size={32} className="mb-2 text-slate-300" />
                    <p className="text-sm font-medium">All caught up</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-blue-50/45 ${!n.isRead ? "bg-blue-50/70" : ""}`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        {typeIcon[n.type] ?? <BellRinging size={16} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-sm font-semibold text-slate-800 ${!n.isRead ? "font-bold" : ""}`}>{n.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!n.isRead && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
