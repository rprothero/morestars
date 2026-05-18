import Link from "next/link";
import { login } from "./actions";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-6 py-10 text-[#1E293B]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F33] text-xl font-bold text-white shadow-lg">
            ★
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Log in to your MoreStars dashboard.
          </p>
        </div>

        <form
          action={login}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="text-sm font-medium">Email</label>

            <input
              type="email"
              name="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Password</label>

            <input
              type="password"
              name="password"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
              placeholder="Enter your password"
            />
          </div>

          {params.error ? (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {params.error}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-[#2563EB] px-4 py-3 font-medium text-white transition hover:bg-[#1D4ED8]"
          >
            Log in
          </button>

          <p className="mt-5 text-center text-sm text-[#64748B]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-[#2563EB]">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}