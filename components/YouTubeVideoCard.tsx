'use client';

import { useState, useEffect } from 'react';
import { Play, MoreVertical, Clock, Eye } from 'lucide-react';
import { VideoMetadata, updateVideo } from '@/lib/indexeddb';

interface YouTubeVideoCardProps {
  video: VideoMetadata;
  onSelect: (video: VideoMetadata) => void;
  onDelete?: (videoId: string, e: React.MouseEvent) => void;
}

export default function YouTubeVideoCard({ video, onSelect, onDelete }: YouTubeVideoCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [dynamicThumbnail, setDynamicThumbnail] = useState<string | null>(video.thumbnail || null);
  const [dynamicDuration, setDynamicDuration] = useState<number>(video.duration || 0);

  useEffect(() => {
    if (!video.thumbnail && video.blob) {
      const url = URL.createObjectURL(video.blob);
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.src = url;
      
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 3000);
      
      vid.onloadedmetadata = () => {
        setDynamicDuration(vid.duration);
        vid.currentTime = vid.duration * (0.1 + Math.random() * 0.8);
      };
      
      vid.onseeked = () => {
        clearTimeout(timeoutId);
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = (vid.videoHeight / vid.videoWidth) * 320;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(vid, 0, 0, canvas.width, canvas.height);
        
        const thumbDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setDynamicThumbnail(thumbDataUrl);
        
        // Cache it to DB
        if (video.id) {
          updateVideo(video.id, { thumbnail: thumbDataUrl, duration: vid.duration }).catch(console.error);
        }
        
        URL.revokeObjectURL(url);
      };
      
      vid.onerror = () => {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(url);
      };
    } else {
      setDynamicThumbnail(video.thumbnail || null);
      setDynamicDuration(video.duration || 0);
    }
  }, [video]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = () => {
    // This is a placeholder - in a real app you'd track actual views
    return Math.floor(Math.random() * 10000) + ' views';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const fileSize = (video.size / (1024 * 1024)).toFixed(1);

  return (
    <div 
      className="flex flex-col group cursor-pointer"
      onClick={() => onSelect(video)}
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-[#272727] transition-all duration-200 group-hover:rounded-none">
        {dynamicThumbnail ? (
          <img 
            src={dynamicThumbnail} 
            alt={video.name}
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="w-full aspect-video bg-gray-200 dark:bg-[#272727] flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(dynamicDuration)}
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-black" />
          </div>
        </div>

        {/* Menu */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-[#272727] rounded-lg shadow-lg border border-gray-200 dark:border-[#3f3f3f] py-1 z-10">
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(video.id!, e);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-[#3f3f3f]"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Video Info - More compact like temp clone */}
      <div className="mt-3 flex gap-3 px-1">
        {/* Channel Avatar */}
        <div className="w-9 h-9 bg-gray-300 dark:bg-[#272727] rounded-full flex-shrink-0 pt-0.5">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {video.name.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex flex-col flex-grow min-w-0 pr-6 relative">
          <h3 className="font-semibold text-[16px] text-[#0f0f0f] dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {video.name.replace(/\.[^/.]+$/, '')} {/* Remove file extension */}
          </h3>
          <div className="flex flex-col mt-1 text-[14px] text-[#606060] dark:text-[#aaaaaa]">
            <span className="hover:text-[#0f0f0f] dark:hover:text-white transition-colors cursor-pointer">
              Local User
            </span>
            <div className="flex items-center gap-1">
              <span>{formatViews()}</span>
              <span className="text-[10px]">•</span>
              <span>{formatTimeAgo(video.uploadedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
