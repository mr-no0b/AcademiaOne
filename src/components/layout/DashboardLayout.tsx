"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/Toast";
import { ProfilePasswordModal } from "@/components/layout/ProfilePasswordModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "teacher" | "admin";
  title?: string;
  breadcrumb?: string;
}

export function DashboardLayout({
  children,
  role,
  title = "Dashboard",
  breadcrumb,
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && session.user.role !== role) {
      router.replace(`/${session.user.role}`);
    }
  }, [status, session, role, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-body)" }}>
        <div className="glass-panel flex flex-col items-center gap-3 rounded-lg px-8 py-7">
          <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm font-medium text-slate-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="app-shell flex h-screen overflow-hidden">
        <Sidebar
          role={role}
          userName={session.user.name ?? "User"}
          userId={session.user.userId}
          userImage={session.user.profileImage}
          onProfileClick={() => setProfileOpen(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            title={title}
            breadcrumb={breadcrumb ?? `Home / ${title}`}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1480px]">
              {children}
            </div>
          </div>
        </main>
        <ProfilePasswordModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          userName={session.user.name ?? "User"}
          userId={session.user.userId}
          userImage={session.user.profileImage}
        />
      </div>
    </ToastProvider>
  );
}
