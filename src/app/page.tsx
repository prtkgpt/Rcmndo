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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#FF385C]">
            rcmndo
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-semibold bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-all shadow-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/80 to-white pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-full text-sm text-[#FF385C] font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF385C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF385C]"></span>
            </span>
            Now in beta &mdash; join free
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.08] tracking-tight">
            Stop scrolling.
            <br />
            <span className="text-[#FF385C]">
              Start watching.
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Get movie and TV recommendations from people you actually trust &mdash;
            your friends. No algorithms. No strangers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="group px-8 py-4 text-lg font-semibold bg-[#FF385C] text-white rounded-xl hover:bg-[#E31C5F] transition-all shadow-lg shadow-rose-200"
            >
              Get started free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 px-4 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-6">Works with your favorite platforms</p>
          <div className="flex flex-wrap justify-center gap-8 text-gray-300 text-2xl font-bold">
            <span>Netflix</span>
            <span>HBO</span>
            <span>Prime</span>
            <span>Disney+</span>
            <span>Apple TV+</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF385C] text-sm font-semibold uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Three steps to your
              <br />
              next favorite show
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Add your friends", desc: "Invite people whose taste you trust. That friend who always knows what's good? Yeah, them.", icon: "👯" },
              { num: "02", title: "Share what slaps", desc: "Recommend shows you loved. Add notes like \"watch this immediately\" or \"skip episode 4\".", icon: "🔥" },
              { num: "03", title: "Discover gold", desc: "Your feed shows only recs from friends. No sponsored content. No algorithm noise.", icon: "✨" },
            ].map((step) => (
              <div key={step.num} className="group relative p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="text-[#FF385C] text-sm font-mono font-semibold mb-2">{step.num}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF385C] text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Built different
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-2xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Friends-only feed</h3>
              <p className="text-gray-500 leading-relaxed">
                No influencers. No ads. No &quot;because you watched...&quot; suggestions from a robot. Just your people.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Where to watch</h3>
              <p className="text-gray-500 leading-relaxed">
                See which streaming service has it. Stop opening 5 apps to find where that show lives.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal notes</h3>
              <p className="text-gray-500 leading-relaxed">
                &quot;The first 3 episodes are slow but trust me.&quot; Context that actually helps.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-2xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">React & discuss</h3>
              <p className="text-gray-500 leading-relaxed">
                Watched something your friend recommended? Let them know. Start the conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative p-10 md:p-12 rounded-2xl bg-rose-50 border border-rose-100">
            <div className="absolute -top-4 left-10 text-6xl text-[#FF385C]/30">&ldquo;</div>
            <p className="text-2xl md:text-3xl text-gray-900 font-medium mb-8 leading-relaxed">
              I used to spend 30 minutes browsing Netflix, give up, and rewatch The Office.
              Now I actually watch new stuff because my friends have good taste.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <p className="text-gray-900 font-semibold">Everyone</p>
                <p className="text-gray-500 text-sm">Literally everyone with streaming</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to actually
            <br />
            watch something good?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join rcmndo. It&apos;s free. Your friends are waiting.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-[#FF385C] text-white rounded-xl hover:bg-[#E31C5F] transition-all shadow-lg"
          >
            Create your account
            <span>&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#FF385C]">rcmndo</span>
            <span className="text-gray-300">&middot;</span>
            <span className="text-gray-400 text-sm">recs from friends</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <Link href="/login" className="hover:text-gray-900 transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-gray-900 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
