import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import type { Adapter } from "next-auth/adapters";
import type { AuthOptions } from "next-auth";

export const authConfig: AuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const nodemailer = await import("nodemailer");
        const transport = nodemailer.createTransport(provider.server);

        try {
          await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: "Sign in to rcmndo",
            text: `Sign in to rcmndo\n\nClick this link to sign in:\n${url}\n\nIf you didn't request this, you can ignore this email.`,
            html: `
              <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
                <h2 style="color: #FF385C;">Sign in to rcmndo</h2>
                <p>Click the button below to sign in:</p>
                <a href="${url}" style="display: inline-block; background: #FF385C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Sign in</a>
                <p style="color: #666; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
              </div>
            `,
          });
          console.log("Email sent successfully to:", identifier);
        } catch (error) {
          console.error("Email send error:", error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-email",
    newUser: "/onboarding",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string | null }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      console.log("New user created:", user.email);
    },
  },
};
