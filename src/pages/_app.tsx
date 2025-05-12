import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AudioProvider } from '@/context/AudioContext'
 
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AudioProvider>
      <Component {...pageProps} />
    </AudioProvider>
  );
}