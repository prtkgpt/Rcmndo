"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { validateUsername } from "@/lib/utils";
import type { User } from "@/types/database";

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setName(data.name);
        setUsername(data.username);
        setOriginalUsername(data.username);
      }
      setLoading(false);
    };

    loadProfile();
  }, [supabase, router]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username === originalUsername) {
        setUsernameError("");
        return;
      }

      const validation = validateUsername(username);
      if (!validation.valid) {
        setUsernameError(validation.error || "Invalid username");
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
      } else {
        setUsernameError("");
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, originalUsername, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (usernameError) {
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        username: username.toLowerCase(),
      })
      .eq("id", profile?.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/profile");
    router.refresh();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <Header title="Edit Profile" backHref="/profile" />

      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <Input
              label="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
              error={usernameError}
            />
            {checkingUsername && (
              <p className="text-sm text-muted mt-1">Checking...</p>
            )}
          </div>

          <Input label="Email" value={profile?.email || ""} disabled />

          {error && <p className="text-sm text-error">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            loading={saving}
            disabled={!!usernameError || checkingUsername}
          >
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
