import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">rcmndo</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Check your email</h2>
          <p className="text-muted mb-4">
            We&apos;ve sent you a sign-in link. Click the link in the email to continue.
          </p>
          <p className="text-sm text-muted mb-6">
            If you don&apos;t see it, check your spam folder.
          </p>

          <Link href="/login">
            <Button variant="secondary" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
