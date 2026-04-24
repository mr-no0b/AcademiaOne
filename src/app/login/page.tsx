"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GraduationCap, Student, ChalkboardTeacher, ArrowRight, Eye, EyeSlash, LockKey, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type Role = "student" | "teacher";

const roles: { id: Role; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { id: "student", label: "Student", icon: <Student size={28} />, placeholder: "Enter your student ID" },
  { id: "teacher", label: "Teacher", icon: <ChalkboardTeacher size={28} />, placeholder: "Enter your teacher ID" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        userId: userId.trim(),
        password,
        role: selectedRole,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid credentials. Please check your ID and password.");
      } else {
        router.push(`/${selectedRole}`);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,rgba(236,253,245,0.92)_0%,rgba(240,253,250,0.86)_42%,rgba(255,255,255,0.92)_100%)] p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-emerald-100/80 bg-white shadow-modal lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#064e3b_0%,#0f766e_54%,#14532d_100%)] p-10 text-white lg:flex">
          <div>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-emerald-700">
                <GraduationCap size={24} weight="bold" />
              </div>
              <div>
                <p className="text-xl font-bold">AcademiaOne</p>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200/80">University Portal</p>
              </div>
            </div>

            <div className="max-w-sm">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
                <LockKey size={14} />
                Secure Access
              </p>
              <h1 className="text-4xl font-bold leading-tight">Run the academic day from one focused workspace.</h1>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Sign in with your assigned role to continue into the portal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <div key={role.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 text-teal-200">{role.icon}</div>
                <p className="text-sm font-bold">{role.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-[640px] items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)] p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8 lg:hidden">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-lg">
                <GraduationCap size={27} weight="bold" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">AcademiaOne</h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to your portal</p>
            </div>

            <div className="mb-8 hidden lg:block">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Welcome Back</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">Choose your role and enter your credentials.</p>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-slate-700">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      "flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-sm font-bold transition-all",
                      selectedRole === role.id
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_14px_24px_-20px_rgba(16,185,129,0.9)]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/60"
                    )}
                  >
                    <span className={selectedRole === role.id ? "text-emerald-600" : "text-slate-400"}>
                      {role.icon}
                    </span>
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  University ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={roles.find((r) => r.id === selectedRole)!.placeholder}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white/80 px-4 pr-11 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 font-bold text-white shadow-[0_18px_34px_-22px_rgba(16,185,129,0.95)] transition-all hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <CheckCircle size={14} />
              Contact IT Department for access
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
