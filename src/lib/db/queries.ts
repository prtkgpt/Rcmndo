import { db, eq, and, or, desc, inArray, sql } from "./index";
import {
  users,
  friendships,
  inviteLinks,
  titles,
  recommendations,
  reactions,
  comments,
  watchStatus,
  type User,
  type Title,
  type NewTitle,
  type NewUser,
  type NewRecommendation,
  type NewWatchStatus,
} from "./schema";
import type { Platform, FeedItem, FriendWithUser } from "@/types/database";

// ============ USER QUERIES ============

export async function getUserById(userId: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
  return result[0] || null;
}

export async function createUser(data: NewUser): Promise<User> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUser(userId: string, data: Partial<NewUser>): Promise<User | null> {
  const result = await db.update(users).set(data).where(eq(users.id, userId)).returning();
  return result[0] || null;
}

// ============ FRIEND QUERIES ============

export async function getFriendIds(userId: string): Promise<string[]> {
  const result = await db
    .select({
      friendId: sql<string>`
        CASE
          WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId}
          ELSE ${friendships.requesterId}
        END
      `,
    })
    .from(friendships)
    .where(
      and(
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId)
        ),
        eq(friendships.status, "accepted")
      )
    );
  return result.map((r) => r.friendId);
}

export async function getFriendsWithDetails(userId: string): Promise<FriendWithUser[]> {
  // Get all accepted friendships where user is involved
  const friendshipsList = await db
    .select()
    .from(friendships)
    .where(
      and(
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId)
        ),
        eq(friendships.status, "accepted")
      )
    );

  if (friendshipsList.length === 0) return [];

  // Get friend IDs
  const friendIds = friendshipsList.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId
  );

  // Get friend details
  const friendUsers = await db
    .select()
    .from(users)
    .where(inArray(users.id, friendIds));

  return friendshipsList.map((f) => {
    const friendId = f.requesterId === userId ? f.addresseeId : f.requesterId;
    const friend = friendUsers.find((u) => u.id === friendId);
    return {
      id: f.id,
      friendId,
      name: friend?.name || "",
      username: friend?.username || "",
      avatarUrl: friend?.avatarUrl || null,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    };
  });
}

export async function getPendingFriendRequests(userId: string): Promise<FriendWithUser[]> {
  const pendingList = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending")
      )
    );

  if (pendingList.length === 0) return [];

  const requesterIds = pendingList.map((f) => f.requesterId);
  const requesters = await db
    .select()
    .from(users)
    .where(inArray(users.id, requesterIds));

  return pendingList.map((f) => {
    const requester = requesters.find((u) => u.id === f.requesterId);
    return {
      id: f.id,
      friendId: f.requesterId,
      name: requester?.name || "",
      username: requester?.username || "",
      avatarUrl: requester?.avatarUrl || null,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    };
  });
}

export async function createFriendship(requesterId: string, addresseeId: string, status: "pending" | "accepted" = "pending") {
  return db.insert(friendships).values({
    requesterId,
    addresseeId,
    status,
  }).returning();
}

export async function acceptFriendship(friendshipId: string) {
  return db.update(friendships)
    .set({ status: "accepted" })
    .where(eq(friendships.id, friendshipId))
    .returning();
}

export async function deleteFriendship(friendshipId: string) {
  return db.delete(friendships).where(eq(friendships.id, friendshipId));
}

