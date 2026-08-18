import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Storage Park Empire',
  description: 'Build a UK self-storage park empire.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
