export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">
          MoreStars Setup
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-secondary">
          Set up your business
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          This is where businesses will add their business information, review
          links, platform settings, and QR review flow details.
        </p>
      </div>
    </main>
  );
}