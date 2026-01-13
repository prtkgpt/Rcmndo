"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

  const supabase = createClient();

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
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();

      setCheckingUsername(false);

      if (data) {
        setUsernameError("Username is already taken");
        setUsernameAvailable(false);
      } else {
        setUsernameError("");
        setUsernameAvailable(true);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, supabase]);

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email!,
      name: name.trim(),
      username: username.toLowerCase(),
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Check for invite code and create friendship
    const inviteCode = sessionStorage.getItem("inviteCode");
    if (inviteCode) {
      sessionStorage.removeItem("inviteCode");

      // Find the invite link
      const { data: invite } = await supabase
        .from("invite_links")
        .select("*")
        .eq("code", inviteCode)
        .gt("expires_at", new Date().toISOString())
        .is("used_by", null)
        .single();

      if (invite && invite.user_id !== user.id) {
        // Create friendship
        await supabase.from("friendships").insert({
          requester_id: invite.user_id,
          addressee_id: user.id,
          status: "accepted",
          invite_code: inviteCode,
        });

        // Mark invite as used
        await supabase
          .from("invite_links")
          .update({ used_by: user.id })
          .eq("id", invite.id);
      }
    }

    router.push("/feed");
    router.refresh();
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
