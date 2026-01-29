"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateEmail } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/feed";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await signIn("email", {
        email,
        callbackUrl: redirect,
        redirect: false,
      });
      setSubmitted(true);
    } catch {
      setEmailError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">rcmndo</h1>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Check your email</h2>
            <p className="text-muted mb-4">
              We sent a sign-in link to{" "}
              <span className="text-foreground font-medium">{email}</span>
            </p>
            <p className="text-sm text-muted">
              Click the link in the email to sign in to your account.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-sm text-primary hover:underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">rcmndo</h1>
          <p className="text-muted mt-2">Get recommendations from friends</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Sign in</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">
              {error === "OAuthAccountNotLinked"
                ? "This email is already associated with another account."
                : "An error occurred. Please try again."}
            </div>
          )}

          {/* Google sign-in */}
          <button
            type="button"
            onClick={() => {
              setGoogleLoading(true);
              signIn("google", { callbackUrl: redirect });
            }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-border rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            {emailError && <p className="text-sm text-error">{emailError}</p>}

            <Button type="submit" className="w-full" loading={loading}>
              Continue with Email
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
