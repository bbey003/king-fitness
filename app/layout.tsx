import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { getCurrentUser } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const space = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'King Fitness — Personal Training & Equipment',
    template: '%s · King Fitness',
  },
  description:
    'Real coaching. Real results. Train one-on-one with King and shop the gear that gets you there.',
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'King Fitness — Personal Training & Equipment',
    description: 'Real coaching. Real results.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: '#05070f',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          <CartProvider>
            <Navbar user={user ? {
              id: user.id,
              email: user.email,
              display_name: user.display_name,
              avatar_url: user.avatar_url,
              role: user.role,
            } : null} />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
