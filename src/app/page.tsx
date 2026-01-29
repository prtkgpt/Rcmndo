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
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Gradient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            rcmndo
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-white/90 transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Now in beta — join free
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Stop asking
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              &quot;what should I watch?&quot;
            </span>
          </h1>

          <p className="text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Get movie and TV recommendations from your actual friends.
            No algorithms. No strangers. Just people who know your taste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="group px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-all shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            >
              Get started free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-lg font-semibold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
            >
              I have an account
            </Link>
          </div>
        </div>

        {/* Floating elements */}
        <div className="hidden md:block absolute top-32 left-20 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>🍿</div>
        <div className="hidden md:block absolute top-48 right-24 text-4xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🎬</div>
        <div className="hidden md:block absolute bottom-20 left-32 text-4xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>📺</div>
      </section>

      {/* Social proof */}
      <section className="relative py-12 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest mb-6">Trusted by people who hate scrolling Netflix</p>
          <div className="flex flex-wrap justify-center gap-8 text-white/20 text-2xl font-bold">
            <span>Netflix</span>
            <span>HBO</span>
            <span>Prime</span>
            <span>Disney+</span>
            <span>Apple TV+</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Three steps to your
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">next favorite show</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Add your friends", desc: "Invite people whose taste you trust. That friend who always knows what's good? Yeah, them.", icon: "👯" },
              { num: "02", title: "Share what slaps", desc: "Recommend shows you loved. Add notes like \"watch this immediately\" or \"skip episode 4\".", icon: "🔥" },
              { num: "03", title: "Discover gold", desc: "Your feed shows only recs from friends. No sponsored content. No algorithm noise.", icon: "✨" },
            ].map((step) => (
              <div key={step.num} className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-white/20 transition-all">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="text-purple-400 text-sm font-mono mb-2">{step.num}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Built different
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Friends-only feed</h3>
              <p className="text-white/50 leading-relaxed">
                No influencers. No ads. No &quot;because you watched...&quot; suggestions from a robot. Just your people.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-white mb-3">Where to watch</h3>
              <p className="text-white/50 leading-relaxed">
                See which streaming service has it. Stop opening 5 apps to find where that show lives.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-3">Personal notes</h3>
              <p className="text-white/50 leading-relaxed">
                &quot;The first 3 episodes are slow but trust me.&quot; Context that actually helps.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-3">React & discuss</h3>
              <p className="text-white/50 leading-relaxed">
                Watched something your friend recommended? Let them know. Start the conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
            <div className="absolute -top-4 left-12 text-6xl text-purple-400/50">&ldquo;</div>
            <p className="text-2xl md:text-3xl text-white font-medium mb-8 leading-relaxed">
              I used to spend 30 minutes browsing Netflix, give up, and rewatch The Office.
              Now I actually watch new stuff because my friends have good taste.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <p className="text-white font-semibold">Everyone</p>
                <p className="text-white/50 text-sm">Literally everyone with streaming</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to actually
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              watch something good?
            </span>
          </h2>
          <p className="text-xl text-white/50 mb-10">
            Join rcmndo. It&apos;s free. Your friends are waiting.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-white text-black rounded-full hover:bg-white/90 transition-all"
          >
            Create your account
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">rcmndo</span>
            <span className="text-white/30">•</span>
            <span className="text-white/30 text-sm">recs from friends</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/30">
            <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
