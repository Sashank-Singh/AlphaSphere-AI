import './globals.css';
import { Inter } from 'next/font/google';
import { HomeIcon, SearchIcon, BarChartIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Trade Simply',
  description: 'Real-time stock analysis with AI insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <main className="pb-16">
          {children}
        </main>
        
        {/* Bottom navigation bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
          <div className="flex justify-around items-center h-16">
            <Link href="/" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <HomeIcon size={20} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/search" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <SearchIcon size={20} />
              <span className="text-xs mt-1">Search</span>
            </Link>
            <Link href="/portfolio" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <BarChartIcon size={20} />
              <span className="text-xs mt-1">Portfolio</span>
            </Link>
            <Link href="/settings" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <SettingsIcon size={20} />
              <span className="text-xs mt-1">Settings</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
} 