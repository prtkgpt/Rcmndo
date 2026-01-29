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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            rcmndo
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Get recommendations from
            <span className="text-primary"> friends you trust</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
            Stop scrolling through endless streaming catalogs. Share what you&apos;re watching
            and discover your next favorite show from people who actually know your taste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 text-lg font-semibold bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-lg font-semibold bg-secondary text-foreground rounded-xl border border-border hover:bg-card-hover transition-colors"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-muted text-center mb-12 max-w-xl mx-auto">
            Three simple steps to never wonder what to watch again
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect with friends</h3>
              <p className="text-muted">
                Invite your friends or find them by username. Build your circle of trusted recommenders.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share what you love</h3>
              <p className="text-muted">
                Recommend movies and shows you&apos;ve enjoyed. Add notes about why it&apos;s worth watching.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover your next watch</h3>
              <p className="text-muted">
                Browse your personalized feed of recommendations from people who get you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why rcmndo?</h2>
          <p className="text-muted text-center mb-12 max-w-xl mx-auto">
            Built for people tired of algorithm-driven recommendations
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Friends-only feed</h3>
              <p className="text-muted">
                No strangers, no influencers, no sponsored content. Just genuine recommendations from people in your life.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Know where to watch</h3>
              <p className="text-muted">
                See which streaming platform has each title. No more searching across five apps to find a show.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personal watchlist</h3>
              <p className="text-muted">
                Save recommendations for later and track what you&apos;ve already watched. Never lose a good suggestion again.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start conversations</h3>
              <p className="text-muted">
                React and comment on recommendations. Share your thoughts after watching something a friend suggested.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">&#34;</div>
          <p className="text-2xl text-foreground mb-6 italic">
            I used to spend 30 minutes scrolling Netflix before giving up. Now I just check what my friends recommended and actually watch something good.
          </p>
          <p className="text-muted">
            — Every person who&apos;s ever used a streaming service
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to find your next favorite show?</h2>
          <p className="text-xl text-muted mb-8">
            Join rcmndo and start getting recommendations that actually matter.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 text-lg font-semibold bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">rcmndo</span>
            <span className="text-muted">— recommendations from friends</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