export async function getAllFriendshipsForUser(userId: string) {
  // Get all friendships
  const allFriendships = await db
    .select()
    .from(friendships)
    .where(
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId)
      )
    )
    .orderBy(desc(friendships.createdAt));

  if (allFriendships.length === 0) {
    return { accepted: [], pendingReceived: [], pendingSent: [] };
  }

  // Get all user IDs involved
  const userIds = new Set<string>();
  allFriendships.forEach((f) => {
    userIds.add(f.requesterId);
    userIds.add(f.addresseeId);
  });
  userIds.delete(userId);

  const relatedUsers = userIds.size > 0
    ? await db.select().from(users).where(inArray(users.id, Array.from(userIds)))
    : [];

  // Categorize friendships
  const accepted = allFriendships
    .filter((f) => f.status === "accepted")
    .map((f) => {
      const friendId = f.requesterId === userId ? f.addresseeId : f.requesterId;
      const friend = relatedUsers.find((u) => u.id === friendId);
      return {
        friendshipId: f.id,
        user: {
          id: friendId,
          name: friend?.name || "",
          username: friend?.username || "",
          avatar_url: friend?.avatarUrl || null,
        },
      };
    });

  const pendingReceived = allFriendships
    .filter((f) => f.status === "pending" && f.addresseeId === userId)
    .map((f) => {
      const friend = relatedUsers.find((u) => u.id === f.requesterId);
      return {
        friendshipId: f.id,
        user: {
          id: f.requesterId,
          name: friend?.name || "",
          username: friend?.username || "",
          avatar_url: friend?.avatarUrl || null,
        },
      };
    });

  const pendingSent = allFriendships
    .filter((f) => f.status === "pending" && f.requesterId === userId)
    .map((f) => {
      const friend = relatedUsers.find((u) => u.id === f.addresseeId);
      return {
        friendshipId: f.id,
        user: {
          id: f.addresseeId,
          name: friend?.name || "",
          username: friend?.username || "",
          avatar_url: friend?.avatarUrl || null,
        },
      };
    });

  return { accepted, pendingReceived, pendingSent };
}

// ============ INVITE LINK QUERIES ============

export async function getInviteLinkByCode(code: string) {
  const result = await db
    .select()
    .from(inviteLinks)
    .where(eq(inviteLinks.code, code.toUpperCase()))
    .limit(1);
  return result[0] || null;
}

export async function createInviteLink(userId: string) {
  const code = generateInviteCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const result = await db.insert(inviteLinks).values({
    userId,
    code,
    expiresAt,
  }).returning();
  return result[0];
}

export async function markInviteLinkUsed(linkId: string, usedBy: string) {
  return db.update(inviteLinks)
    .set({ usedBy })
    .where(eq(inviteLinks.id, linkId))
    .returning();
}

