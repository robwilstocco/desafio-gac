import { IUser } from '@/app/types/types';
import axios from 'axios';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await axios.get(
            `http://localhost:3001/users?email=${credentials.email}`
          );
          const user: IUser = res.data[0];
          if (user && (await bcrypt.compareSync(credentials.password, user.password))) {
            return {
              id: user.id,
              accountNumber: user.accountNumber,
              name: user.name,
              email: user.email,
            };
          }

          return null;
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
          return null;
        }
      },
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
