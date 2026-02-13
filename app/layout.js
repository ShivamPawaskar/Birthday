import { Manrope, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

export const metadata = {
  title: 'Year of Memories',
  description: 'A birthday love letter through music and motion'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} bg-night text-white`}>
        {children}
      </body>
    </html>
  );
}
