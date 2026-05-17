import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-6 py-10 text-[#1E293B]">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2563EB]">
                MoreStars Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                You are logged in.
              </h1>

              <p className="mt-3 text-[#64748B]">
                This temporary dashboard confirms protected routing is working.
              </p>

              <p className="mt-4 text-sm text-[#64748B]">
                Logged in as:
              </p>

              <p className="font-medium">{user.email}</p>
            </div>

            <Link
              href="/auth/logout"
              className="rounded-xl bg-[#0B1F33] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#142C46]"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}