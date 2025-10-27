import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authAPI } from "@/features/auth/apis/auth.api";
import { JWT } from "next-auth/jwt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours (refresh token)
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const response = await authAPI.login({
            email: credentials.email.toString(),
            password: credentials.password.toString(),
          });

          return {
            id: response.user.id,
            email: response.user.email,
            name: response.user.firstName + " " + response.user.lastName,
            role: response.user.role,
            status: response.user.status,
            isPasswordChangeRequired: response.user.isPasswordChangeRequired,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      if (user) {
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          isPasswordChangeRequired: user.isPasswordChangeRequired,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 jour 
          refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 jour 
        } as JWT;
      }
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.id) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
          status: token.status,
          isPasswordChangeRequired: token.isPasswordChangeRequired,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        };
      }
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (token.refreshTokenExpires && Date.now() >= token.refreshTokenExpires) {
      throw new Error("Refresh token expiré");
    }
    console.log("Refresh token :", token.refreshToken);
    const response = await authAPI.refreshToken(token.refreshToken as string);
    console.log("Rafraîchissement du jeton d'accès réussi :", response);
    return {
      ...token,
      accessToken: response.accessToken,
      accessTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 jour 
    };
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du jeton d'accès :", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
