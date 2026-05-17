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

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">
              MoreStars Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-secondary">
              {business.business_name}
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Monitor review activity, manage your review platforms, and track
              customer feedback from one dashboard.
            </p>
          </div>

          <Link
            href="/auth/logout"
            className="inline-flex items-center justify-center rounded-2xl bg-secondary px-5 py-3 text-sm font-black text-white transition hover:bg-[#142C46]"
          >
            Logout
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Interactions", "0"],
            ["Positive Ratings", "0"],
            ["Private Feedback", "0"],
            ["Confirmed Posted", "0"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[2rem] border border-border bg-card p-6 shadow-sm"
            >
              <div className="text-sm font-bold text-muted-foreground">
                {label}
              </div>

              <div className="mt-3 text-4xl font-black text-secondary">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-secondary">
                  Business Settings
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Your review flow and platform configuration.
                </p>
              </div>

              <Link
                href="/onboarding"
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-secondary transition hover:border-primary hover:text-primary"
              >
                Edit
              </Link>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <div className="text-sm font-bold text-muted-foreground">
                  Business Name
                </div>

                <div className="mt-2 text-lg font-black text-secondary">
                  {business.business_name}
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-muted-foreground">
                  Review Link
                </div>

                <div className="mt-2 rounded-2xl border border-border bg-background px-5 py-4 text-sm font-semibold text-secondary">
                  morestars.co/r/{business.business_slug}
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-muted-foreground">
                  Notification Email
                </div>

                <div className="mt-2 text-lg font-semibold text-secondary">
                  {business.notification_email}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-secondary p-6 text-white shadow-xl shadow-blue-950/10">
              <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-200">
                Platforms
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Google", business.google_enabled],
                  ["Yelp", business.yelp_enabled],
                  ["Facebook", business.facebook_enabled],
                ].map(([name, enabled]) => (
                  <div
                    key={String(name)}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"
                  >
                    <span className="font-bold">{name}</span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        enabled
                          ? "bg-primary text-white"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="text-lg font-black text-secondary">
                Logged In As
              </div>

              <div className="mt-3 text-sm font-medium text-muted-foreground">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}