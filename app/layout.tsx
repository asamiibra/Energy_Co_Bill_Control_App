import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bill Control | Energy Co',
  description:
    'Bill Control helps energy customers understand what they are likely to pay and take safe, self-directed actions.',
  robots: 'noindex, nofollow', // Prototype should not be indexed
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full bg-white">{children}</div>
      </body>
    </html>
  );
}
