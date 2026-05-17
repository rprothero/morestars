"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareHeart, Star } from "lucide-react";
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

  const [rating, setRating] = useState<number | null>(null);

  const [privateFeedback, setPrivateFeedback] = useState("");

  const [positiveSaved, setPositiveSaved] = useState(false);

  const [saving, setSaving] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const isPositive = rating !== null && rating >= 4;
  const isPrivateFeedback = rating !== null && rating <= 3;

  async function savePositiveRating(selectedRating: number) {
    if (positiveSaved) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase.from("review_events").insert({
      business_id: businessId,
      rating: selectedRating,
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setPositiveSaved(true);
    setSaving(false);
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

  function handlePlatformClick(
    platform: string,
    url: string | null | undefined
  ) {
    if (!url) {
      return;
    }

    setSelectedPlatform(platform);

    window.open(url, "_blank");
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

      <div className="mt-10 grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setRating(star);

              if (star >= 4) {
                savePositiveRating(star);
              }
            }}
            className={`flex aspect-square items-center justify-center rounded-2xl border text-2xl font-black transition hover:-translate-y-1 ${
              rating === star
                ? "border-primary bg-blue-50 text-primary"
                : "border-border bg-background text-secondary hover:border-primary hover:bg-blue-50 hover:text-primary"
            }`}
          >
            <Star
              className={`h-7 w-7 ${
                rating && star <= rating
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>

      {isPositive && !selectedPlatform && (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <Star className="h-6 w-6 fill-primary" />
            </div>

            <div className="w-full">
              <h2 className="text-2xl font-black text-secondary">
                Glad you had a great experience.
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Choose where you would like to leave your public review.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {googleEnabled && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePlatformClick("Google", googleUrl)
                    }
                    className="rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Google
                  </button>
                )}

                {yelpEnabled && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePlatformClick("Yelp", yelpUrl)
                    }
                    className="rounded-2xl border border-border bg-white px-5 py-3 text-sm font-black text-secondary transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                  >
                    Yelp
                  </button>
                )}

                {facebookEnabled && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePlatformClick("Facebook", facebookUrl)
                    }
                    className="rounded-2xl border border-border bg-white px-5 py-3 text-sm font-black text-secondary transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                  >
                    Facebook
                  </button>
                )}
              </div>

              <div className="mt-5 text-sm text-muted-foreground">
                Your positive review was saved successfully.
              </div>
            </div>
          </div>
        </div>
      )}

      {isPositive && selectedPlatform && (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-secondary">
                Almost done.
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Your {selectedPlatform} review page opened in a new tab.
              </p>

              <p className="mt-3 leading-7 text-muted-foreground">
                After posting your review, you can safely close this page.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPrivateFeedback && (
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