import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

const refreshAccessToken = async (token: any) => {
  try {
    const response = await axios.post(
      'http://localhost:3500/api/v1/auth/refresh-token',
      JSON.stringify({ refresh_token: token.refreshToken }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    const data = await response.data;

    if (!(response.status === 201)) {
      throw data;
    }

    const payload: { exp: number } = jwtDecode(data.access_token);

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: payload.exp * 1000,
    };
  } catch (err) {
    console.log(err);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

interface Data {}

export default NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: {
          label: 'email',
          type: 'email',
          placeholder: 'test@domain.com',
        },
        password: {
          label: 'password',
          type: 'password',
        },
      },
      authorize: async (credential) => {
        const payload = {
          email: credential?.username,
          password: credential?.password,
        };
        // database lookup

        const response = await axios.post(
          'http://localhost:3500/api/v1/auth/login',
          JSON.stringify(payload),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );

        const user = await response.data;

        if (!(response.status === 201)) {
          throw user;
        }

        if (response.status === 201 && user) {
          return user;
        }

        // login failed
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const payload: { exp: number } = jwtDecode(
          user?.access_token as string
        );
        return {
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          accessTokenExpires: payload.exp * 1000,
          user,
        };
      }

      if (Date.now() < token.accessTokenExpires!) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = token.user!;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }

      return session;
    },
  },
  secret: 'test',
  jwt: {
    secret: 'test',
  },
});
