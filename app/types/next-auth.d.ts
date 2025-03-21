import NextAuth, { DefaultSession, DefaultUser, JWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultUser & { id: string }; // Add 'id' to user session
  }

  interface User {
    id: string; // Add 'id' to the user object
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // Ensure JWT token has an 'id' property
  }
}
