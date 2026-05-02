'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ListVideo } from 'lucide-react';
import { getVideos, getFolders, VideoMetadata, Folder } from '@/lib/indexeddb';
import YouTubeLayout from '@/components/YouTubeLayout';
import YouTubeVideoCard from '@/components/YouTubeVideoCard';
import FolderPlaylistCard from '@/components/FolderPlaylistCard';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';

  const [allVideos, setAllVideos] = useState<VideoMetadata[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVideos(), getFolders()]).then(([videos, folders]) => {
      setAllVideos(videos);
      setAllFolders(folders);
      setLoading(false);
    });
  }, []);

  const handleVideoSelect = useCallback((video: VideoMetadata) => {
    if (video.id) router.push(`/video/${video.id}`);
  }, [router]);

  // Group videos by folder (for playlist card mosaics)
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

  const handleFolderClick = useCallback((folder: Folder) => {
    const videos = videosByFolder.get(folder.id!) ?? [];
    const sorted = videos.slice().sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    if (sorted[0]?.id) router.push(`/video/${sorted[0].id}`);
  }, [videosByFolder, router]);

  const q = query.trim().toLowerCase();

  const matchingFolders = useMemo(() =>
    q ? allFolders.filter(f => f.name.toLowerCase().includes(q)) : allFolders,
    [allFolders, q]
  );

  const matchingVideos = useMemo(() =>
    q ? allVideos.filter(v => v.name.toLowerCase().includes(q)) : allVideos,
    [allVideos, q]
  );

  const totalResults = matchingFolders.length + matchingVideos.length;

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Heading */}
      <div className="mb-6">
        {q ? (
          <>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Results for &ldquo;{query}&rdquo;
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {loading ? 'Searching…' : `${totalResults} result${totalResults !== 1 ? 's' : ''} (${matchingFolders.length} playlist${matchingFolders.length !== 1 ? 's' : ''}, ${matchingVideos.length} video${matchingVideos.length !== 1 ? 's' : ''})`}
            </p>
          </>
        ) : (
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">All Content</h1>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 dark:bg-[#272727] aspect-video rounded-xl mb-3" />
              <div className="h-4 bg-gray-300 dark:bg-[#272727] rounded mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-[#3f3f3f] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
          <div className="bg-gray-100 dark:bg-[#272727] w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <Search className="w-9 h-9 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Playlists section */}
          {matchingFolders.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Playlists
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-12 gap-x-4">
                {matchingFolders.map(folder => (
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

          {/* Videos section */}
          {matchingVideos.length > 0 && (
            <section>
              {matchingFolders.length > 0 && (
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Videos</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-4">
                {matchingVideos.map(video => (
                  <YouTubeVideoCard
                    key={video.id}
                    video={video}
                    onSelect={handleVideoSelect}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <YouTubeLayout currentView="search">
      <Suspense
        fallback={
          <div className="p-6 max-w-[1600px] mx-auto">
            <div className="h-8 w-64 bg-gray-300 dark:bg-[#272727] rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-[#272727] aspect-video rounded-xl mb-3" />
                  <div className="h-4 bg-gray-300 dark:bg-[#272727] rounded mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-[#3f3f3f] rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </YouTubeLayout>
  );
}
