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
    <div className="pb-8">
      {/* Categories/Folders Chip Row */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-gray-200 dark:border-transparent py-3 px-4 sm:px-6">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
          {/* "All" Chip */}
          <button
            onClick={() => setSelectedFolderId(undefined)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedFolderId
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-[#272727] dark:text-gray-200 dark:hover:bg-[#3f3f3f]'
            }`}
          >
            All
          </button>
          
          {/* Folder Chips */}
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => handleFolderSelect(folder.id!)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFolderId === folder.id
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-[#272727] dark:text-gray-200 dark:hover:bg-[#3f3f3f]'
              }`}
            >
              {folder.name}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="p-4 sm:p-6">
        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 mt-10">
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
