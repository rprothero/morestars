"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import {
  getIndustryTemplateByKey,
  INDUSTRY_TEMPLATES,
  IndustryTemplateKey,
} from "@/lib/review-templates";

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

  const [businessType, setBusinessType] =
    useState<IndustryTemplateKey>("plumbing");

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

        setBusinessType(
          (business.business_type as IndustryTemplateKey) || "general"
        );

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

  async function seedIndustryCategories(targetBusinessId: string) {
    const template = getIndustryTemplateByKey(businessType);

    const { error: deleteTemplateError } = await supabase
      .from("business_service_categories")
      .delete()
      .eq("business_id", targetBusinessId)
      .eq("source", "template");

    if (deleteTemplateError) {
      throw new Error(deleteTemplateError.message);
    }

    const { data: existingServices, error: existingError } = await supabase
      .from("business_service_categories")
      .select("category_name, source")
      .eq("business_id", targetBusinessId);

    if (existingError) {
      throw new Error(existingError.message);
    }

    const customNames = (existingServices ?? [])
      .filter((service) => service.source !== "template")
      .map((service) => service.category_name.trim().toLowerCase());

    const missingCategories = template.serviceCategories.filter(
      (category) => !customNames.includes(category.trim().toLowerCase())
    );

    if (missingCategories.length === 0) {
      return;
    }

    const inserts = missingCategories.map((category) => ({
      business_id: targetBusinessId,
      category_name: category,
      source: "template",
      template_key: businessType,
    }));

    const { error: insertError } = await supabase
      .from("business_service_categories")
      .insert(inserts);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

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

      let targetBusinessId = businessId;

      if (businessId) {
        const { error } = await supabase
          .from("businesses")
          .update({
            business_name: businessName,
            business_slug: slug,
            business_type: businessType,
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
        const { data: insertedBusiness, error } = await supabase
          .from("businesses")
          .insert({
            user_id: user.id,
            business_name: businessName,
            business_slug: slug,
            business_type: businessType,
            notification_email: notificationEmail,
            google_review_url: googleUrl,
            yelp_review_url: yelpUrl,
            facebook_review_url: facebookUrl,
            google_enabled: googleEnabled,
            yelp_enabled: yelpEnabled,
            facebook_enabled: facebookEnabled,
            onboarding_completed: true,
          })
          .select("id")
          .single();

        if (error) {
          setErrorMessage(error.message);
          setSaving(false);
          return;
        }

        targetBusinessId = insertedBusiness.id;
      }

      if (targetBusinessId) {
        await seedIndustryCategories(targetBusinessId);
      }

      window.location.href = "/dashboard";
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
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
            Add your business details, choose your industry, and connect your
            review links. MoreStars will automatically prepare recommended
            service categories for your review flow.
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
                      Business Industry
                    </label>

                    <select
                      value={businessType}
                      onChange={(e) =>
                        setBusinessType(e.target.value as IndustryTemplateKey)
                      }
                      className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
                    >
                      {INDUSTRY_TEMPLATES.map((template) => (
                        <option key={template.key} value={template.key}>
                          {template.label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      This creates recommended service categories automatically.
                    </p>
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
                      onChange={(e) => setNotificationEmail(e.target.value)}
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
                        <div className="font-black text-secondary">
                          {platform.title}
                        </div>

                        <button
                          type="button"
                          onClick={() => platform.setEnabled(!platform.enabled)}
                          className={`rounded-full px-4 py-2 text-xs font-black text-white ${
                            platform.enabled ? "bg-primary" : "bg-slate-400"
                          }`}
                        >
                          {platform.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </div>

                      <input
                        type="text"
                        value={platform.value}
                        onChange={(e) => platform.setValue(e.target.value)}
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
                  {saving ? "Saving..." : "Save & Go Live"}
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

              <h2 className="mt-3 text-2xl font-black">Your review flow</h2>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-5">
                <div className="text-lg font-black">
                  {businessName || "Your Business"}
                </div>

                <div className="mt-1 text-sm text-white/60">
                  morestars.co/r/{slug}
                </div>

                <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                  {
                    INDUSTRY_TEMPLATES.find(
                      (template) => template.key === businessType
                    )?.label
                  }
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
                <li>• Your business gets a unique review link and QR code</li>
                <li>• Recommended service categories are created automatically</li>
                <li>• Customers can scan and leave ratings</li>
                <li>• Positive ratings get guided toward review platforms</li>
                <li>• Lower ratings become private feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}