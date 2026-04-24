"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  GraduationCap,
  SquaresFour,
  NotePencil,
  Chalkboard,
  CheckCircle,
  ChartBar,
  Files,
  ChatsCircle,
  Flag,
  ChalkboardTeacher,
  UserCheck,
  CheckSquare,
  Megaphone,
  Users,
  Student,
  ShieldCheck,
  SignOut,
  Books,
  Trophy,
  Bell,
  ClipboardText,
  CalendarBlank,
  IdentificationCard,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  cat: string;
  items: NavItem[];
}

const iconProps = { size: 20, weight: "regular" as const };

const studentNav: NavGroup[] = [
  {
    cat: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/student", icon: <SquaresFour {...iconProps} /> },
      { id: "registration", label: "Registration", href: "/student/registration", icon: <NotePencil {...iconProps} /> },
      { id: "classroom", label: "Classrooms", href: "/student/classroom", icon: <Chalkboard {...iconProps} /> },
    ],
  },
  {
    cat: "Academic",
    items: [
      { id: "attendance", label: "Attendance", href: "/student/attendance", icon: <CheckCircle {...iconProps} /> },
      { id: "results", label: "Results", href: "/student/results", icon: <ChartBar {...iconProps} /> },
      { id: "notes", label: "Notes & Books", href: "/student/notes", icon: <Files {...iconProps} /> },
    ],
  },
  {
    cat: "Community",
    items: [
      { id: "forum", label: "Forum", href: "/forum", icon: <ChatsCircle {...iconProps} /> },
      { id: "elections", label: "Elections", href: "/student/elections", icon: <Flag {...iconProps} /> },
      { id: "notices", label: "Notices", href: "/student/notices", icon: <Bell {...iconProps} /> },
    ],
  },
];

const teacherNav: NavGroup[] = [
  {
    cat: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/teacher", icon: <SquaresFour {...iconProps} /> },
    ],
  },
  {
    cat: "Teaching",
    items: [
      { id: "classroom", label: "Classrooms", href: "/teacher/classroom", icon: <Chalkboard {...iconProps} /> },
      { id: "attendance", label: "Attendance", href: "/teacher/attendance", icon: <UserCheck {...iconProps} /> },
      { id: "results", label: "Results", href: "/teacher/results", icon: <Trophy {...iconProps} /> },
      { id: "books", label: "Book Recs", href: "/teacher/books", icon: <Books {...iconProps} /> },
    ],
  },
  {
    cat: "Advisorship",
    items: [
      { id: "advisees", label: "Advisees", href: "/teacher/advisees", icon: <Student {...iconProps} /> },
    ],
  },
  {
    cat: "Administration",
    items: [
      { id: "registrations", label: "Registrations", href: "/teacher/registrations", icon: <ClipboardText {...iconProps} /> },
      { id: "forum", label: "Forum", href: "/forum", icon: <ChatsCircle {...iconProps} /> },
      { id: "elections", label: "Elections", href: "/teacher/elections", icon: <CheckSquare {...iconProps} /> },
      { id: "notices", label: "Notices", href: "/teacher/notices", icon: <Megaphone {...iconProps} /> },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    cat: "Control Panel",
    items: [
      { id: "dashboard", label: "Overview", href: "/admin", icon: <SquaresFour {...iconProps} /> },
      { id: "users", label: "Users", href: "/admin/users", icon: <Users {...iconProps} /> },
      { id: "admissions", label: "Admissions", href: "/admin/admissions", icon: <Student {...iconProps} /> },
      { id: "identity-card", label: "Identity Card", href: "/admin/identity-card", icon: <IdentificationCard {...iconProps} /> },
    ],
  },
  {
    cat: "Setup",
    items: [
      { id: "sessions", label: "Sessions", href: "/admin/sessions", icon: <CalendarBlank {...iconProps} /> },
      { id: "departments", label: "Departments", href: "/admin/departments", icon: <ShieldCheck {...iconProps} /> },
      { id: "courses", label: "Courses", href: "/admin/courses", icon: <Books {...iconProps} /> },
    ],
  },
  {
    cat: "Content",
    items: [
      { id: "results", label: "Results", href: "/admin/results", icon: <Trophy {...iconProps} /> },
      { id: "notices", label: "Notices", href: "/admin/notices", icon: <Megaphone {...iconProps} /> },
    ],
  },
];

interface SidebarProps {
  role: "student" | "teacher" | "admin";
  userName: string;
  userId: string;
  userImage?: string;
  onProfileClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, userName, userId, userImage, onProfileClick, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navConfig =
    role === "student" ? studentNav : role === "teacher" ? teacherNav : adminNav;

  const isActive = (href: string) => {
    if (href === "/student" || href === "/teacher" || href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const sidebarContent = (
    <aside
      style={{ width: "var(--sidebar-width)" }}
      className={cn(
        "relative flex h-screen flex-shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(155deg,var(--sidebar-bg)_0%,var(--sidebar-bg-2)_54%,var(--sidebar-bg-3)_100%)] text-white shadow-[20px_0_80px_-56px_rgba(15,23,42,0.9)]",
        "lg:sticky lg:top-0"
      )}
    >
      {/* Brand */}
      <div
        className="flex items-center justify-between border-b border-white/10 px-5 pb-3 pt-6"
        style={{ minHeight: "calc(var(--header-height) + 12px)" }}
      >
        <Link href={`/${role}`} className="flex min-w-0 items-center gap-3 text-white no-underline" onClick={onClose}>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-[0_12px_30px_-18px_rgba(255,255,255,0.8)]">
            <GraduationCap size={22} weight="bold" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-lg font-bold text-white">AcademiaOne</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/85">{roleLabel}</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navConfig.map((group) => (
          <div key={group.cat} className="mb-5">
            <p className="mb-2 mt-2 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-50/75">
              {group.cat}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold no-underline transition-all",
                  isActive(item.href)
                    ? "bg-white text-slate-950 shadow-[0_16px_38px_-28px_rgba(255,255,255,0.75)]"
                    : "text-white/82 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className={cn("transition-colors", isActive(item.href) ? "text-emerald-700" : "text-emerald-50/75")}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3">
        <div className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.08]">
          <button
            type="button"
            onClick={onProfileClick}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            title="Open profile"
          >
            <UserAvatar
              name={userName}
              imageUrl={userImage}
              size={36}
              className="w-9 h-9 flex-shrink-0"
              fallbackClassName="bg-emerald-600 text-white flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{userName}</p>
              <p className="truncate text-xs text-emerald-50/70">{userId}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-50">
                <UserCircle size={12} />
                Profile
              </span>
            </div>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-auto rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
            title="Sign out"
          >
            <SignOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{sidebarContent}</div>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            aria-label="Close navigation backdrop"
            onClick={onClose}
          />
          <div className="relative h-full animate-slide-in">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
