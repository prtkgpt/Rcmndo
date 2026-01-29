"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { XMarkIcon, CheckIcon } from "@/components/ui/icons";

interface SuggestModalProps {
  titleId: string;
  titleName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FriendUser {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
}

interface FriendItem {
  friendshipId: string;
  user: FriendUser;
}

export function SuggestModal({ titleId, titleName, isOpen, onClose }: SuggestModalProps) {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    async function fetchFriends() {
      setLoading(true);
      try {
        const res = await fetch("/api/friendships");
        if (!res.ok) throw new Error("Failed to fetch friends");
        const data = await res.json();
        setFriends(data.accepted || []);
      } catch {
        setFriends([]);
      }
      setLoading(false);
    }

    fetchFriends();
  }, [isOpen]);

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedFriends.size === 0) return;

    setSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const promises = Array.from(selectedFriends).map((recipientId) =>
        fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId,
            titleId,
            note: note.trim() || undefined,
          }),
        })
      );

      const results = await Promise.all(promises);
      const allOk = results.every((r) => r.ok);

      if (allOk) {
        setStatus("success");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatus("error");
        setErrorMessage("Some suggestions failed to send. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold truncate">Suggest to a Friend</h2>
            <p className="text-sm text-muted truncate">{titleName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-foreground transition-colors flex-shrink-0 ml-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckIcon className="w-12 h-12 text-success mb-3" />
              <p className="text-lg font-medium">Sent!</p>
              <p className="text-sm text-muted mt-1">
                Your suggestion has been sent to {selectedFriends.size}{" "}
                {selectedFriends.size === 1 ? "friend" : "friends"}.
              </p>
            </div>
          ) : (
            <>
              {/* Friends list */}
              <div className="mb-4">
                <p className="text-sm font-medium text-muted mb-2">Select friends</p>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : friends.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">
                    No friends found. Add some friends first!
                  </p>
                ) : (
                  <div className="space-y-1">
                    {friends.map((friend) => (
                      <button
                        key={friend.user.id}
                        onClick={() => toggleFriend(friend.user.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                          selectedFriends.has(friend.user.id)
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-secondary border border-transparent"
                        }`}
                      >
                        <Avatar
                          src={friend.user.avatar_url}
                          name={friend.user.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-sm truncate">
                            {friend.user.name}
                          </p>
                          <p className="text-xs text-muted truncate">
                            @{friend.user.username}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedFriends.has(friend.user.id)
                              ? "bg-primary border-primary"
                              : "border-border"
                          }`}
                        >
                          {selectedFriends.has(friend.user.id) && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="mb-4">
                <label className="text-sm font-medium text-muted mb-1.5 block">
                  Add a note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 240))}
                  placeholder="You should totally watch this..."
                  rows={3}
                  maxLength={240}
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <p className="text-xs text-muted text-right mt-1">
                  {note.length}/240
                </p>
              </div>

              {/* Error */}
              {status === "error" && (
                <p className="text-sm text-error mb-4">{errorMessage}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {status !== "success" && (
          <div className="p-4 border-t border-border">
            <Button
              className="w-full"
              onClick={handleSubmit}
              loading={submitting}
              disabled={selectedFriends.size === 0 || loading}
            >
              Send to {selectedFriends.size > 0 ? `${selectedFriends.size} ` : ""}
              {selectedFriends.size === 1 ? "Friend" : "Friends"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
