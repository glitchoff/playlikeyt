'use client';

import { useState, useEffect } from 'react';
import { Play, MoreVertical, Trash2, Users, Clock } from 'lucide-react';
import YouTubeVideoCard from './YouTubeVideoCard';
import { getVideos, getFolders, deleteVideo, VideoMetadata, Folder } from '@/lib/indexeddb';
import { useRouter } from 'next/navigation';

interface VideoGridProps {
  onVideoSelect?: (video: VideoMetadata) => void;
  refreshTrigger?: number;
}

export default function VideoGrid({ onVideoSelect, refreshTrigger }: VideoGridProps) {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [refreshTrigger, selectedFolderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const videosData = await getVideos(selectedFolderId);
      const foldersData = await getFolders();
      
      // Simulate recently watched (in real app, this would track watch history)
      const recentVideos = videosData
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 6);
      
      setVideos(videosData.sort((a, b) => {
        if (selectedFolderId) {
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        }
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }));
      setFolders(foldersData);
      setRecentlyWatched(recentVideos);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await deleteVideo(videoId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleVideoSelectClick = (video: VideoMetadata) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    } else {
      router.push(`/video/${video.id}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 dark:bg-[#272727] aspect-video rounded-lg mb-2 sm:mb-3"></div>
            <div className="h-4 bg-gray-300 dark:bg-[#272727] rounded mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-[#3f3f3f] rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Banner Section */}
      <div className="w-full">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl p-6 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to PlayLikeYT</h1>
          <p className="text-sm sm:text-base opacity-90">Your personal video collection, beautifully organized</p>
        </div>
      </div>

      {/* Folders Section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Playlists</h2>
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => handleFolderSelect(folder.id!)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedFolderId === folder.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3f3f3f]'
              }`}
            >
              {folder.thumbnail ? (
                <img src={folder.thumbnail} alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-cover rounded-sm" />
              ) : (
                <span className="text-lg sm:text-xl">📁</span>
              )}
              <span className="text-sm sm:text-base font-medium">{folder.name}</span>
            </button>
          ))}
          
          {/* All Videos Button */}
          <button
            onClick={() => setSelectedFolderId(undefined)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              !selectedFolderId
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3f3f3f]'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-medium">All Videos</span>
          </button>
        </div>
      </div>

      {/* Recently Watched Section */}
      {recentlyWatched.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Recently Watched</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-4">
            {recentlyWatched.map((video) => (
              <YouTubeVideoCard
                key={video.id}
                video={video}
                onSelect={handleVideoSelectClick}
                onDelete={handleDeleteVideo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 'All Videos'} 
          <span className="text-base sm:text-lg font-normal text-gray-600 dark:text-gray-400"> ({videos.length})</span>
        </h2>
        
        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="bg-gray-100 dark:bg-[#272727] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p>No videos found</p>
            <p className="text-sm mt-1">Upload some videos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-4">
            {videos.map((video) => (
              <YouTubeVideoCard
                key={video.id}
                video={video}
                onSelect={handleVideoSelectClick}
                onDelete={handleDeleteVideo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
