import React from 'react';
import './globals.css';
import { HomeIcon, SearchIcon, BarChartIcon, SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div lang="en">
      <div className="bg-black text-white min-h-screen flex flex-col">
        <main className="pb-20 px-2 sm:px-0 flex-1 w-full max-w-screen-lg mx-auto">
          {children}
        </main>
        {/* Bottom navigation bar - only show on mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50 block sm:hidden">
          <div className="flex justify-around items-center h-16">
            <Link to="/" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <HomeIcon size={20} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/search" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <SearchIcon size={20} />
              <span className="text-xs mt-1">Search</span>
            </Link>
            <Link to="/portfolio" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <BarChartIcon size={20} />
              <span className="text-xs mt-1">Portfolio</span>
            </Link>
            <Link to="/settings" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <SettingsIcon size={20} />
              <span className="text-xs mt-1">Settings</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
