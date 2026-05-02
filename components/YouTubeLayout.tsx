'use client';

import { useState } from 'react';
import { Search, Upload, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, PlaySquare, MonitorPlay, UserSquare2 } from 'lucide-react';

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
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
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

      <div className="pt-14 bg-white dark:bg-[#0f0f0f] transition-colors duration-200 flex">
        {/* Left Sidebar */}
        <aside className="w-[72px] hidden sm:flex flex-col items-center py-2 gap-2 shrink-0 bg-white dark:bg-[#0f0f0f] fixed top-14 left-0 bottom-0 overflow-y-auto z-40 border-r border-transparent">
          <div className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#272727] py-4 rounded-xl w-16 transition-colors group">
            <Home className="w-6 h-6 text-gray-900 dark:text-white" />
            <span className="text-[10px] text-gray-900 dark:text-white group-hover:font-medium">Home</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#272727] py-4 rounded-xl w-16 transition-colors text-gray-600 dark:text-gray-300">
            <PlaySquare className="w-6 h-6" />
            <span className="text-[10px]">Shorts</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#272727] py-4 rounded-xl w-16 transition-colors text-gray-600 dark:text-gray-300">
            <MonitorPlay className="w-6 h-6" />
            <span className="text-[10px]">Subscriptions</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#272727] py-4 rounded-xl w-16 transition-colors text-gray-600 dark:text-gray-300">
            <UserSquare2 className="w-6 h-6" />
            <span className="text-[10px]">You</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full sm:pl-[72px] pb-16 sm:pb-0 min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f0f0f] border-t border-gray-200 dark:border-[#303030] z-50 flex items-center justify-around h-14 px-1 pb-safe">
        <Link href="/" className="flex flex-col items-center justify-center gap-1 w-14 h-full text-gray-900 dark:text-white">
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Home</span>
        </Link>
        <div className="flex flex-col items-center justify-center gap-1 w-14 h-full text-gray-600 dark:text-gray-400">
          <PlaySquare className="w-6 h-6" />
          <span className="text-[10px]">Shorts</span>
        </div>
        
        {/* Mobile Upload Button */}
        <Link href="/upload" className="flex flex-col items-center justify-center w-14 h-full text-gray-900 dark:text-white group">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-900 dark:border-white transition-colors ${currentView === 'upload' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-[#272727]'}`}>
            <Upload className="w-5 h-5" />
          </div>
        </Link>
        
        <div className="flex flex-col items-center justify-center gap-1 w-14 h-full text-gray-600 dark:text-gray-400">
          <MonitorPlay className="w-6 h-6" />
          <span className="text-[10px]">Subs</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 w-14 h-full text-gray-600 dark:text-gray-400">
          <UserSquare2 className="w-6 h-6" />
          <span className="text-[10px]">You</span>
        </div>
      </nav>
    </div>
  );
}
