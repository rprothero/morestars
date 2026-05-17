"use client";

import { useState } from "react";
import { MessageSquareHeart, Star } from "lucide-react";

type ReviewFlowProps = {
  businessName: string;
  businessSlug: string;
};

export default function ReviewFlow({
  businessName,
  businessSlug,
}: ReviewFlowProps) {
  const [rating, setRating] = useState<number | null>(null);

  const isPositive = rating !== null && rating >= 4;
  const isPrivateFeedback = rating !== null && rating <= 3;

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
            onClick={() => setRating(star)}
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

      {isPositive && (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
              <Star className="h-6 w-6 fill-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-secondary">
                Glad you had a great experience.
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Next, we’ll help you write a quick review and choose where to
                share it.
              </p>

              <button className="mt-5 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
                Continue
              </button>
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

            <div>
              <h2 className="text-2xl font-black text-secondary">
                Thanks for letting us know.
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                Your feedback can help {businessName} understand what happened
                and improve the experience.
              </p>

              <textarea
                placeholder="What could have been better?"
                className="mt-5 min-h-32 w-full rounded-2xl border border-border bg-white px-5 py-4 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100"
              />

              <button className="mt-5 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
                Send Private Feedback
              </button>
            </div>
          </div>
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