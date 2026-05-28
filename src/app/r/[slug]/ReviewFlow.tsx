"use client";

import { useMemo, useState } from "react";
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
  const [serviceDescription, setServiceDescription] = useState("");
  const [helperName, setHelperName] = useState("");
  const [customReview, setCustomReview] = useState("");
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [reviewEventId, setReviewEventId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customCopied, setCustomCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const reviewSuggestions = useMemo(() => {
    const service =
      serviceDescription.trim().length > 0
        ? serviceDescription
        : "the service";

    const helper = helperName.trim().length > 0 ? ` ${helperName}` : "";

    return [
      `Great experience with ${businessName}.${helper ? `${helper} was extremely helpful and professional.` : ""} Highly recommend them for ${service}.`,
      `${businessName} did an amazing job with ${service}.${helper ? `${helper} made the process smooth and easy.` : ""} Would definitely use them again.`,
      `Very happy with my experience at ${businessName}.${helper ? `${helper} provided excellent customer service.` : ""} Fast, professional, and easy to work with.`,
    ];
  }, [businessName, helperName, serviceDescription]);

  function handleRatingSelect(selectedRating: number) {
    setRating(selectedRating);
    setStep("service");
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
    if (!rating) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("review_events")
      .insert({
        business_id: businessId,
        rating,
        service_description: serviceDescription,
        helper_name: helperName,
        suggested_review: customReview,
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

    const { error } = await supabase
      .from("review_events")
      .update({
        confirmed_posted: true,
      })
      .eq("id", reviewEventId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setStep("posted");
  }

  async function submitPrivateFeedback() {
    if (!rating) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase.from("review_events").insert({
      business_id: businessId,
      rating,
      service_description: serviceDescription,
      helper_name: helperName,
      private_feedback: privateFeedback,
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

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } else {
      setCustomCopied(true);
      setCopiedIndex(null);

      setTimeout(() => {
        setCustomCopied(false);
      }, 2000);
    }
  }

  function handlePlatformClick(
    platform: string,
    url: string | null | undefined
  ) {
    if (!url) {
      return;
    }

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
                This helps {businessName} understand what part of the experience
                your rating was about.
              </p>

              <input
                type="text"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Example: customer service, plumbing repair, dinner service, cleaning, appointment scheduling"
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
                This is optional. You can name a team member, technician,
                server, agent, or staff member if someone specific helped you.
              </p>

              <input
                type="text"
                value={helperName}
                onChange={(e) => setHelperName(e.target.value)}
                placeholder="Optional: John, Sarah, Mike the technician, front desk staff"
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

                    {copiedIndex === index && (
                      <div className="mt-3 text-sm font-semibold text-emerald-700">
                        Copied to clipboard and added below.
                      </div>
                    )}
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
                  {customCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Custom Review Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Custom Review
                    </>
                  )}
                </button>
              </div>

              {customCopied && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700">
                  Your custom review was copied successfully.
                </div>
              )}

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

                {!selectedPlatform && (
                  <p className="mt-3 text-xs font-semibold text-muted-foreground">
                    First choose a review platform above.
                  </p>
                )}
              </div>

              <div className="mt-5 text-sm text-muted-foreground">
                Your positive review assist was saved successfully.
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