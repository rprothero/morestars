import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewFlow from "./ReviewFlow";

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
        <ReviewFlow
          businessName={business.business_name}
          businessSlug={business.business_slug}
        />
      </div>
    </main>
  );
}