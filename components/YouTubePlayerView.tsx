'use client';

import { useState, useEffect } from 'react';
import { UserCircle2, ThumbsUp, ThumbsDown, Share2, Download, BookmarkPlus, MoreHorizontal, Clock, Trash2 } from 'lucide-react';
import { getVideos, VideoMetadata, updateVideo, Bookmark } from '@/lib/indexeddb';
import Player, { SeekBus } from './Player';

interface YouTubePlayerViewProps {
  video: VideoMetadata;
  onVideoSelect: (video: VideoMetadata) => void;
  createVideoUrl: (video: VideoMetadata) => string;
}

function SidebarThumbnail({ video }: { video: VideoMetadata }) {
  const [thumb, setThumb] = useState<string | null>(video.thumbnail || null);
  const [duration, setDuration] = useState<number>(video.duration || 0);

  useEffect(() => {
    if (!video.thumbnail && video.blob) {
      const url = URL.createObjectURL(video.blob);
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.src = url;
      
      const timeoutId = setTimeout(() => URL.revokeObjectURL(url), 3000);
      
      vid.onloadedmetadata = () => {
        setDuration(vid.duration);
        vid.currentTime = vid.duration * (0.1 + Math.random() * 0.8);
      };
      vid.onseeked = () => {
        clearTimeout(timeoutId);
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = (vid.videoHeight / vid.videoWidth) * 160;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(vid, 0, 0, canvas.width, canvas.height);
        
        const thumbDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumb(thumbDataUrl);
        
        // Cache it to DB
        if (video.id) {
          updateVideo(video.id, { thumbnail: thumbDataUrl, duration: vid.duration }).catch(console.error);
        }
        
        URL.revokeObjectURL(url);
      };
      vid.onerror = () => { clearTimeout(timeoutId); URL.revokeObjectURL(url); };
    }
  }, [video]);

  return (
    <div className="w-[120px] flex-shrink-0 relative rounded-lg overflow-hidden">
      {thumb ? (
        <img src={thumb} alt={video.name} className="w-full h-[68px] object-cover" />
      ) : (
        <div className="w-full h-[68px] bg-gray-300 dark:bg-[#272727] flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-[10px]">No Thumb</span>
        </div>
      )}
      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-medium">
        {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
      </div>
    </div>
  );
}

export default function YouTubePlayerView({ video, onVideoSelect, createVideoUrl }: YouTubePlayerViewProps) {
  const [recommendedVideos, setRecommendedVideos] = useState<VideoMetadata[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(video.bookmarks || []);
  const [bookmarkDialog, setBookmarkDialog] = useState<{isOpen: boolean, time: number, label: string}>({ isOpen: false, time: 0, label: '' });

  useEffect(() => {
    setBookmarks(video.bookmarks || []);
  }, [video.id, video.bookmarks]);

  useEffect(() => {
    // Fetch videos for the sidebar, specifically from the same folder
    getVideos(video.folderId).then(videos => {
      // Sort by name for a playlist feel using natural sort
      const sorted = videos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      setRecommendedVideos(sorted);
    });
  }, [video.id, video.folderId]);

  const formatViews = () => {
    return Math.floor(Math.random() * 1000000) + ' Views';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleVideoEnded = () => {
    const currentIndex = recommendedVideos.findIndex(v => v.id === video.id);
    if (currentIndex !== -1 && currentIndex < recommendedVideos.length - 1) {
      onVideoSelect(recommendedVideos[currentIndex + 1]);
    }
  };

  const handleAddBookmarkClick = (time: number) => {
    setBookmarkDialog({
      isOpen: true,
      time,
      label: `Bookmark at ${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`
    });
  };

  const submitBookmark = () => {
    const { time, label } = bookmarkDialog;
    if (label.trim()) {
      const newBookmark = { time, label: label.trim() };
      const updatedBookmarks = [...bookmarks, newBookmark].sort((a, b) => a.time - b.time);
      setBookmarks(updatedBookmarks);
      if (video.id) {
        updateVideo(video.id, { bookmarks: updatedBookmarks }).catch(console.error);
      }
    }
    setBookmarkDialog({ isOpen: false, time: 0, label: '' });
  };

  const handleDeleteBookmark = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this bookmark?')) {
      const updatedBookmarks = bookmarks.filter((_, i) => i !== index);
      setBookmarks(updatedBookmarks);
      if (video.id) {
        updateVideo(video.id, { bookmarks: updatedBookmarks }).catch(console.error);
      }
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-[#f9f9f9] dark:bg-[#0f0f0f] min-h-screen transition-colors duration-200">
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Main Player Section (69%) */}
        <div className="lg:w-[69%] flex-shrink-0">
          <div className="rounded-xl overflow-hidden shadow-sm bg-black mb-4 relative z-0 flex justify-center">
            <Player
              src={createVideoUrl(video)}
              poster={video.thumbnail || undefined}
              onEnded={handleVideoEnded}
              bookmarks={bookmarks}
              onAddBookmark={handleAddBookmarkClick}
            />
          </div>
          
          {/* Video Info below player */}
          <div className="px-1">
            <div className="text-blue-600 text-sm mb-2 font-medium">
              <a href="#" className="mr-2 hover:underline">#PlayLikeYT</a>
              <a href="#" className="mr-2 hover:underline">#LocalVideos</a>
              <a href="#" className="hover:underline">#Trending</a>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {video.name.replace(/\.[^/.]+$/, '')}
            </h1>
            
            {/* Channel Info & Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              {/* Left: Channel Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                  <UserCircle2 size={40} className="text-white/80" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 dark:text-white text-base">Local User</span>
                    <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1L7 11.8l2.8 2.7L17 7.4l1.4 1.4-8.6 8.5z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">1.2M subscribers</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button className="hidden sm:block px-3 py-1.5 rounded-full text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition-colors">
                    Join
                  </button>
                  <button 
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSubscribed 
                        ? 'bg-gray-100 dark:bg-[#272727] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#3f3f3f]' 
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto shrink-0 scrollbar-hide">
                <div className="flex items-center bg-gray-100 dark:bg-[#272727] rounded-full">
                  <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-l-full transition-colors border-r border-gray-300 dark:border-gray-600">
                    <ThumbsUp size={18} />
                    <span className="text-sm font-medium">Like</span>
                  </button>
                  <button className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-r-full transition-colors">
                    <ThumbsDown size={18} />
                  </button>
                </div>
                
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-full transition-colors whitespace-nowrap">
                  <Share2 size={18} />
                  <span className="text-sm font-medium">Share</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-full transition-colors whitespace-nowrap">
                  <Download size={18} />
                  <span className="text-sm font-medium">Download</span>
                </button>
                
                <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-full transition-colors whitespace-nowrap">
                  <BookmarkPlus size={18} />
                  <span className="text-sm font-medium">Save</span>
                </button>
                
                <button className="flex items-center justify-center w-9 h-9 bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#3f3f3f] rounded-full transition-colors shrink-0">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-gray-100 dark:bg-[#272727] rounded-xl p-3 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition-colors cursor-pointer mt-4">
              <div className="flex items-center gap-2 font-medium text-sm text-gray-900 dark:text-white mb-1">
                <span>{formatViews()}</span>
                <span>•</span>
                <span>{formatDate(video.uploadedAt)}</span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                This video is stored locally on your device. {video.name} is playing directly from OPFS (Origin Private File System) for optimal performance.
              </p>
            </div>

            {/* Bookmarks Section */}
            {bookmarks.length > 0 && (
              <div className="mt-6 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#303030] rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookmarkPlus className="w-5 h-5 text-blue-500" />
                  Bookmarks
                </h3>
                <div className="flex flex-col gap-2">
                  {bookmarks.map((bookmark, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[#272727] rounded-lg cursor-pointer group transition-colors"
                      onClick={() => SeekBus.emit(bookmark.time)}
                    >
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-sm font-medium flex items-center gap-1 min-w-[60px] justify-center">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(bookmark.time / 60)}:{(Math.floor(bookmark.time % 60)).toString().padStart(2, '0')}
                      </div>
                      <span className="text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                        {bookmark.label}
                      </span>
                      <button
                        onClick={(e) => handleDeleteBookmark(e, idx)}
                        className="p-2 sm:p-1.5 text-gray-500 sm:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Delete Bookmark"
                      >
                        <Trash2 className="w-4 h-4 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (30%) */}
        <div className="lg:w-[30%] flex-col gap-3 flex">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Playlist</h3>
          {recommendedVideos.map((recVideo, index) => (
            <div 
              key={recVideo.id} 
              className={`flex gap-2 cursor-pointer group p-1 rounded-lg transition-colors ${recVideo.id === video.id ? 'bg-gray-200 dark:bg-[#272727]' : 'hover:bg-gray-100 dark:hover:bg-[#3f3f3f]'}`}
              onClick={() => onVideoSelect(recVideo)}
            >
              <div className="flex items-center justify-center w-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
                {recVideo.id === video.id ? '▶' : index + 1}
              </div>
              <SidebarThumbnail video={recVideo} />
              <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight">
                  {recVideo.name.replace(/\.[^/.]+$/, '')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Local Video</p>
              </div>
            </div>
          ))}
          {recommendedVideos.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No other videos found.</p>
          )}
        </div>
      </div>

      {/* Bookmark Dialog Modal */}
      {bookmarkDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#272727] rounded-xl p-6 w-full max-w-sm shadow-xl border border-gray-200 dark:border-[#3f3f3f]">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Bookmark</h3>
            <div className="mb-4 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 py-2 px-3 rounded-md inline-block">
              Time: {Math.floor(bookmarkDialog.time / 60)}:{(Math.floor(bookmarkDialog.time % 60)).toString().padStart(2, '0')}
            </div>
            <input 
              type="text" 
              value={bookmarkDialog.label}
              onChange={(e) => setBookmarkDialog(prev => ({...prev, label: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-[#3f3f3f] bg-gray-50 dark:bg-[#1a1a1a] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              placeholder="Enter bookmark name..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitBookmark();
                if (e.key === 'Escape') setBookmarkDialog({ isOpen: false, time: 0, label: '' });
              }}
            />
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3f3f3f] rounded-lg transition-colors font-medium"
                onClick={() => setBookmarkDialog({ isOpen: false, time: 0, label: '' })}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                onClick={submitBookmark}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
