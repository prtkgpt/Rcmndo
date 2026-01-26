"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  UsersIcon,
  CheckIcon,
  XMarkIcon,
  CopyIcon,
  ShareIcon,
} from "@/components/ui/icons";
import type { InviteLink } from "@/types/database";

interface FriendItem {
  friendshipId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
  };
}

interface FriendsContentProps {
  userId: string;
  friends: FriendItem[];
  pendingReceived: FriendItem[];
  pendingSent: FriendItem[];
  inviteLinks: InviteLink[];
}

export function FriendsContent({
  friends: initialFriends,
  pendingReceived: initialPending,
  pendingSent: initialSent,
  inviteLinks: initialInvites,
}: FriendsContentProps) {
  const router = useRouter();
  const [friends, setFriends] = useState(initialFriends);
  const [pendingReceived, setPendingReceived] = useState(initialPending);
  const [inviteLinks, setInviteLinks] = useState(initialInvites);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [joiningWithCode, setJoiningWithCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateInvite = async () => {
    setCreatingInvite(true);
    setError("");

    try {
      const response = await fetch("/api/invite-links", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create invite");
        setCreatingInvite(false);
        return;
      }

      setInviteLinks([data, ...inviteLinks]);
    } catch {
      setError("Something went wrong");
    }

    setCreatingInvite(false);
  };

  const handleJoinWithCode = async () => {
    if (!codeInput.trim()) return;

    setJoiningWithCode(true);
    setError("");

    try {
      const response = await fetch("/api/friendships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid or expired invite code");
        setJoiningWithCode(false);
        return;
      }

      setCodeInput("");
      router.refresh();
    } catch {
      setError("Something went wrong");
    }

    setJoiningWithCode(false);
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await fetch("/api/friendships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId, action: "accept" }),
      });

      const accepted = pendingReceived.find((p) => p.friendshipId === friendshipId);
      if (accepted) {
        setFriends([accepted, ...friends]);
        setPendingReceived(pendingReceived.filter((p) => p.friendshipId !== friendshipId));
      }
    } catch {
      // Handle error silently
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await fetch("/api/friendships", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });

      setPendingReceived(pendingReceived.filter((p) => p.friendshipId !== friendshipId));
    } catch {
      // Handle error silently
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await fetch("/api/friendships", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });

      setFriends(friends.filter((f) => f.friendshipId !== friendshipId));
    } catch {
      // Handle error silently
    }
  };

  const copyInviteLink = async (code: string) => {
    const url = `${window.location.origin}/signup?invite=${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const shareInvite = async (code: string) => {
    const url = `${window.location.origin}/signup?invite=${code}`;
    if (navigator.share) {
      await navigator.share({
        title: "Join me on rcmndo",
        text: "Get movie & TV recommendations from friends you trust",
        url,
      });
    } else {
      copyInviteLink(code);
    }
  };

  return (
    <div>
      <Header title="Friends" backHref="/profile" />

      <div className="px-4 py-4 space-y-6">
        {/* Invite section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Invite Friends</h3>
          <Card className="p-4 space-y-4">
            {/* Create new invite */}
            <div>
              <p className="text-sm text-muted mb-3">
                Create an invite link to share with friends
              </p>
              <Button
                onClick={handleCreateInvite}
                loading={creatingInvite}
                className="w-full"
              >
                Create Invite Link
              </Button>
            </div>

            {/* Active invite links */}
            {inviteLinks.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Your invite codes:</p>
                {inviteLinks.slice(0, 3).map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-2 bg-secondary rounded-lg"
                  >
                    <code className="text-sm font-mono">{invite.code}</code>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyInviteLink(invite.code)}
                        className="p-1.5 text-muted hover:text-foreground transition-colors"
                        title="Copy link"
                      >
                        {copiedCode === invite.code ? (
                          <CheckIcon className="w-4 h-4 text-success" />
                        ) : (
                          <CopyIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => shareInvite(invite.code)}
                        className="p-1.5 text-muted hover:text-foreground transition-colors"
                        title="Share"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Join with code */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted mb-3">
                Have an invite code? Enter it below
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <Button
                  onClick={handleJoinWithCode}
                  loading={joiningWithCode}
                  disabled={!codeInput.trim()}
                >
                  Join
                </Button>
              </div>
              {error && <p className="text-sm text-error mt-2">{error}</p>}
            </div>
          </Card>
        </div>

        {/* Pending requests */}
        {pendingReceived.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Friend Requests</h3>
            <div className="space-y-2">
              {pendingReceived.map((request) => (
                <Card key={request.friendshipId} className="flex items-center gap-3 p-3">
                  <Avatar
                    src={request.user.avatar_url}
                    name={request.user.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{request.user.name}</p>
                    <p className="text-sm text-muted truncate">
                      @{request.user.username}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.friendshipId)}
                      className="p-2 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.friendshipId)}
                      className="p-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pending sent */}
        {initialSent.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Sent Requests</h3>
            <div className="space-y-2">
              {initialSent.map((request) => (
                <Card key={request.friendshipId} className="flex items-center gap-3 p-3">
                  <Avatar
                    src={request.user.avatar_url}
                    name={request.user.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{request.user.name}</p>
                    <p className="text-sm text-muted truncate">
                      @{request.user.username}
                    </p>
                  </div>
                  <span className="text-sm text-muted">Pending</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Friends ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="w-8 h-8" />}
              title="No friends yet"
              description="Create an invite link and share it with friends"
            />
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <Card key={friend.friendshipId} className="flex items-center gap-3 p-3">
                  <Avatar
                    src={friend.user.avatar_url}
                    name={friend.user.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{friend.user.name}</p>
                    <p className="text-sm text-muted truncate">
                      @{friend.user.username}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.friendshipId)}
                    className="p-2 text-muted hover:text-error transition-colors"
                    title="Remove friend"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
