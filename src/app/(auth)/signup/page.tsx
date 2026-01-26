"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateEmail } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

function SignupContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Store invite code in session storage for onboarding
  useEffect(() => {
    if (inviteCode) {
      sessionStorage.setItem("inviteCode", inviteCode);
    }
  }, [inviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await signIn("email", {
        email,
        callbackUrl: "/onboarding",
        redirect: false,
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
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
              Click the link in the email to create your account.
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
          <p className="text-muted mt-2">
            {inviteCode
              ? "You've been invited to join!"
              : "Share what you're watching"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />

            {error && <p className="text-sm text-error">{error}</p>}

            <Button type="submit" className="w-full" loading={loading}>
              Continue
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignupFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent />
    </Suspense>
  );
}
