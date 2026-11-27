"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };

        if (!res.ok) {
          setError(data.error ?? "Unable to create account.");
          setSubmitting(false);
          return;
        }
      }

      const signInResult = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Invalid email or password. Please check and try again.");
        setSubmitting(false);
        return;
      }

      router.push(isRegister ? "/setup" : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-12 bg-[radial-gradient(ellipse_at_top,_rgba(0,113,227,0.06),_transparent_60%)]">
      <div className="mx-auto w-full max-w-[420px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 mb-8 text-slate-900 hover:opacity-80 transition-opacity"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3] text-white shadow-sm">
            <BookOpen className="h-4.5 w-4.5" strokeWidth={2.2} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            SIWES Vault
          </span>
        </Link>

        <div className="crystalline-card rounded-3xl p-7 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {isRegister ? "Create your logbook" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {isRegister
                ? "Set up your student account to generate your 16-week SIWES schedule."
                : "Sign in to continue logging your 16-week SIWES activities."}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Chukwudi Ozioma Gospel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="student@institution.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={isRegister ? 8 : 1}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder={isRegister ? "Minimum 8 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0071e3] px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#0062c4] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#0071e3]/20 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isRegister ? "Creating account..." : "Signing in..."}</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-500">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#0071e3] hover:underline"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to SIWES Vault?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[#0071e3] hover:underline"
                >
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
