// Re-export types from Drizzle schema
export type {
  User,
  NewUser,
  Friendship,
  NewFriendship,
  InviteLink,
  NewInviteLink,
  Title,
  NewTitle,
  Recommendation,
  NewRecommendation,
  Reaction,
  NewReaction,
  Comment,
  NewComment,
  WatchStatus,
  NewWatchStatus,
} from "@/lib/db/schema";

// Platform type
export type Platform =
  | "netflix"
  | "prime"
  | "disney"
  | "hulu"
  | "hbo"
  | "apple"
  | "peacock"
  | "paramount"
  | "crunchyroll"
  | "starz"
  | "tubi"
  | "youtube"
  | "mubi"
  | "other";

// Watch status type
export type WatchStatusType = "saved" | "watching" | "watched";

// Title type
export type TitleType = "movie" | "tv";

// Friendship status
export type FriendshipStatus = "pending" | "accepted";

// Feed item type for the UI
export interface FeedItem {
  id: string;
  titleId: string;
  posterUrl: string | null;
  titleName: string;
  titleYear: number | null;
  titleType: TitleType;
  userName: string;
  userAvatar: string | null;
  username: string;
  note: string | null;
  platform: Platform | null;
  platforms: string[];
  tags: string[];
  createdAt: string;
  reactionCount: number;
  commentCount: number;
  userHasLiked: boolean;
  userHasSaved: boolean;
  userHasWatched: boolean;
}

// Friend with user info
export interface FriendWithUser {
  id: string;
  friendId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  status: FriendshipStatus;
  createdAt: string;
}

// Extended types with relations (for UI components)
export interface RecommendationWithDetails {
  id: string;
  userId: string;
  titleId: string;
  note: string | null;
  tags: string[] | null;
  platform: Platform | null;
  watchUrl: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  title: {
    id: string;
    tmdbId: number;
    type: TitleType;
    name: string;
    year: number | null;
    posterUrl: string | null;
  };
  reactionCount: number;
  commentCount: number;
  userHasLiked: boolean;
}

export interface WatchStatusWithTitle {
  id: string;
  userId: string;
  titleId: string;
  status: WatchStatusType;
  createdAt: Date;
  title: {
    id: string;
    tmdbId: number;
    type: TitleType;
    name: string;
    year: number | null;
    posterUrl: string | null;
  };
}
