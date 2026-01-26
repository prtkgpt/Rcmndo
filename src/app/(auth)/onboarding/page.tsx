"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateUsername } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(false);

  // Check username availability with debounce
  useEffect(() => {
    const checkUsername = async () => {
      if (!username) {
        setUsernameError("");
        setUsernameAvailable(false);
        return;
      }

      const validation = validateUsername(username);
      if (!validation.valid) {
        setUsernameError(validation.error || "Invalid username");
        setUsernameAvailable(false);
        return;
      }

      setCheckingUsername(true);

      try {
        const response = await fetch(
          `/api/users/check-username?username=${encodeURIComponent(username)}`
        );
        const data = await response.json();

        setCheckingUsername(false);

        if (data.available) {
          setUsernameError("");
          setUsernameAvailable(true);
        } else {
          setUsernameError("Username is already taken");
          setUsernameAvailable(false);
        }
      } catch {
        setCheckingUsername(false);
        setUsernameError("Error checking username");
        setUsernameAvailable(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!usernameAvailable) {
      return;
    }

    setLoading(true);

    try {
      // Get invite code from session storage
      const inviteCode = sessionStorage.getItem("inviteCode");
      sessionStorage.removeItem("inviteCode");

      const response = await fetch("/api/users/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.toLowerCase(),
          inviteCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome to rcmndo</h1>
          <p className="text-muted mt-2">Let&apos;s set up your profile</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <div>
              <Input
                label="Username"
                placeholder="johndoe"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                error={usernameError}
              />
              {checkingUsername && (
                <p className="text-sm text-muted mt-1">Checking...</p>
              )}
              {usernameAvailable && !checkingUsername && (
                <p className="text-sm text-success mt-1">Username is available</p>
              )}
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!name.trim() || !usernameAvailable}
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
