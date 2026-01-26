import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authConfig);

  if (session?.user) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-primary mb-4">rcmndo</h1>
          <p className="text-xl text-foreground mb-2">
            Share what you&apos;re watching
          </p>
          <p className="text-muted mb-8">
            Get personalized TV and movie recommendations from friends you trust
          </p>

          <div className="space-y-3">
            <Link
              href="/signup"
              className="block w-full px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="block w-full px-6 py-3 bg-secondary text-foreground font-medium rounded-xl border border-border hover:bg-card-hover transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="grid gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Friends-Only Feed</h3>
                <p className="text-sm text-muted">See recommendations only from people you actually trust</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Where to Watch</h3>
                <p className="text-sm text-muted">Know exactly which streaming platform has what you want</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Personal Watchlist</h3>
                <p className="text-sm text-muted">Save recommendations and track what you&apos;ve watched</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-muted">
        <p>Made for friends who love great shows</p>
      </footer>
    </div>
  );
}
