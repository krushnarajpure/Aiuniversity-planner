import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      accountType: { label: "Account type", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });

      const requestedRole = credentials.accountType === "ORGANIZATION" || credentials.accountType === "ADMIN" ? credentials.accountType : "STUDENT";

      if (!user || !user.password) {
        throw new Error("No account found with this email");
      }

      if (user.role !== requestedRole) {
        throw new Error(`This account is registered as ${user.role === "ORGANIZATION" ? "Organization / Recruiter" : user.role === "ADMIN" ? "Admin" : "Student"}. Please select the correct account type.`);
      }

      if (user.role === "ORGANIZATION") {
        const organization = await prisma.organization.findUnique({ where: { userId: user.id }, select: { verificationStatus: true } });
        if (!organization || (organization.verificationStatus !== "APPROVED" && organization.verificationStatus !== "VERIFIED")) {
          throw new Error(organization?.verificationStatus === "REJECTED" ? "Organization registration was rejected. Please contact support." : organization?.verificationStatus === "SUSPENDED" ? "Organization account has been suspended." : "Organization account is pending administrator approval.");
        }
      }

      const isValid = await bcrypt.compare(credentials.password, user.password);

      if (!isValid) {
        throw new Error("Incorrect password");
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
      profile(profile: {
        sub: string;
        name?: string | null;
        email?: string | null;
        picture?: string | null;
        email_verified?: boolean | null;
      }) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
          role: "STUDENT",
        };
      },
    }),
  );
} else {
  console.warn("Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before enabling Google login.");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user?.email) {
        return true;
      }

      const email = user.email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser?.role === "ADMIN") {
        return false;
      }

      if (existingUser) {
        if (!existingUser.name && user.name) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { name: user.name, image: user.image ?? existingUser.image },
          });
        }
        return true;
      }

      const profilePicture = typeof profile === "object" && profile && "picture" in profile ? (profile.picture as string | undefined) : undefined;
      const placeholderPassword = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

      await prisma.user.create({
        data: {
          email,
          name: user.name || (typeof profile === "object" && profile && "name" in profile ? String(profile.name) : "Google User") || "Google User",
          image: user.image || profilePicture || null,
          password: placeholderPassword,
          role: "STUDENT",
          emailVerified: new Date(),
        },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const databaseUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase().trim() },
          select: { id: true, role: true },
        });

        if (databaseUser) {
          token.id = databaseUser.id;
          token.role = databaseUser.role;
        } else if (user.id) {
          token.id = user.id;
          const nextUserRole = typeof user === "object" && "role" in user && typeof user.role === "string" ? user.role : "STUDENT";
          token.role = nextUserRole;
        }
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (!token.role) {
        token.role = "STUDENT";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as "STUDENT" | "ORGANIZATION" | "ADMIN") || "STUDENT";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const parsedUrl = new URL(url, baseUrl);

      if (parsedUrl.pathname === "/login" || parsedUrl.searchParams.has("error")) {
        return baseUrl;
      }

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("http://localhost:3000") || url.startsWith("http://127.0.0.1:3000")) {
        return url;
      }
      return baseUrl;
    },
  },
};
