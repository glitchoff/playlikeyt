'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play } from 'lucide-react';
import YouTubeVideoCard from './YouTubeVideoCard';
import FolderPlaylistCard from './FolderPlaylistCard';
import { getVideos, getFolders, deleteVideo, VideoMetadata, Folder } from '@/lib/indexeddb';
import { useRouter } from 'next/navigation';

interface VideoGridProps {
  onVideoSelect?: (video: VideoMetadata) => void;
  refreshTrigger?: number;
}


export default function VideoGrid({ onVideoSelect, refreshTrigger }: VideoGridProps) {
  const [allVideos, setAllVideos] = useState<VideoMetadata[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const router = useRouter();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [videosData, foldersData] = await Promise.all([
        getVideos(),   // load ALL videos — we filter client-side
        getFolders(),
      ]);
      setAllVideos(videosData);
      setFolders(foldersData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group videos by folderId
  const videosByFolder = useMemo(() => {
    const map = new Map<string, VideoMetadata[]>();
    for (const v of allVideos) {
      if (v.folderId) {
        if (!map.has(v.folderId)) map.set(v.folderId, []);
        map.get(v.folderId)!.push(v);
      }
    }
    return map;
  }, [allVideos]);

  // Videos shown in the grid (filtered + sorted)
  const displayedVideos = useMemo(() => {
    if (selectedFolderId) {
      return (videosByFolder.get(selectedFolderId) ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    }
    return allVideos
      .slice()
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [allVideos, videosByFolder, selectedFolderId]);

  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteVideo(videoId);
      await loadData();
    } catch (err) {
      console.error('Failed to delete video:', err);
    }
  };

  const handleVideoSelectClick = useCallback((video: VideoMetadata) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    } else {
      router.push(`/video/${video.id}`);
    }
  }, [onVideoSelect, router]);

  // Clicking a folder → go to first video in that folder (player sidebar = playlist)
  const handleFolderClick = useCallback((folder: Folder) => {
    const videos = videosByFolder.get(folder.id!) ?? [];
    const sorted = videos.slice().sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    if (sorted[0]?.id) {
      router.push(`/video/${sorted[0].id}`);
    } else {
      setSelectedFolderId(folder.id);
    }
  }, [videosByFolder, router]);

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 dark:bg-[#272727] aspect-video rounded-xl mb-3" />
              <div className="h-4 bg-gray-300 dark:bg-[#272727] rounded mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-[#3f3f3f] rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Filter chip row */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-gray-200 dark:border-transparent py-3 px-4 sm:px-6">
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
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
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
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

      <div className="p-4 sm:p-6">
        {/* ── Playlists section (only when "All" is selected) ── */}
        {!selectedFolderId && folders.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Playlists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-12 gap-x-4">
              {folders.map((folder) => (
                <FolderPlaylistCard
                  key={folder.id}
                  folder={folder}
                  videos={videosByFolder.get(folder.id!) ?? []}
                  onSelect={() => handleFolderClick(folder)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Videos grid ── */}
        {selectedFolderId && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedFolderId(undefined)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← All playlists
            </button>
            <span className="text-gray-400 dark:text-gray-500">·</span>
            <h2 className="font-semibold text-gray-900 dark:text-white">{selectedFolder?.name}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">({displayedVideos.length} videos)</span>
          </div>
        )}

        {displayedVideos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 mt-6">
            <div className="bg-gray-100 dark:bg-[#272727] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p>No videos found</p>
            <p className="text-sm mt-1">Upload some videos to get started</p>
          </div>
        ) : (
          <>
            {!selectedFolderId && (
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Videos</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-4">
              {displayedVideos.map((video) => (
                <YouTubeVideoCard
                  key={video.id}
                  video={video}
                  onSelect={handleVideoSelectClick}
                  onDelete={handleDeleteVideo}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
