"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  ExternalLink,
  MapPin,
  Printer,
  Settings,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import ReviewQrCode from "@/components/ReviewQrCode";

type Business = {
  id: string;
  business_name: string;
  business_slug: string;
  business_type: string | null;
  notification_email: string;
  google_enabled: boolean;
  yelp_enabled: boolean;
  facebook_enabled: boolean;
};

type ReviewEvent = {
  id: string;
  rating: number;
  service_description: string | null;
  helper_name: string | null;
  suggested_review: string | null;
  private_feedback: string | null;
  confirmed_posted: boolean;
  created_at: string;
};

const qrPlacementIdeas: Record<string, string[]> = {
  restaurant: ["Table tents", "Receipt holders", "Host stand", "To-go bags"],
  hvac: ["Service invoice", "Technician clipboard", "Leave-behind card", "Truck handout"],
  locksmith: ["Receipt", "Service van handout", "Business card", "Follow-up email"],
  plumbing: ["Invoice", "Technician handout", "Service receipt", "Follow-up email"],
  electrician: ["Invoice", "Service receipt", "Technician card", "Follow-up email"],
  cleaning: ["Leave-behind card", "Invoice", "Front desk", "Follow-up email"],
  auto_repair: ["Service counter", "Invoice", "Waiting room", "Receipt holder"],
  beauty: ["Checkout counter", "Mirror station", "Appointment card", "Follow-up text"],
  medical: ["Front desk", "Checkout counter", "Appointment card", "Follow-up email"],
  real_estate: ["Closing folder", "Closing gift", "Open house materials", "Follow-up email"],
  legal: ["Client folder", "Reception desk", "Follow-up email", "Invoice"],
  general: ["Front counter", "Receipt", "Follow-up email", "Checkout area"],
};