export async function getActiveInviteLinks(userId: string) {
  const now = new Date();

  const result = await db
    .select()
    .from(inviteLinks)
    .where(
      and(
        eq(inviteLinks.userId, userId),
        sql`${inviteLinks.expiresAt} > ${now}`,
        sql`${inviteLinks.usedBy} IS NULL`
      )
    )
    .orderBy(desc(inviteLinks.createdAt));

  return result;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ============ TITLE QUERIES ============

export async function getTitleByTmdbId(tmdbId: number, type: "movie" | "tv"): Promise<Title | null> {
  const result = await db
    .select()
    .from(titles)
    .where(and(eq(titles.tmdbId, tmdbId), eq(titles.type, type)))
    .limit(1);
  return result[0] || null;
}

export async function getTitleById(id: string): Promise<Title | null> {
  const result = await db.select().from(titles).where(eq(titles.id, id)).limit(1);
  return result[0] || null;
}

export async function getTitlesByTmdbIds(tmdbIds: number[]): Promise<Title[]> {
  if (tmdbIds.length === 0) return [];

  const result = await db.select().from(titles).where(inArray(titles.tmdbId, tmdbIds));
  return result;
}

export async function createTitle(data: NewTitle): Promise<Title> {
  const result = await db.insert(titles).values(data).returning();
  return result[0];
}

export async function getOrCreateTitle(data: NewTitle): Promise<Title> {
  const existing = await getTitleByTmdbId(data.tmdbId, data.type);
  if (existing) return existing;
  return createTitle(data);
}

// ============ RECOMMENDATION QUERIES ============

export async function getFeedItems(userId: string, friendIds: string[]): Promise<FeedItem[]> {
  if (friendIds.length === 0) return [];

  // Get recommendations from friends
  const recs = await db
    .select()
    .from(recommendations)
    .where(inArray(recommendations.userId, friendIds))
    .orderBy(desc(recommendations.createdAt))
    .limit(50);

  if (recs.length === 0) return [];

  const recIds = recs.map((r) => r.id);
  const titleIds = recs.map((r) => r.titleId);
  const userIds = recs.map((r) => r.userId);

  // Get related data in parallel
  const [recUsers, recTitles, recReactions, recComments, userWatchStatuses] = await Promise.all([
    db.select().from(users).where(inArray(users.id, userIds)),
    db.select().from(titles).where(inArray(titles.id, titleIds)),
    db.select().from(reactions).where(inArray(reactions.recommendationId, recIds)),
    db.select().from(comments).where(inArray(comments.recommendationId, recIds)),
    db.select().from(watchStatus).where(and(
      eq(watchStatus.userId, userId),
      inArray(watchStatus.titleId, titleIds)
    )),
  ]);

  return recs.map((rec) => {
    const recUser = recUsers.find((u) => u.id === rec.userId);
    const recTitle = recTitles.find((t) => t.id === rec.titleId);
    const recReactionsList = recReactions.filter((r) => r.recommendationId === rec.id);
    const recCommentsList = recComments.filter((c) => c.recommendationId === rec.id);
    const titleStatus = userWatchStatuses.find((ws) => ws.titleId === rec.titleId);
    const userReaction = recReactionsList.find((r) => r.userId === userId);

    return {
      id: rec.id,
      titleId: rec.titleId,
      posterUrl: recTitle?.posterUrl || null,
      titleName: recTitle?.name || "",
      titleYear: recTitle?.year || null,
      titleType: recTitle?.type || "movie",
      userName: recUser?.name || "",
      userAvatar: recUser?.avatarUrl || null,
      username: recUser?.username || "",
      note: rec.note,
      platform: rec.platform as Platform | null,
      tags: rec.tags || [],
      createdAt: rec.createdAt.toISOString(),
      reactionCount: recReactionsList.length,
      commentCount: recCommentsList.length,
      userHasLiked: !!userReaction,
      userHasSaved: titleStatus?.status === "saved",
      userHasWatched: titleStatus?.status === "watched",
    };
  });
}

export async function getUserRecommendations(userId: string) {
  const recs = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.userId, userId))
    .orderBy(desc(recommendations.createdAt));

  if (recs.length === 0) return [];

  const titleIds = recs.map((r) => r.titleId);
  const recTitles = await db.select().from(titles).where(inArray(titles.id, titleIds));

  return recs.map((rec) => {
    const title = recTitles.find((t) => t.id === rec.titleId);
    return {
      ...rec,
      title,
    };
  });
}

export async function createRecommendation(data: NewRecommendation) {
  const result = await db.insert(recommendations).values(data).returning();
  return result[0];
}

export async function getRecommendationsByTitle(titleId: string, viewerFriendIds: string[]) {
  const recs = await db
    .select()
    .from(recommendations)
    .where(
      and(
        eq(recommendations.titleId, titleId),
        inArray(recommendations.userId, viewerFriendIds)
      )
    )
    .orderBy(desc(recommendations.createdAt));

  if (recs.length === 0) return [];

  const userIds = recs.map((r) => r.userId);
  const recIds = recs.map((r) => r.id);

  const [recUsers, recReactions, recComments] = await Promise.all([
    db.select().from(users).where(inArray(users.id, userIds)),
    db.select().from(reactions).where(inArray(reactions.recommendationId, recIds)),
    db.select().from(comments).where(inArray(comments.recommendationId, recIds)),
  ]);

  return recs.map((rec) => {
    const user = recUsers.find((u) => u.id === rec.userId);
    const reactionCount = recReactions.filter((r) => r.recommendationId === rec.id).length;
    const commentCount = recComments.filter((c) => c.recommendationId === rec.id).length;

    return {
      ...rec,
      user,
      reactionCount,
      commentCount,
    };
  });
}

// ============ REACTION QUERIES ============

