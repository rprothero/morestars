"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-6 py-10 text-[#1E293B]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F33] text-xl font-bold text-white shadow-lg">
            ★
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Start setting up your MoreStars review system.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#2563EB",
                    brandAccent: "#1D4ED8",
                  },
                  radii: {
                    borderRadiusButton: "12px",
                    inputBorderRadius: "12px",
                  },
                },
              },
            }}
            providers={[]}
            view="sign_up"
            redirectTo={`${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`}
          />
        </div>
      </div>
    </main>
  );
}