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
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Upload and organize your video collection</p>
          </div>
          
          <VideoGrid
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </YouTubeLayout>
  );
}
