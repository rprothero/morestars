import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("business_slug", slug)
    .maybeSingle();

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-primary">
              MoreStars Review Flow
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-secondary">
              {business.business_name}
            </h1>

            <p className="mt-4 leading-7 text-muted-foreground">
              How was your experience with {business.business_name}?
            </p>
          </div>

          <div className="mt-10 grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-background text-2xl font-black text-secondary transition hover:-translate-y-1 hover:border-primary hover:bg-blue-50 hover:text-primary"
              >
                {rating}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-background p-5">
            <div className="text-sm font-bold text-muted-foreground">
              Review Link
            </div>

            <div className="mt-2 font-semibold text-secondary">
              morestars.co/r/{business.business_slug}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}