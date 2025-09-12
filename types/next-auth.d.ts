import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      email?: string;
      name?: string;
      image?: string;
      profileId?: string;
    };
    accessToken?: string;
    error?: string;
  }

  interface User {
    id: string;
    username: string;
    role: string;
    email?: string;
    name?: string;
    profileId?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    profileId?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
