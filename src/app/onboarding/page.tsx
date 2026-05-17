"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function OnboardingPage() {
  const supabase = createClient();

  const [businessId, setBusinessId] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("ABC Plumbing");
  const [notificationEmail, setNotificationEmail] = useState(
    "owner@business.com"
  );

  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [yelpEnabled, setYelpEnabled] = useState(false);
  const [facebookEnabled, setFacebookEnabled] = useState(false);

  const [googleUrl, setGoogleUrl] = useState("");
  const [yelpUrl, setYelpUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const slug = useMemo(() => {
    return createSlug(businessName || "your-business");
  }, [businessName]);

  useEffect(() => {
    async function loadBusiness() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (business) {
        setBusinessId(business.id);

        setBusinessName(business.business_name ?? "");
        setNotificationEmail(business.notification_email ?? "");

        setGoogleEnabled(business.google_enabled ?? true);
        setYelpEnabled(business.yelp_enabled ?? false);
        setFacebookEnabled(business.facebook_enabled ?? false);

        setGoogleUrl(business.google_review_url ?? "");
        setYelpUrl(business.yelp_review_url ?? "");
        setFacebookUrl(business.facebook_review_url ?? "");
      }

      setLoading(false);
    }

    loadBusiness();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You must be logged in.");
        setSaving(false);
        return;
      }

      if (businessId) {
        const { error } = await supabase
          .from("businesses")
          .update({
            business_name: businessName,
            business_slug: slug,
            notification_email: notificationEmail,
            google_review_url: googleUrl,
            yelp_review_url: yelpUrl,
            facebook_review_url: facebookUrl,
            google_enabled: googleEnabled,
            yelp_enabled: yelpEnabled,
            facebook_enabled: facebookEnabled,
            onboarding_completed: true,
          })
          .eq("id", businessId);

        if (error) {
          setErrorMessage(error.message);
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase.from("businesses").insert({
          user_id: user.id,
          business_name: businessName,
          business_slug: slug,
          notification_email: notificationEmail,
          google_review_url: googleUrl,
          yelp_review_url: yelpUrl,
          facebook_review_url: facebookUrl,
          google_enabled: googleEnabled,
          yelp_enabled: yelpEnabled,
          facebook_enabled: facebookEnabled,
          onboarding_completed: true,
        });

        if (error) {
          setErrorMessage(error.message);
          setSaving(false);
          return;
        }
      }

      window.location.href = "/dashboard";
    } catch {
      setErrorMessage("Something went wrong.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <p className="text-muted-foreground">Loading business settings...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">
            MoreStars Setup
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-secondary md:text-5xl">
            Set up your business
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Add your business information and review platform links to create
            your customer review flow.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-secondary">
                  Business Information
                </h2>

                <div className="mt-6 grid gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-secondary">
                      Business Name
                    </label>

                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-secondary">
                      Business Slug
                    </label>

                    <div className="rounded-2xl border border-border bg-background px-5 py-4 text-sm font-semibold text-muted-foreground">
                      morestars.co/r/{slug}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-secondary">
                      Notification Email
                    </label>

                    <input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) =>
                        setNotificationEmail(e.target.value)
                      }
                      className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <h2 className="text-2xl font-black text-secondary">
                  Review Platforms
                </h2>

                <div className="mt-6 space-y-5">
                  {[
                    {
                      title: "Google Reviews",
                      enabled: googleEnabled,
                      setEnabled: setGoogleEnabled,
                      value: googleUrl,
                      setValue: setGoogleUrl,
                      placeholder: "Google review link",
                    },
                    {
                      title: "Yelp Reviews",
                      enabled: yelpEnabled,
                      setEnabled: setYelpEnabled,
                      value: yelpUrl,
                      setValue: setYelpUrl,
                      placeholder: "Yelp review link",
                    },
                    {
                      title: "Facebook Reviews",
                      enabled: facebookEnabled,
                      setEnabled: setFacebookEnabled,
                      value: facebookUrl,
                      setValue: setFacebookUrl,
                      placeholder: "Facebook review link",
                    },
                  ].map((platform) => (
                    <div
                      key={platform.title}
                      className="rounded-2xl border border-border bg-background p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-black text-secondary">
                            {platform.title}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            platform.setEnabled(!platform.enabled)
                          }
                          className={`rounded-full px-4 py-2 text-xs font-black text-white ${
                            platform.enabled
                              ? "bg-primary"
                              : "bg-slate-400"
                          }`}
                        >
                          {platform.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={platform.value}
                        onChange={(e) =>
                          platform.setValue(e.target.value)
                        }
                        placeholder={platform.placeholder}
                        className="mt-4 w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Business Settings"}
                </button>

                {errorMessage && (
                  <p className="mt-4 text-sm font-semibold text-red-600">
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-border bg-secondary p-6 text-white shadow-xl shadow-blue-950/10">
              <div className="text-sm font-black uppercase tracking-[0.18em] text-blue-200">
                Live Preview
              </div>

              <h2 className="mt-3 text-2xl font-black">
                Your review flow
              </h2>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-5">
                <div className="text-lg font-black">
                  {businessName || "Your Business"}
                </div>

                <div className="mt-1 text-sm text-white/60">
                  morestars.co/r/{slug}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {googleEnabled && (
                    <div className="rounded-full bg-primary px-3 py-1 text-xs font-black text-white">
                      Google
                    </div>
                  )}

                  {yelpEnabled && (
                    <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                      Yelp
                    </div>
                  )}

                  {facebookEnabled && (
                    <div className="rounded-full bg-blue-500 px-3 py-1 text-xs font-black text-white">
                      Facebook
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="text-lg font-black text-secondary">
                What happens next?
              </div>

              <ul className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
                <li>
                  • Your business gets a unique review link and QR code
                </li>

                <li>
                  • Customers can scan and leave ratings
                </li>

                <li>
                  • Positive ratings get guided toward review platforms
                </li>

                <li>
                  • Lower ratings become private feedback
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}