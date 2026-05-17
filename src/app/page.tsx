import Link from "next/link";
import {
  Star,
  QrCode,
  MessageSquareHeart,
  BarChart3,
  MousePointerClick,
  ClipboardCheck,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#151515]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">MoreStars.co</div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[#4b4b4b] md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>

          <Link
            href="/signup"
            className="rounded-full bg-[#151515] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2a2a2a]"
          >
            Get Started
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ded6c8] bg-white/70 px-4 py-2 text-sm font-semibold text-[#6b5b3f]">
              <Star className="h-4 w-4 fill-current" />
              QR review links for local businesses
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
              Help happy customers leave more public reviews.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#555] md:text-xl">
              MoreStars.co helps businesses collect customer ratings, guide happy
              customers to public review platforms, and capture private feedback
              before small problems become public complaints.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-[#151515] px-7 py-4 text-center text-sm font-bold text-white shadow-lg transition hover:bg-[#2a2a2a]"
              >
                Start collecting reviews
              </Link>

              <a
                href="#how-it-works"
                className="rounded-full border border-[#d8d0c2] bg-white px-7 py-4 text-center text-sm font-bold text-[#151515] shadow-sm transition hover:bg-[#fbfaf7]"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-[#ded6c8] bg-white/80 p-4">
                <div className="font-black">QR</div>
                <div className="mt-1 text-[#666]">Scan-to-review</div>
              </div>
              <div className="rounded-2xl border border-[#ded6c8] bg-white/80 p-4">
                <div className="font-black">4–5★</div>
                <div className="mt-1 text-[#666]">Public review assist</div>
              </div>
              <div className="rounded-2xl border border-[#ded6c8] bg-white/80 p-4">
                <div className="font-black">1–3★</div>
                <div className="mt-1 text-[#666]">Private feedback</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-[#f1c75b]/40 blur-2xl" />
            <div className="absolute -bottom-8 -right-6 h-40 w-40 rounded-full bg-[#9bc6ff]/40 blur-3xl" />

            <div className="relative rounded-[2rem] border border-[#ded6c8] bg-white p-5 shadow-2xl">
              <div className="rounded-[1.5rem] bg-[#151515] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/60">Today</div>
                    <div className="text-2xl font-black">Review Activity</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-3xl font-black">24</div>
                    <div className="mt-1 text-sm text-white/60">
                      Interactions
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-3xl font-black">18</div>
                    <div className="mt-1 text-sm text-white/60">
                      Positive ratings
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white p-4 text-[#151515]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#f7f4ee] p-3">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-black">ABC Plumbing</div>
                      <div className="text-sm text-[#666]">
                        morestars.co/r/abc-plumbing
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/10 p-3">
                      <MessageSquareHeart className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold">Private feedback captured</div>
                      <div className="text-sm text-white/60">
                        Customer submitted feedback directly to dashboard.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-[#ded6c8] bg-white/65 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-[#9b7b2f]">
              How it works
            </div>

            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              A simple review flow your customers can actually complete.
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#555]">
              Your business gets a unique review link and QR code. Customers scan,
              rate their experience, and MoreStars routes the next step based on
              the rating they choose.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="rounded-[2rem] border border-[#ded6c8] bg-[#f7f4ee] p-6 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <QrCode className="h-7 w-7" />
              </div>
              <div className="text-sm font-black text-[#9b7b2f]">STEP 01</div>
              <h3 className="mt-2 text-2xl font-black">Customer scans</h3>
              <p className="mt-3 leading-7 text-[#555]">
                Place your QR code on signs, receipts, front desks, menus, or
                follow-up messages so customers can open your review flow fast.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#ded6c8] bg-[#f7f4ee] p-6 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Star className="h-7 w-7" />
              </div>
              <div className="text-sm font-black text-[#9b7b2f]">STEP 02</div>
              <h3 className="mt-2 text-2xl font-black">They rate you</h3>
              <p className="mt-3 leading-7 text-[#555]">
                Happy customers get help sharing on public platforms. Lower
                ratings are invited to send private feedback directly to you.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#ded6c8] bg-[#f7f4ee] p-6 shadow-sm">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <MousePointerClick className="h-7 w-7" />
              </div>
              <div className="text-sm font-black text-[#9b7b2f]">STEP 03</div>
              <h3 className="mt-2 text-2xl font-black">Track activity</h3>
              <p className="mt-3 leading-7 text-[#555]">
                See review assists, platform clicks, confirmed posted reviews,
                and private feedback from your business dashboard.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-[#ded6c8] bg-[#151515] p-6 text-white shadow-xl md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/10 p-3">
                  <ClipboardCheck className="h-6 w-6" />
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
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-[#151515] transition hover:bg-[#f7f4ee]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}