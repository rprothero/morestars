"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquareHeart,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateReviewSuggestions } from "@/lib/review-templates";

type ReviewFlowProps = {
  businessId: string;
  businessName: string;
  businessSlug: string;
  googleEnabled: boolean;
  googleUrl: string | null;
  yelpEnabled: boolean;
  yelpUrl: string | null;
  facebookEnabled: boolean;
  facebookUrl: string | null;
};

type FlowStep =
  | "rating"
  | "service"
  | "helper"
  | "suggestion"
  | "positive"
  | "posted"
  | "private";

type ServiceCategory = {
  id: string;
  category_name: string;
};

type Helper = {
  id: string;
  display_name: string;
};

function makeSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ReviewFlow({
  businessId,
  businessName,
  businessSlug,
  googleEnabled,
  googleUrl,
  yelpEnabled,
  yelpUrl,
  facebookEnabled,
  facebookUrl,
}: ReviewFlowProps) {
  const supabase = createClient();

  const [step, setStep] = useState<FlowStep>("rating");
  const [rating, setRating] = useState<number | null>(null);

  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    []
  );
  const [helpers, setHelpers] = useState<Helper[]>([]);

  const [serviceCategoryId, setServiceCategoryId] = useState<string | null>(
    null
  );
  const [helperId, setHelperId] = useState<string | null>(null);

  const [serviceDescription, setServiceDescription] = useState("");
  const [helperName, setHelperName] = useState("");
  const [customReview, setCustomReview] = useState("");
  const [privateFeedback, setPrivateFeedback] = useState("");

  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [reviewEventId, setReviewEventId] = useState<string | null>(null);
  const [publicSessionId] = useState(makeSessionId);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customCopied, setCustomCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOptions() {
      const { data: categories } = await supabase
        .from("business_service_categories")
        .select("id, category_name")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("category_name", { ascending: true });

      const { data: helperData } = await supabase
        .from("business_helpers")
        .select("id, display_name")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("display_name", { ascending: true });

      setServiceCategories(categories ?? []);
      setHelpers(helperData ?? []);
    }

    loadOptions();
  }, [businessId, supabase]);

  const reviewSuggestions = generateReviewSuggestions({
    businessName,
    serviceDescription,
    helperName,
  });

  function handleRatingSelect(selectedRating: number) {
    setRating(selectedRating);
    setStep("service");
    setErrorMessage("");
  }

  function handleServiceCategorySelect(category: ServiceCategory) {
    setServiceCategoryId(category.id);
    setServiceDescription(category.category_name);
    setErrorMessage("");
  }

  function handleHelperSelect(helper: Helper) {
    setHelperId(helper.id);
    setHelperName(helper.display_name);
    setErrorMessage("");
  }

  function handleServiceContinue() {
    if (serviceDescription.trim().length === 0) {
      setErrorMessage("Please tell us what the business helped you with.");
      return;
    }

    setErrorMessage("");
    setStep("helper");
  }

  function handleHelperContinue() {
    setErrorMessage("");

    if (rating && rating >= 4) {
      setStep("suggestion");
      return;
    }

    setStep("private");
  }

  async function continuePositiveFlow() {
    if (!rating) return;

    setSaving(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("review_events")
      .insert({
        business_id: businessId,
        rating,
        service_description: serviceDescription,
        service_category_id: serviceCategoryId,
        helper_name: helperName,
        helper_id: helperId,
        suggested_review: customReview,
        public_session_id: publicSessionId,
      })
      .select("id")
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setReviewEventId(data.id);
    setSaving(false);
    setStep("positive");
  }

  async function confirmPostedReview() {
    if (!reviewEventId) {
      setErrorMessage("We could not find this review session. Please try again.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase.rpc("confirm_review_posted", {
      p_event_id: reviewEventId,
      p_session_id: publicSessionId,
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setStep("posted");
  }

  async function submitPrivateFeedback() {
    if (!rating) return;

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase.from("review_events").insert({
      business_id: businessId,
      rating,
      service_description: serviceDescription,
      service_category_id: serviceCategoryId,
      helper_name: helperName,
      helper_id: helperId,
      private_feedback: privateFeedback,
      public_session_id: publicSessionId,
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSubmitted(true);
    setSaving(false);
  }

  async function copyReview(text: string, index?: number) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    if (typeof index === "number") {
      setCopiedIndex(index);
      setCustomCopied(false);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCustomCopied(true);
      setCopiedIndex(null);
      setTimeout(() => setCustomCopied(false), 2000);
    }
  }

  function handlePlatformClick(
    platform: string,
    url: string | null | undefined
  ) {
    if (!url) return;

    setSelectedPlatform(platform);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (submitted) {
    return (
      <div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
          <MessageSquareHeart className="h-7 w-7" />
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-secondary">
          Thank you.
        </h1>

        <p className="mt-4 leading-7 text-muted-foreground">
          Your private feedback has been sent to {businessName}.
        </p>
      </div>
    );
  }

  if (step === "posted") {
    return (
      <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-secondary">
          Thank you for your review.
        </h1>

        <p className="mt-4 leading-7 text-muted-foreground">
          Your feedback helps support businesses like {businessName} and helps
          future customers make informed decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
      <div className="text-center">
        <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-primary">
          MoreStars Review Flow
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-secondary">
          {businessName}
        </h1>

        <p className="mt-4 leading-7 text-muted-foreground">
          How was your experience with {businessName}?
        </p>
      </div>

      {step === "rating" && (
        <div className="mt-10 grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingSelect(star)}
              className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-background text-2xl font-black text-secondary transition hover:-translate-y-1 hover:border-primary hover:bg-blue-50 hover:text-primary"
            >
              <Star className="h-7 w-7 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {step === "service" && (
        <div className="mt-8 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <Wrench className="h-6 w-6" />
            </div>

            <div className="w-full">
              <h2 className="text-2xl font-black text-secondary">
                What did we help you with?
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Choose the closest option or type your own.
              </p>

              {serviceCategories.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {serviceCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleServiceCategorySelect(category)}
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                        serviceCategoryId === category.id
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white text-secondary hover:border-primary hover:text-primary"
                      }`}
                    >
                      {category.category_name}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={serviceDescription}
                onChange={(e) => {
                  setServiceDescription(e.target.value);
                  setServiceCategoryId(null);
                }}
                placeholder="Example: customer service, water heater repair, dinner service"
                className="mt-5 w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={handleServiceContinue}
                className="mt-5 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "helper" && (
        <div className="mt-8 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <UserRound className="h-6 w-6" />
            </div>

            <div className="w-full">
              <h2 className="text-2xl font-black text-secondary">
                Who helped you?
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Optional. Choose a team member or type a name if you remember.
              </p>

              {helpers.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {helpers.map((helper) => (
                    <button
                      key={helper.id}
                      type="button"
                      onClick={() => handleHelperSelect(helper)}
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                        helperId === helper.id
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white text-secondary hover:border-primary hover:text-primary"
                      }`}
                    >
                      {helper.display_name}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={helperName}
                onChange={(e) => {
                  setHelperName(e.target.value);
                  setHelperId(null);
                }}
                placeholder="Optional: John, Sarah, Mike the technician"
                className="mt-5 w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleHelperContinue}
                  className="rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Continue
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHelperId(null);
                    setHelperName("");
                    handleHelperContinue();
                  }}
                  className="rounded-2xl border border-border bg-white px-6 py-3 text-sm font-black text-secondary transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "suggestion" && (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <Star className="h-6 w-6 fill-primary" />
            </div>

            <div className="w-full">
              <h2 className="text-2xl font-black text-secondary">
                Suggested review ideas
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Tap a suggestion to copy it, or write your own review below.
              </p>

              <div className="mt-6 space-y-4">
                {reviewSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className={`rounded-2xl border bg-white p-5 transition ${
                      copiedIndex === index
                        ? "border-emerald-400 ring-4 ring-emerald-100"
                        : "border-emerald-200"
                    }`}
                  >
                    <div className="text-sm leading-7 text-secondary">
                      {suggestion}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomReview(suggestion);
                        copyReview(suggestion, index);
                      }}
                      className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                        copiedIndex === index
                          ? "bg-emerald-600 text-white"
                          : "bg-primary text-white hover:bg-blue-700"
                      }`}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Suggestion
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="text-sm font-black text-secondary">
                  Custom review
                </label>

                <textarea
                  value={customReview}
                  onChange={(e) => setCustomReview(e.target.value)}
                  placeholder="Write your own review here..."
                  className="mt-3 min-h-36 w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => copyReview(customReview)}
                  disabled={customReview.trim().length === 0}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition disabled:opacity-50 ${
                    customCopied
                      ? "bg-emerald-600 text-white"
                      : "border border-border bg-white text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  <Copy className="h-4 w-4" />
                  {customCopied ? "Custom Review Copied" : "Copy Custom Review"}
                </button>
              </div>

              <button
                type="button"
                onClick={continuePositiveFlow}
                disabled={saving}
                className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Continue to Review Platforms"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "positive" && (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <Star className="h-6 w-6 fill-primary" />
            </div>

            <div className="w-full">
              <h2 className="text-2xl font-black text-secondary">
                Ready to post your review?
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Choose where you would like to leave your public review.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {googleEnabled && (
                  <button
                    type="button"
                    onClick={() => handlePlatformClick("Google", googleUrl)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Google
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}

                {yelpEnabled && (
                  <button
                    type="button"
                    onClick={() => handlePlatformClick("Yelp", yelpUrl)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-black text-secondary transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                  >
                    Yelp
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}

                {facebookEnabled && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePlatformClick("Facebook", facebookUrl)
                    }
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-black text-secondary transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                  >
                    Facebook
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5">
                <h3 className="text-sm font-black uppercase tracking-wide text-secondary">
                  {selectedPlatform
                    ? `${selectedPlatform} opened in a new tab`
                    : "Posted your review?"}
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  After you finish posting on the review platform, return here
                  and click the button below to confirm.
                </p>

                <button
                  type="button"
                  onClick={confirmPostedReview}
                  disabled={saving || !selectedPlatform}
                  className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "I Posted My Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "private" && (
        <div className="mt-8 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <MessageSquareHeart className="h-6 w-6" />
            </div>

            <div className="w-full">
              <h2 className="text-2xl font-black text-secondary">
                Thanks for letting us know.
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Your feedback can help {businessName} understand what happened
                and improve the experience.
              </p>

              <textarea
                value={privateFeedback}
                onChange={(e) => setPrivateFeedback(e.target.value)}
                placeholder="What could have been better?"
                className="mt-5 min-h-32 w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={submitPrivateFeedback}
                disabled={saving || privateFeedback.trim().length === 0}
                className="mt-5 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Sending..." : "Send Private Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {rating && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Review link: morestars.co/r/{businessSlug}
        </div>
      )}
    </div>
  );
}