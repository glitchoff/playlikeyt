'use client';

import { useState } from 'react';
import { Search, Upload, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface YouTubeLayoutProps {
  children: React.ReactNode;
  currentView?: string;
}

export default function YouTubeLayout({ children, currentView }: YouTubeLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-transparent transition-colors duration-200">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/"
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <div className="bg-[#FF0000] rounded-lg px-2 py-1">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight hidden xs:inline dark:text-white">PlayLikeYT</span>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-4">
            <div className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#303030] bg-white dark:bg-[#121212] rounded-l-full focus:outline-none focus:border-blue-500 dark:focus:border-[#1c62b9] focus:ml-[-1px] text-base placeholder-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <button className="px-5 py-2 bg-gray-50 dark:bg-[#222222] border border-l-0 border-gray-300 dark:border-[#303030] rounded-r-full hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors">
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Right: Upload + User */}
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                currentView === 'upload' 
                  ? 'bg-gray-100 dark:bg-[#272727]' 
                  : 'hover:bg-gray-100 dark:hover:bg-[#272727]'
              }`}
              title="Upload Video"
            >
              <Upload className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </Link>
            
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium cursor-pointer">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="pt-14 bg-white dark:bg-[#0f0f0f] transition-colors duration-200">
        {/* Main Content */}
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
