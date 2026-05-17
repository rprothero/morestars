import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareHeart,
  MousePointerClick,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_75%_20%,rgba(20,184,166,0.18),transparent_28%),linear-gradient(180deg,#F8FBFF_0%,#EEF5FF_100%)]" />

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
          <header className="flex items-center justify-between rounded-2xl border border-border bg-white/80 px-4 py-3 shadow-sm backdrop-blur md:px-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-white shadow-lg shadow-blue-950/10">
                <Star className="h-5 w-5 fill-primary text-primary" />
              </div>
              <div className="text-xl font-black tracking-tight text-secondary">
                MoreStars
              </div>
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
              <a className="transition hover:text-primary" href="#how-it-works">
                How it works
              </a>
              <a className="transition hover:text-primary" href="#pricing">
                Pricing
              </a>
              <a className="transition hover:text-primary" href="#faq">
                FAQ
              </a>
            </nav>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-black text-primary shadow-sm">
                <Sparkles className="h-4 w-4 text-accent" />
                QR review links for local businesses
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-secondary md:text-7xl">
                Turn happy customers into more public reviews.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                MoreStars helps small businesses collect customer ratings, guide
                happy customers toward public review platforms, and capture
                private feedback before issues go unnoticed.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 text-sm font-black text-primary-foreground shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Start collecting reviews
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-7 py-4 text-sm font-black text-secondary shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-primary"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 text-sm sm:grid-cols-3">
                {[
                  ["QR", "Scan-to-review"],
                  ["4–5★", "Review assists"],
                  ["1–3★", "Private feedback"],
                ].map(([label, description]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-white/85 p-4 shadow-sm"
                  >
                    <div className="font-black text-secondary">{label}</div>
                    <div className="mt-1 text-muted-foreground">
                      {description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-10 -right-8 h-44 w-44 rounded-full bg-accent/25 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur">
                <div className="rounded-[1.5rem] bg-secondary p-5 text-white shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white/60">Live dashboard</div>
                      <div className="text-2xl font-black">Review Activity</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="text-3xl font-black">24</div>
                      <div className="mt-1 text-sm text-white/60">
                        Interactions
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <div className="text-3xl font-black">18</div>
                      <div className="mt-1 text-sm text-white/60">
                        Positive ratings
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4 text-secondary shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-50 p-3 text-primary">
                        <QrCode className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-black">ABC Plumbing</div>
                        <div className="text-sm text-muted-foreground">
                          morestars.co/r/abc-plumbing
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white/10 p-3">
                        <MessageSquareHeart className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-bold">
                          Private feedback captured
                        </div>
                        <div className="text-sm text-white/60">
                          Customer submitted feedback directly to dashboard.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/70">
                    <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_20px_rgba(20,184,166,0.9)]" />
                    MoreStars is actively tracking review activity.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-primary">
              How it works
            </div>

            <h2 className="text-4xl font-black tracking-tight text-secondary md:text-5xl">
              A simple review flow your customers can actually complete.
            </h2>

            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Your business gets a unique review link and QR code. Customers scan,
              rate their experience, and MoreStars routes the next step based on
              the rating they choose.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: QrCode,
                step: "STEP 01",
                title: "Customer scans",
                text: "Place your QR code on signs, receipts, front desks, menus, or follow-up messages so customers can open your review flow fast.",
              },
              {
                icon: Star,
                step: "STEP 02",
                title: "They rate you",
                text: "Happy customers get help sharing on public platforms. Lower ratings are invited to send private feedback directly to you.",
              },
              {
                icon: MousePointerClick,
                step: "STEP 03",
                title: "Track activity",
                text: "See review assists, platform clicks, confirmed posted reviews, and private feedback from your business dashboard.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-[2rem] border border-border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/5"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="text-sm font-black text-primary">
                  {item.step}
                </div>
                <h3 className="mt-2 text-2xl font-black text-secondary">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-border bg-secondary p-6 text-white shadow-xl shadow-blue-950/10 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/10 p-3">
                  <ClipboardCheck className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">
                    Built to collect feedback first.
                  </h3>
                  <p className="mt-2 max-w-3xl leading-7 text-white/70">
                    MoreStars is positioned around feedback collection and review
                    assistance — not guarantees, fake reviews, or blocking public
                    customer opinions.
                  </p>
                </div>
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-secondary transition hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Compliance-aware wording",
                text: "The flow focuses on feedback collection and review assistance, not review guarantees.",
              },
              {
                icon: TrendingUp,
                title: "Built for growth",
                text: "Simple tools help owners see review activity, platform clicks, and feedback patterns.",
              },
              {
                icon: CheckCircle2,
                title: "Hands-off after setup",
                text: "Businesses can share one QR code or link and let the system guide the customer flow.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-border bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-secondary">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}