function getPlacementIdeas(businessType: string | null) {
  return qrPlacementIdeas[businessType || "general"] ?? qrPlacementIdeas.general;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const qrRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviewEvents, setReviewEvents] = useState<ReviewEvent[]>([]);
  const [copied, setCopied] = useState(false);

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

  const analytics = useMemo(() => {
    const totalInteractions = reviewEvents.length;
    const positiveRatings = reviewEvents.filter((event) => event.rating >= 4).length;
    const privateFeedback = reviewEvents.filter((event) => event.rating <= 3).length;
    const confirmedPosted = reviewEvents.filter((event) => event.confirmed_posted).length;

    const conversionRate =
      positiveRatings > 0 ? Math.round((confirmedPosted / positiveRatings) * 100) : 0;

    const averageRating =
      totalInteractions > 0
        ? (
            reviewEvents.reduce((sum, event) => sum + event.rating, 0) /
            totalInteractions
          ).toFixed(1)
        : "0.0";

    const serviceCounts = reviewEvents.reduce<Record<string, number>>((acc, event) => {
      const key = event.service_description?.trim();
      if (!key) return acc;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const helperCounts = reviewEvents.reduce<Record<string, number>>((acc, event) => {
      const key = event.helper_name?.trim();
      if (!key) return acc;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
    const topHelper = Object.entries(helperCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalInteractions,
      positiveRatings,
      privateFeedback,
      confirmedPosted,
      conversionRate,
      averageRating,
      topService,
      topHelper,
    };
  }, [reviewEvents]);

  async function copyReviewLink(reviewUrl: string) {
    await navigator.clipboard.writeText(reviewUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function getQrImageDataUrl() {
    if (!qrRef.current) return "";

    const canvas = qrRef.current.querySelector("canvas");

    if (canvas) {
      return canvas.toDataURL("image/png");
    }

    const image = qrRef.current.querySelector("img");

    if (image?.src) {
      return image.src;
    }

    const svg = qrRef.current.querySelector("svg");

    if (svg) {
      const svgText = new XMLSerializer().serializeToString(svg);
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
    }

    return "";
  }

  function downloadQrPng() {
    const qrImage = getQrImageDataUrl();

    if (!qrImage || !business) {
      return;
    }

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `${business.business_slug}-review-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function openPrintableQrAsset() {
    if (!business) return;

    const qrImage = getQrImageDataUrl();
    const reviewUrl = `${window.location.origin}/r/${business.business_slug}`;

    const printWindow = window.open("", "_blank", "width=900,height=1100");

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${business.business_name} Review QR</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, sans-serif;
              background: #f8fafc;
              color: #0f172a;
            }
            .sheet {
              max-width: 680px;
              margin: 0 auto;
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 32px;
              padding: 48px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
            }
            .eyebrow {
              color: #2563eb;
              font-size: 12px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.2em;
            }
            h1 {
              margin: 18px 0 8px;
              font-size: 38px;
              line-height: 1.05;
            }
            p {
              color: #64748b;
              font-size: 17px;
              line-height: 1.55;
            }
            .qr {
              margin: 34px auto 24px;
              width: 280px;
              height: 280px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid #e2e8f0;
              border-radius: 28px;
              padding: 20px;
            }
            .qr img {
              max-width: 100%;
              max-height: 100%;
            }
            .url {
              margin-top: 20px;
              padding: 18px;
              border-radius: 18px;
              background: #f1f5f9;
              font-size: 14px;
              font-weight: 700;
              word-break: break-all;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #94a3b8;
            }
            @media print {
              body {
                background: white;
              }
              .sheet {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="eyebrow">Scan To Leave Feedback</div>
            <h1>${business.business_name}</h1>
            <p>We appreciate your feedback. Scan the QR code below to share your experience.</p>
            <div class="qr">
              ${qrImage ? `<img src="${qrImage}" alt="Review QR Code" />` : `<div>${reviewUrl}</div>`}
            </div>
            <div class="url">${reviewUrl}</div>
            <div class="footer">Powered by MoreStars.co</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

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
  const placementIdeas = getPlacementIdeas(business.business_type);

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
              Monitor review assists, private feedback, service trends, and
              confirmed posted reviews.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-black text-secondary transition hover:border-primary hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <Link
              href="/auth/logout"
              className="inline-flex items-center justify-center rounded-2xl bg-secondary px-5 py-3 text-sm font-black text-white transition hover:bg-[#142C46]"
            >
              Logout
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Interactions", analytics.totalInteractions],
            ["Average Rating", analytics.averageRating],
            ["Private Feedback", analytics.privateFeedback],
            ["Confirmed Posted", analytics.confirmedPosted],
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

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <div className="text-sm font-black uppercase tracking-wide text-emerald-700">
              Positive Ratings
            </div>

            <div className="mt-3 text-4xl font-black text-secondary">
              {analytics.positiveRatings}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <div className="text-sm font-black uppercase tracking-wide text-primary">
              Review Completion Rate
            </div>

            <div className="mt-3 text-4xl font-black text-secondary">
              {analytics.conversionRate}%
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="text-sm font-black uppercase tracking-wide text-muted-foreground">
              Top Service / Helper
            </div>

            <div className="mt-3 text-lg font-black text-secondary">
              {analytics.topService ? analytics.topService[0] : "No service data yet"}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              {analytics.topHelper
                ? `Top helper: ${analytics.topHelper[0]}`
                : "No helper data yet"}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_390px]">
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

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/settings"
                    className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-secondary transition hover:border-primary hover:text-primary"
                  >
                    Services & Team
                  </Link>

                  <Link
                    href="/onboarding"
                    className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-secondary transition hover:border-primary hover:text-primary"
                  >
                    Edit Business
                  </Link>
                </div>
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
                        onClick={() => copyReviewLink(reviewUrl)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied" : "Copy Link"}
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
                QR Growth Guide
              </h2>

              <p className="mt-2 text-muted-foreground">
                Use your QR code consistently so customers know exactly how to
                share feedback after a good experience.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["1", "Print it", "Download the QR asset and place it where customers naturally pause."],
                  ["2", "Place it", "Put it on counters, receipts, invoices, tables, or checkout areas."],
                  ["3", "Ask for it", "Ask happy customers for feedback before they leave or in a follow-up."],
                ].map(([step, title, description]) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-border bg-background p-5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
                      {step}
                    </div>

                    <div className="mt-4 font-black text-secondary">{title}</div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-primary">
                    <MapPin className="h-4 w-4" />
                    Best places to use it
                  </div>

                  <div className="mt-4 grid gap-2">
                    {placementIdeas.map((idea) => (
                      <div
                        key={idea}
                        className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-secondary"
                      >
                        {idea}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <div className="text-sm font-black uppercase tracking-wide text-orange-700">
                    Common mistakes
                  </div>

                  <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-orange-900">
                    <li>• Hiding the QR code where customers never see it</li>
                    <li>• Forgetting to ask happy customers for feedback</li>
                    <li>• Only asking occasionally instead of consistently</li>
                    <li>• Making the QR code too small to scan easily</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="text-sm font-black uppercase tracking-wide text-primary">
                  Success Tip
                </div>

                <p className="mt-2 text-sm leading-6 text-blue-950">
                  The businesses that usually collect the most reviews are the
                  ones that make asking for feedback part of the normal customer
                  handoff. Do not just print the QR code — put it where customers
                  see it and ask happy customers to scan it.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-black text-secondary">
                Recent Review Activity
              </h2>

              <p className="mt-2 text-muted-foreground">
                Latest review assists, private feedback, services, helpers, and
                confirmed posted reviews.
              </p>

              <div className="mt-8 space-y-4">
                {reviewEvents.length > 0 ? (
                  reviewEvents.slice(0, 10).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-border bg-background p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="rounded-full bg-primary px-3 py-1 text-xs font-black text-white">
                            {event.rating} Star{event.rating === 1 ? "" : "s"}
                          </div>

                          {event.rating >= 4 ? (
                            <div className="text-sm font-semibold text-emerald-600">
                              Positive Review Assist
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-orange-600">
                              Private Feedback
                            </div>
                          )}

                          {event.confirmed_posted && (
                            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                              Confirmed Posted
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-border bg-card px-4 py-3">
                          <div className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                            Service
                          </div>

                          <div className="mt-1 text-sm font-semibold text-secondary">
                            {event.service_description || "Not provided"}
                          </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card px-4 py-3">
                          <div className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                            Helper
                          </div>

                          <div className="mt-1 text-sm font-semibold text-secondary">
                            {event.helper_name || "Not provided"}
                          </div>
                        </div>
                      </div>

                      {event.private_feedback && (
                        <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground">
                          {event.private_feedback}
                        </div>
                      )}

                      {event.suggested_review && (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-secondary">
                          {event.suggested_review}
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
                QR Assets Center
              </div>

              <h2 className="mt-3 text-2xl font-black text-secondary">
                Scan to leave feedback
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Download this QR code and place it anywhere customers naturally
                pause after a good experience.
              </p>

              <div ref={qrRef} className="mt-6">
                <ReviewQrCode value={reviewUrl} />
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={downloadQrPng}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download QR PNG
                </button>

                <button
                  type="button"
                  onClick={openPrintableQrAsset}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-black text-secondary transition hover:border-primary hover:text-primary"
                >
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </button>

                <button
                  type="button"
                  onClick={() => copyReviewLink(reviewUrl)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-black text-secondary transition hover:border-primary hover:text-primary"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Review Link"}
                </button>

                <a
                  href={reviewUrl}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-black text-secondary transition hover:border-primary hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Review Page
                </a>
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