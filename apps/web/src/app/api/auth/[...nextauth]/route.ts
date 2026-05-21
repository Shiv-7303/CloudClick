import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import jwt from "jsonwebtoken"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Handle manual session updates (e.g., after payment)
      if (trigger === "update" && session?.tier) {
        token.tier = session.tier;
      }

      if (account && user) {
        // First sign-in: upsert to DB, get tier
        try {
          const resp = await fetch(`${process.env.API_BASE_URL}/api/auth/upsert-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Secret': process.env.INTERNAL_SECRET!
            },
            body: JSON.stringify({ email: user.email, name: user.name, image: user.image })
          })
          
          if (!resp.ok) {
            console.error("Failed to upsert user. Status:", resp.status);
            const errText = await resp.text();
            console.error("Error response:", errText);
            throw new Error(`Failed to upsert user: ${resp.status}`);
          }
          
          const data = await resp.json()
          token.userId = data.id
          token.tier   = data.tier
        } catch (error) {
          console.error("JWT Callback Error:", error);
          // If this fails, NextAuth will throw an OAuthSignin error because the callback threw
          throw error;
        }
      }
      return token
    },
    async session({ session, token }) {
      session.userId = token.userId as string;
      session.tier = token.tier as string;
      
      // Generate a standard JWT that Flask can decode
      session.accessToken = jwt.sign(
        { 
          sub: token.userId, 
          email: session.user?.email, 
          tier: token.tier 
        }, 
        process.env.NEXTAUTH_SECRET!
      );
      
      return session;
    }
  }
})

export { handler as GET, handler as POST }
