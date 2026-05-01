'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoUpload from '@/components/VideoUpload';
import YouTubeLayout from '@/components/YouTubeLayout';
import { Folder, getFolders, deleteFolder } from '@/lib/indexeddb';
import { Trash2 } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = () => {
    getFolders().then(setFolders);
  };

  const handleDeleteFolder = async (id: string) => {
    if (confirm('Are you sure you want to delete this playlist and all its videos?')) {
      await deleteFolder(id);
      loadFolders();
    }
  };

  const handleUploadComplete = () => {
    router.push('/');
  };

  return (
    <YouTubeLayout currentView="upload">
      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
        <div className="space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Upload Videos</h2>
            <p className="text-sm sm:text-base text-gray-600">Add videos to your collection</p>
          </div>
          
          <VideoUpload 
            onUploadComplete={handleUploadComplete} 
            selectedFolderId={currentFolder?.id}
          />
          
          {folders.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Playlists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {folders.map(folder => (
                  <div key={folder.id} className="relative bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center aspect-square hover:bg-gray-50 transition-colors group">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id!);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 z-10"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="cursor-pointer flex flex-col items-center w-full h-full justify-center" onClick={() => router.push('/')}>
                      {folder.thumbnail ? (
                        <img src={folder.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover mb-2" />
                      ) : (
                        <span className="text-4xl mb-2">📁</span>
                      )}
                      <span className="font-medium text-gray-800 text-center line-clamp-2">{folder.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </YouTubeLayout>
  );
}
