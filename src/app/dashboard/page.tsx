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
          <p className="text-sm font-medium text-[#2563EB]">MoreStars Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            You are logged in.
          </h1>
          <p className="mt-3 text-[#64748B]">
            This temporary dashboard confirms protected routing is working.
          </p>
        </div>
      </div>
    </main>
  );
}