export async function toggleReaction(userId: string, recommendationId: string) {
  // Check if reaction exists
  const existing = await db
    .select()
    .from(reactions)
    .where(
      and(
        eq(reactions.userId, userId),
        eq(reactions.recommendationId, recommendationId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove reaction
    await db.delete(reactions).where(eq(reactions.id, existing[0].id));
    return null;
  } else {
    // Add reaction
    const result = await db.insert(reactions).values({
      userId,
      recommendationId,
    }).returning();
    return result[0];
  }
}

// ============ COMMENT QUERIES ============

export async function getCommentsByRecommendation(recommendationId: string) {
  const commentsList = await db
    .select()
    .from(comments)
    .where(eq(comments.recommendationId, recommendationId))
    .orderBy(desc(comments.createdAt));

  if (commentsList.length === 0) return [];

  const userIds = commentsList.map((c) => c.userId);
  const commentUsers = await db.select().from(users).where(inArray(users.id, userIds));

  return commentsList.map((comment) => {
    const user = commentUsers.find((u) => u.id === comment.userId);
    return {
      ...comment,
      user,
    };
  });
}

export async function createComment(userId: string, recommendationId: string, content: string) {
  const result = await db.insert(comments).values({
    userId,
    recommendationId,
    content,
  }).returning();
  return result[0];
}

// ============ WATCH STATUS QUERIES ============

export async function getWatchStatus(userId: string, titleId: string) {
  const result = await db
    .select()
    .from(watchStatus)
    .where(
      and(
        eq(watchStatus.userId, userId),
        eq(watchStatus.titleId, titleId)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function getWatchlistByStatus(userId: string, status: "saved" | "watching" | "watched") {
  const statuses = await db
    .select()
    .from(watchStatus)
    .where(
      and(
        eq(watchStatus.userId, userId),
        eq(watchStatus.status, status)
      )
    )
    .orderBy(desc(watchStatus.createdAt));

  if (statuses.length === 0) return [];

  const titleIds = statuses.map((s) => s.titleId);
  const titlesList = await db.select().from(titles).where(inArray(titles.id, titleIds));

  return statuses.map((s) => {
    const title = titlesList.find((t) => t.id === s.titleId);
    return {
      ...s,
      title,
    };
  });
}

export async function upsertWatchStatus(data: NewWatchStatus) {
  // Check if exists
  const existing = await getWatchStatus(data.userId, data.titleId);

  if (existing) {
    const result = await db
      .update(watchStatus)
      .set({ status: data.status })
      .where(eq(watchStatus.id, existing.id))
      .returning();
    return result[0];
  } else {
    const result = await db.insert(watchStatus).values(data).returning();
    return result[0];
  }
}

export async function deleteWatchStatus(userId: string, titleId: string) {
  return db.delete(watchStatus).where(
    and(
      eq(watchStatus.userId, userId),
      eq(watchStatus.titleId, titleId)
    )
  );
}

export async function getTitlePageData(titleId: string, userId: string, friendIds: string[]) {
  const visibleUserIds = [userId, ...friendIds];

  // Get recommendations for this title
  const recs = await db
    .select()
    .from(recommendations)
    .where(
      and(
        eq(recommendations.titleId, titleId),
        inArray(recommendations.userId, visibleUserIds)
      )
    )
    .orderBy(desc(recommendations.createdAt));

  if (recs.length === 0) {
    return { recommendations: [], platforms: [] };
  }

  const recIds = recs.map((r) => r.id);
  const userIds = recs.map((r) => r.userId);

  // Get related data in parallel
  const [recUsers, recReactions, recComments] = await Promise.all([
    db.select().from(users).where(inArray(users.id, userIds)),
    db.select().from(reactions).where(inArray(reactions.recommendationId, recIds)),
    db.select().from(comments).where(inArray(comments.recommendationId, recIds)).orderBy(comments.createdAt),
  ]);

  // Get comment user data
  const commentUserIds = recComments.map((c) => c.userId);
  const commentUsers = commentUserIds.length > 0
    ? await db.select().from(users).where(inArray(users.id, commentUserIds))
    : [];

  // Build platforms list
  const platforms = [...new Set(recs.map((r) => r.platform).filter(Boolean) as string[])];

  // Transform recommendations
  const transformedRecs = recs.map((rec) => {
    const recUser = recUsers.find((u) => u.id === rec.userId);
    const recReactionsList = recReactions.filter((r) => r.recommendationId === rec.id);
    const recCommentsList = recComments.filter((c) => c.recommendationId === rec.id);
    const userHasLiked = recReactionsList.some((r) => r.userId === userId);

    return {
      id: rec.id,
      userId: rec.userId,
      note: rec.note,
      tags: rec.tags || [],
      platform: rec.platform,
      watchUrl: rec.watchUrl,
      createdAt: rec.createdAt.toISOString(),
      user: recUser ? {
        id: recUser.id,
        name: recUser.name,
        username: recUser.username,
        avatar_url: recUser.avatarUrl,
      } : null,
      reactionCount: recReactionsList.length,
      userHasLiked,
      comments: recCommentsList.map((c) => {
        const commentUser = commentUsers.find((u) => u.id === c.userId);
        return {
          id: c.id,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          user: commentUser ? {
            id: commentUser.id,
            name: commentUser.name,
            username: commentUser.username,
            avatar_url: commentUser.avatarUrl,
          } : null,
        };
      }),
    };
  });

  return {
    recommendations: transformedRecs,
    platforms,
    hasUserRecommended: recs.some((r) => r.userId === userId),
  };
}

export async function getAllWatchStatusesWithTitles(userId: string) {
  const statuses = await db
    .select()
    .from(watchStatus)
    .where(eq(watchStatus.userId, userId))
    .orderBy(desc(watchStatus.updatedAt));

  if (statuses.length === 0) return [];

  const titleIds = statuses.map((s) => s.titleId);

  // Get titles and recommendations with platforms in parallel
  const [titlesList, recsList] = await Promise.all([
    db.select().from(titles).where(inArray(titles.id, titleIds)),
    db.select({
      titleId: recommendations.titleId,
      platform: recommendations.platform,
    })
      .from(recommendations)
      .where(
        and(
          inArray(recommendations.titleId, titleIds),
          sql`${recommendations.platform} IS NOT NULL`
        )
      ),
  ]);

  // Build platform map
  const platformMap: Record<string, string[]> = {};
  recsList.forEach((rec) => {
    if (rec.platform) {
      if (!platformMap[rec.titleId]) {
        platformMap[rec.titleId] = [];
      }
      if (!platformMap[rec.titleId].includes(rec.platform)) {
        platformMap[rec.titleId].push(rec.platform);
      }
    }
  });

  return statuses.map((s) => {
    const title = titlesList.find((t) => t.id === s.titleId);
    return {
      id: s.id,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      title: title ? {
        id: title.id,
        tmdb_id: title.tmdbId,
        type: title.type,
        name: title.name,
        year: title.year,
        poster_url: title.posterUrl,
      } : null,
      platforms: platformMap[s.titleId] || [],
    };
  }).filter((s) => s.title !== null);
}

// ============ STATS QUERIES ============

export async function getUserStats(userId: string) {
  const [recsResult, friendsResult, watchedResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(recommendations)
      .where(eq(recommendations.userId, userId)),
    db.select({ count: sql<number>`count(*)::int` })
      .from(friendships)
      .where(
        and(
          or(
            eq(friendships.requesterId, userId),
            eq(friendships.addresseeId, userId)
          ),
          eq(friendships.status, "accepted")
        )
      ),
    db.select({ count: sql<number>`count(*)::int` })
      .from(watchStatus)
      .where(
        and(
          eq(watchStatus.userId, userId),
          eq(watchStatus.status, "watched")
        )
      ),
  ]);

  return {
    recommendations: recsResult[0]?.count || 0,
    friends: friendsResult[0]?.count || 0,
    watched: watchedResult[0]?.count || 0,
  };
}
