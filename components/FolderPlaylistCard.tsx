'use client';

import { Play, PlaySquare, ListVideo } from 'lucide-react';
import { VideoMetadata, Folder } from '@/lib/indexeddb';

interface FolderPlaylistCardProps {
  folder: Folder;
  videos: VideoMetadata[]; // pass all videos in this folder (first 4 used for mosaic)
  onSelect: () => void;
}

export default function FolderPlaylistCard({ folder, videos, onSelect }: FolderPlaylistCardProps) {
  const thumbs = videos.slice(0, 4);
  const count = videos.length;

  return (
    <div className="flex flex-col group cursor-pointer" onClick={onSelect}>
      {/* Thumbnail with stacked-pages effect */}
      <div className="relative" style={{ paddingBottom: 'calc(56.25% + 10px)' }}>
        {/* Stack layers behind */}
        <div className="absolute bottom-0 left-3 right-3 top-2 rounded-xl bg-gray-300 dark:bg-[#3a3a3a]" />
        <div className="absolute bottom-0 left-6 right-6 top-4 rounded-xl bg-gray-200 dark:bg-[#2a2a2a]" />

        {/* Main card */}
        <div className="absolute bottom-[10px] left-0 right-0 aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-[#272727] transition-all duration-200 group-hover:rounded-none">
          {thumbs.length >= 4 ? (
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
              {thumbs.map((v, i) => (
                <div key={i} className="overflow-hidden">
                  {v.thumbnail
                    ? <img src={v.thumbnail} alt={v.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-300 dark:bg-[#3f3f3f]" />}
                </div>
              ))}
            </div>
          ) : thumbs[0]?.thumbnail ? (
            <img src={thumbs[0].thumbnail} alt={folder.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ListVideo className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}

          {/* Right-side count overlay */}
          <div className="absolute inset-y-0 right-0 w-[36%] bg-black/85 flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
            <span className="text-white font-bold text-2xl leading-none">{count}</span>
            <PlaySquare className="text-white w-5 h-5" />
            <span className="text-white text-[10px] font-medium uppercase tracking-widest mt-0.5">videos</span>
          </div>

          {/* Hover play overlay (left 64%) */}
          <div className="absolute inset-y-0 left-0 right-[36%] bg-black/0 group-hover:bg-black/25 transition-all duration-200 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-200">
              <Play className="w-5 h-5 text-black fill-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 flex gap-3 px-1">
        <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold pt-0.5">
          {folder.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="font-semibold text-[15px] text-[#0f0f0f] dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {folder.name}
          </h3>
          <span className="text-[13px] text-[#606060] dark:text-[#aaaaaa] mt-0.5">
            Playlist • {count} video{count !== 1 ? 's' : ''}
          </span>
          <span className="text-[13px] text-blue-600 dark:text-blue-400 mt-0.5 hover:underline">
            View full playlist
          </span>
        </div>
      </div>
    </div>
  );
}
