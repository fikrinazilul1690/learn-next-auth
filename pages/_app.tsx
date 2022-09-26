import '../styles/globals.css';
import '../components/Navbar/Navbar.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import { SessionProvider } from 'next-auth/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SessionProvider refetchInterval={9}>
        <Navbar />
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}

export default MyApp;
