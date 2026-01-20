import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Enums
export const platformTypeEnum = pgEnum("platform_type", [
  "netflix",
  "prime",
  "disney",
  "hulu",
  "hbo",
  "apple",
  "peacock",
  "paramount",
  "other",
]);

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
]);

export const watchStatusTypeEnum = pgEnum("watch_status_type", [
  "saved",
  "watching",
  "watched",
]);

export const titleTypeEnum = pgEnum("title_type", ["movie", "tv"]);

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    username: text("username").notNull().unique(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    usernameIdx: index("idx_users_username").on(table.username),
  })
);

// Friendships table
export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: uuid("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").default("pending").notNull(),
    inviteCode: text("invite_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueFriendship: uniqueIndex("unique_friendship").on(
      table.requesterId,
      table.addresseeId
    ),
    requesterIdx: index("idx_friendships_requester").on(table.requesterId),
    addresseeIdx: index("idx_friendships_addressee").on(table.addresseeId),
    statusIdx: index("idx_friendships_status").on(table.status),
    noSelfFriendship: check(
      "no_self_friendship",
      sql`${table.requesterId} != ${table.addresseeId}`
    ),
  })
);

// Invite links table
export const inviteLinks = pgTable(
  "invite_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedBy: uuid("used_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    codeIdx: index("idx_invite_links_code").on(table.code),
    userIdx: index("idx_invite_links_user").on(table.userId),
  })
);

// Titles table (movies and TV shows from TMDB)
export const titles = pgTable(
  "titles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tmdbId: integer("tmdb_id").notNull(),
    type: titleTypeEnum("type").notNull(),
    name: text("name").notNull(),
    year: integer("year"),
    posterUrl: text("poster_url"),
    backdropUrl: text("backdrop_url"),
    overview: text("overview"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tmdbIdx: uniqueIndex("unique_tmdb_title").on(table.tmdbId, table.type),
    nameIdx: index("idx_titles_name").on(table.name),
  })
);

// Recommendations table
export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    titleId: uuid("title_id")
      .notNull()
      .references(() => titles.id, { onDelete: "cascade" }),
    note: text("note"),
    tags: text("tags").array().default(sql`'{}'::text[]`),
    platform: platformTypeEnum("platform"),
    watchUrl: text("watch_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueUserRec: uniqueIndex("unique_user_recommendation").on(
      table.userId,
      table.titleId
    ),
    userIdx: index("idx_recommendations_user").on(table.userId),
    titleIdx: index("idx_recommendations_title").on(table.titleId),
    createdAtIdx: index("idx_recommendations_created").on(table.createdAt),
    platformIdx: index("idx_recommendations_platform").on(table.platform),
  })
);

// Reactions table
export const reactions = pgTable(
  "reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recommendationId: uuid("recommendation_id")
      .notNull()
      .references(() => recommendations.id, { onDelete: "cascade" }),
    type: text("type").default("like").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueReaction: uniqueIndex("unique_user_reaction").on(
      table.userId,
      table.recommendationId
    ),
    recommendationIdx: index("idx_reactions_recommendation").on(
      table.recommendationId
    ),
    userIdx: index("idx_reactions_user").on(table.userId),
  })
);

// Comments table
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recommendationId: uuid("recommendation_id")
      .notNull()
      .references(() => recommendations.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    recommendationIdx: index("idx_comments_recommendation").on(
      table.recommendationId
    ),
    userIdx: index("idx_comments_user").on(table.userId),
    createdAtIdx: index("idx_comments_created").on(table.createdAt),
  })
);

// Watch status table
export const watchStatus = pgTable(
  "watch_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    titleId: uuid("title_id")
      .notNull()
      .references(() => titles.id, { onDelete: "cascade" }),
    status: watchStatusTypeEnum("status").default("saved").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueWatchStatus: uniqueIndex("unique_user_watch_status").on(
      table.userId,
      table.titleId
    ),
    userIdx: index("idx_watch_status_user").on(table.userId),
    titleIdx: index("idx_watch_status_title").on(table.titleId),
    statusIdx: index("idx_watch_status_status").on(table.status),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  friendshipsAsRequester: many(friendships, { relationName: "requester" }),
  friendshipsAsAddressee: many(friendships, { relationName: "addressee" }),
  inviteLinks: many(inviteLinks),
  recommendations: many(recommendations),
  reactions: many(reactions),
  comments: many(comments),
  watchStatuses: many(watchStatus),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export const inviteLinksRelations = relations(inviteLinks, ({ one }) => ({
  user: one(users, {
    fields: [inviteLinks.userId],
    references: [users.id],
  }),
  usedByUser: one(users, {
    fields: [inviteLinks.usedBy],
    references: [users.id],
  }),
}));

export const titlesRelations = relations(titles, ({ many }) => ({
  recommendations: many(recommendations),
  watchStatuses: many(watchStatus),
}));

export const recommendationsRelations = relations(
  recommendations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [recommendations.userId],
      references: [users.id],
    }),
    title: one(titles, {
      fields: [recommendations.titleId],
      references: [titles.id],
    }),
    reactions: many(reactions),
    comments: many(comments),
  })
);

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  recommendation: one(recommendations, {
    fields: [reactions.recommendationId],
    references: [recommendations.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  recommendation: one(recommendations, {
    fields: [comments.recommendationId],
    references: [recommendations.id],
  }),
}));

export const watchStatusRelations = relations(watchStatus, ({ one }) => ({
  user: one(users, {
    fields: [watchStatus.userId],
    references: [users.id],
  }),
  title: one(titles, {
    fields: [watchStatus.titleId],
    references: [titles.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;
export type NewFriendship = typeof friendships.$inferInsert;
export type InviteLink = typeof inviteLinks.$inferSelect;
export type NewInviteLink = typeof inviteLinks.$inferInsert;
export type Title = typeof titles.$inferSelect;
export type NewTitle = typeof titles.$inferInsert;
export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;
export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type WatchStatus = typeof watchStatus.$inferSelect;
export type NewWatchStatus = typeof watchStatus.$inferInsert;
