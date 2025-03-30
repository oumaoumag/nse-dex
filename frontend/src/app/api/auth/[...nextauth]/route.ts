import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Configure NextAuth with Google provider
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/", // Use our custom sign-in page
    signOut: "/",
    error: "/",
  },
  callbacks: {
    async session({ session, token }) {
      // Add user info to the session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user info to the JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
