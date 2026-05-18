"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import ReviewQrCode from "@/components/ReviewQrCode";

type Business = {
  id: string;
  business_name: string;
  business_slug: string;
  notification_email: string;
  google_enabled: boolean;
  yelp_enabled: boolean;
  facebook_enabled: boolean;
};

type ReviewEvent = {
  id: string;
  rating: number;
  private_feedback: string | null;
  confirmed_posted: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviewEvents, setReviewEvents] = useState<ReviewEvent[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUserEmail(session.user.email ?? "");

      const { data: businessData } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!businessData) {
        router.replace("/onboarding");
        return;
      }

      setBusiness(businessData);

      const { data: eventsData } = await supabase
        .from("review_events")
        .select("*")
        .eq("business_id", businessData.id)
        .order("created_at", { ascending: false });

      setReviewEvents(eventsData ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!business) {
    return null;
  }

  const reviewUrl = `${window.location.origin}/r/${business.business_slug}`;

  const totalInteractions = reviewEvents.length;
  const positiveRatings = reviewEvents.filter((event) => event.rating >= 4).length;
  const privateFeedback = reviewEvents.filter((event) => event.rating <= 3).length;
  const confirmedPosted = reviewEvents.filter((event) => event.confirmed_posted).length;

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
            ["Total Interactions", totalInteractions],
            ["Positive Ratings", positiveRatings],
            ["Private Feedback", privateFeedback],
            ["Confirmed Posted", confirmedPosted],
          ].map(([label, value]) => (
            <div
              key={String(label)}
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
          <div className="space-y-6">
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

                  <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-border bg-background p-5">
                    <div className="break-all text-sm font-semibold text-secondary">
                      {reviewUrl}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(reviewUrl)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </button>

                      <a
                        href={reviewUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-black text-secondary transition hover:border-primary hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open Page
                      </a>
                    </div>
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

            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-black text-secondary">
                Recent Feedback
              </h2>

              <p className="mt-2 text-muted-foreground">
                Latest review interactions from customers.
              </p>

              <div className="mt-8 space-y-4">
                {reviewEvents.length > 0 ? (
                  reviewEvents.slice(0, 10).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-border bg-background p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary px-3 py-1 text-xs font-black text-white">
                            {event.rating} Star
                            {event.rating === 1 ? "" : "s"}
                          </div>

                          {event.rating >= 4 ? (
                            <div className="text-sm font-semibold text-emerald-600">
                              Positive
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-orange-600">
                              Private Feedback
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {event.private_feedback && (
                        <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground">
                          {event.private_feedback}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                    <div className="text-lg font-bold text-secondary">
                      No review activity yet
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Customer review activity will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="text-sm font-black uppercase tracking-[0.18em] text-primary">
                Review QR Code
              </div>

              <h2 className="mt-3 text-2xl font-black text-secondary">
                Scan to leave a review
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Print this QR code on signs, menus, tables, receipts, or front
                desk displays.
              </p>

              <div className="mt-6">
                <ReviewQrCode value={reviewUrl} />
              </div>
            </div>

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
                {userEmail}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}