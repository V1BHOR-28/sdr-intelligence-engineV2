import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

/**
 * NextAuth configuration.
 *
 * Uses a Credentials provider that accepts just an email + name.
 * This is intentionally lightweight for a free tool — no email verification,
 * no password. If the user doesn't exist, we create them. If they do, we log them in.
 *
 * For production you'd want to add email magic links (Resend/SendGrid) or OAuth
 * (Google/GitHub), but this keeps the app free and frictionless.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "email",
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@company.com",
        },
        name: {
          label: "Name (optional)",
          type: "text",
          placeholder: "Alex SDR",
        },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Please enter a valid email address.");
        }

        // Find or create the user
        let user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email,
              name: credentials?.name?.trim() || null,
            },
          });
        } else if (credentials?.name?.trim() && !user.name) {
          // Update name if it was previously null
          user = await db.user.update({
            where: { id: user.id },
            data: { name: credentials.name.trim() },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  pages: {
    // We handle sign-in via a custom modal in the app, not a separate page.
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
