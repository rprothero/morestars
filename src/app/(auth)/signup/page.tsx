"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Check your email to confirm your account.");
  }

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-6 py-10 text-[#1E293B]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F33] text-xl font-bold text-white shadow-lg">
            ★
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Start setting up your MoreStars review system.
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
              placeholder="Create a password"
            />
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-xl bg-[#2563EB] px-4 py-3 font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-[#64748B]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#2563EB]">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}