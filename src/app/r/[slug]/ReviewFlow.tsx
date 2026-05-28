"use client";

import { useState } from "react";
import {
  CheckCircle2,
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

type FlowStep = "rating" | "service" | "helper" | "positive" | "private";

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
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
      setStep("positive");
      savePositiveRating();
      return;
    }

    setStep("private");
  }

  async function savePositiveRating() {
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
    });

    if (error) {
      setErrorMessage(error.message);
    }

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

      {step === "positive" && !selectedPlatform && (
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
                    onClick={() => handlePlatformClick("Google", googleUrl)}
                    className="rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Google
                  </button>
                )}

                {yelpEnabled && (
                  <button
                    type="button"
                    onClick={() => handlePlatformClick("Yelp", yelpUrl)}
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
                {saving
                  ? "Saving your rating..."
                  : "Your positive review was saved successfully."}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "positive" && selectedPlatform && (
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