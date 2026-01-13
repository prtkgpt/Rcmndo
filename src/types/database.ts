export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Platform =
  | "netflix"
  | "prime"
  | "disney"
  | "hulu"
  | "hbo"
  | "apple"
  | "peacock"
  | "paramount"
  | "other";

export type FriendshipStatus = "pending" | "accepted";

export type WatchStatusType = "saved" | "watching" | "watched";

export type TitleType = "movie" | "tv";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: FriendshipStatus;
          invite_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: FriendshipStatus;
          invite_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: FriendshipStatus;
          invite_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invite_links: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          expires_at: string;
          used_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string;
          expires_at: string;
          used_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: string;
          expires_at?: string;
          used_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      titles: {
        Row: {
          id: string;
          tmdb_id: number;
          type: TitleType;
          name: string;
          year: number | null;
          poster_url: string | null;
          backdrop_url: string | null;
          overview: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tmdb_id: number;
          type: TitleType;
          name: string;
          year?: number | null;
          poster_url?: string | null;
          backdrop_url?: string | null;
          overview?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tmdb_id?: number;
          type?: TitleType;
          name?: string;
          year?: number | null;
          poster_url?: string | null;
          backdrop_url?: string | null;
          overview?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          title_id: string;
          note: string | null;
          tags: string[];
          platform: Platform | null;
          watch_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title_id: string;
          note?: string | null;
          tags?: string[];
          platform?: Platform | null;
          watch_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title_id?: string;
          note?: string | null;
          tags?: string[];
          platform?: Platform | null;
          watch_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          user_id: string;
          recommendation_id: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recommendation_id: string;
          type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recommendation_id?: string;
          type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          recommendation_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recommendation_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recommendation_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      watch_status: {
        Row: {
          id: string;
          user_id: string;
          title_id: string;
          status: WatchStatusType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title_id: string;
          status?: WatchStatusType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title_id?: string;
          status?: WatchStatusType;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_friends: {
        Args: { p_user_id: string };
        Returns: {
          id: string;
          email: string;
          name: string;
          username: string;
          avatar_url: string | null;
        }[];
      };
      get_friend_ids: {
        Args: { p_user_id: string };
        Returns: { friend_id: string }[];
      };
    };
    Enums: {
      platform_type: Platform;
      friendship_status: FriendshipStatus;
      watch_status_type: WatchStatusType;
      title_type: TitleType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier usage
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Friendship = Database["public"]["Tables"]["friendships"]["Row"];
export type FriendshipInsert = Database["public"]["Tables"]["friendships"]["Insert"];
export type FriendshipUpdate = Database["public"]["Tables"]["friendships"]["Update"];

export type InviteLink = Database["public"]["Tables"]["invite_links"]["Row"];
export type InviteLinkInsert = Database["public"]["Tables"]["invite_links"]["Insert"];

export type Title = Database["public"]["Tables"]["titles"]["Row"];
export type TitleInsert = Database["public"]["Tables"]["titles"]["Insert"];
export type TitleUpdate = Database["public"]["Tables"]["titles"]["Update"];

export type Recommendation = Database["public"]["Tables"]["recommendations"]["Row"];
export type RecommendationInsert = Database["public"]["Tables"]["recommendations"]["Insert"];
export type RecommendationUpdate = Database["public"]["Tables"]["recommendations"]["Update"];

export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type ReactionInsert = Database["public"]["Tables"]["reactions"]["Insert"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type CommentUpdate = Database["public"]["Tables"]["comments"]["Update"];

export type WatchStatus = Database["public"]["Tables"]["watch_status"]["Row"];
export type WatchStatusInsert = Database["public"]["Tables"]["watch_status"]["Insert"];
export type WatchStatusUpdate = Database["public"]["Tables"]["watch_status"]["Update"];

// Extended types with relations
export type RecommendationWithDetails = Recommendation & {
  user: User;
  title: Title;
  reactions: Reaction[];
  comments: Comment[];
  reaction_count: number;
  comment_count: number;
  user_has_liked: boolean;
};

export type TitleWithRecommendations = Title & {
  recommendations: RecommendationWithDetails[];
};

export type WatchStatusWithTitle = WatchStatus & {
  title: Title;
};
