'use client';

import { Suspense, useState, useCallback } from 'react';
import { Search, Upload, Video } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, PlaySquare, MonitorPlay, UserSquare2, RotateCw } from 'lucide-react';

interface YouTubeLayoutProps {
  children: React.ReactNode;
  currentView?: string;
}

function YouTubeLayoutInner({ children, currentView }: YouTubeLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push('/search');
  }, [searchQuery, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-transparent transition-colors duration-200">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 cursor-pointer"
            >
              <picture>
                <source srcSet="/logo.avif" type="image/avif" />
                <img src="/logo.png" alt="PlayLikeYT logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
              </picture>
              <span className="text-xl font-bold tracking-tight hidden xs:inline dark:text-white">PlayLikeYT</span>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="hidden sm:flex flex-1 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-4">
            <form
              className="flex items-center w-full"
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#303030] bg-white dark:bg-[#121212] rounded-l-full focus:outline-none focus:border-blue-500 dark:focus:border-[#1c62b9] focus:ml-[-1px] text-base placeholder-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-gray-50 dark:bg-[#222222] border border-l-0 border-gray-300 dark:border-[#303030] rounded-r-full hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </form>
          </div>

          {/* Right: Upload + User */}
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/glitchoff/playlikeyt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-[#272727]"
              title="GitHub Repository"
            >
              <GithubIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </Link>

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
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all focus:outline-none bg-gray-100 dark:bg-[#272727]"
              >
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </button>

              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#282828] border border-gray-200 dark:border-transparent rounded-xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-[#3f3f3f] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-[#3f3f3f]">
                        <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm dark:text-white">User</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Local Account</span>
                      </div>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          window.location.reload();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors"
                      >
                        <RotateCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        Refresh Page
                      </button>
                      <Link 
                        href="/about" 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors"
                      >
                        <UserSquare2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        About PlayLikeYT
                      </Link>
                      <Link 
                        href="https://github.com/glitchoff/playlikeyt" 
                        target="_blank"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] transition-colors"
                      >
                        <GithubIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        GitHub Repository
                      </Link>
                    </div>
                  </div>
                </>
              )}
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

export default function YouTubeLayout(props: YouTubeLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-transparent" />
        <div className="pt-14">{props.children}</div>
      </div>
    }>
      <YouTubeLayoutInner {...props} />
    </Suspense>
  );
}
