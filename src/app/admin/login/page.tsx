"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeSlash,
  GraduationCap,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        userId: userId.trim(),
        password,
        role: "admin",
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid admin credentials.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,rgba(236,253,245,0.92)_0%,rgba(240,253,250,0.86)_42%,rgba(255,255,255,0.92)_100%)] p-4 sm:p-6">
      <div className="w-full max-w-md rounded-lg border border-emerald-100/80 bg-white shadow-modal">
        <div className="rounded-t-lg bg-[linear-gradient(160deg,#064e3b_0%,#0f766e_58%,#14532d_100%)] px-8 py-8 text-white">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-emerald-700">
              <GraduationCap size={24} weight="bold" />
            </div>
            <div>
              <p className="text-xl font-bold">AcademiaOne</p>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/85">Admin Portal</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50">
            <ShieldCheck size={14} />
            Admin Access
          </div>
          <h1 className="mt-4 text-3xl font-bold">Sign in as admin</h1>
          <p className="mt-2 text-sm leading-6 text-emerald-50/80">
            Use your administrator account to access system controls.
          </p>
        </div>

        <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)] px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                Admin ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your admin ID"
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
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 font-bold text-white shadow-[0_18px_34px_-22px_rgba(16,185,129,0.95)] transition-all hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
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

          <div className="mt-5 flex items-center justify-between gap-3 text-xs font-medium text-slate-400">
            <span className="inline-flex items-center gap-2">
              <CheckCircle size={14} />
              Restricted access
            </span>
            <Link href="/login" className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800">
              <ArrowLeft size={13} />
              Student/Teacher Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
