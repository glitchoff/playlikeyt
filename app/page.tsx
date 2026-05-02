'use client';

import { useState } from 'react';
import VideoGrid from '@/components/VideoGrid';
import YouTubeLayout from '@/components/YouTubeLayout';

export default function PlayLikeYTApp() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <YouTubeLayout currentView="feed">
      <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto">
        <div className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Your Videos</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Upload and organize your video collection • <a href="https://github.com/glitchoff/playlikeyt" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors">View on GitHub</a>
            </p>
          </div>
          
          <VideoGrid
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </YouTubeLayout>
  );
}
