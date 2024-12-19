import NextAuth from "next-auth";
import Email from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import * as schema from "@/db/schema";
import { db } from "@/db";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    Email({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.RESEND_FROM_SEND,
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: schema.User,
    accountsTable: schema.Account,
    sessionsTable: schema.Session,
    verificationTokensTable: schema.VerificationToken,
  }),
  // trustHost: true,
  secret: process.env.AUTH_SECRET,
  callbacks: {
    session: async ({ session, token, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {},
});
