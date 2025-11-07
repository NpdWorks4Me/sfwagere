import type { Metadata } from 'next';
import { Inter, Bungee_Shade, Bungee, JetBrains_Mono } from 'next/font/google';
import './globals.css';
// Legacy site styles to preserve original look and effects
import '../styles/legacy/styles.css';
import '../styles/legacy/page.css';
import '../styles/legacy/blog.css';
import '../styles/legacy/guidelines.css';
import '../styles/legacy/mod.css';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ParallaxBackground from '@/components/ParallaxBackground';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bungeeShade = Bungee_Shade({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bungee-shade',
  display: 'swap',
});

const bungee = Bungee({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bungee',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Unadulting Society',
  description: 'A loose collective for people who don’t quite fit the scripts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bungeeShade.variable} ${bungee.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://twzknjvtwbxtedklclht.supabase.co/storage/v1/object/public/sfwagere/sparkylogo.svg" type="image/svg+xml" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AuthProvider>
          <ParallaxBackground />
          <Header />
          <Script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" strategy="beforeInteractive" />
          <div className="page-wrapper">
            <main id="main-content" className="main-container">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
