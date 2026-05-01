'use client';

import { useState, useEffect } from 'react';
import { Upload, FolderPlus, X } from 'lucide-react';
import { saveVideo, createFolder, getFolders, updateFolder } from '@/lib/indexeddb';

interface VideoUploadProps {
  onUploadComplete?: () => void;
  selectedFolderId?: string;
}

export default function VideoUpload({ onUploadComplete, selectedFolderId }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [storageUsed, setStorageUsed] = useState<string>('Calculating...');

  // Load initial storage estimate
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage) {
          const usedGB = (estimate.usage / (1024 * 1024 * 1024)).toFixed(2);
          setStorageUsed(`${usedGB} GB`);
        }
      }).catch(() => setStorageUsed('Unknown'));
    } else {
      setStorageUsed('Unknown');
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Find unique folder names from the uploaded files
      const folderNames = new Set<string>();
      Array.from(files).forEach(file => {
        if (file.webkitRelativePath) {
          const folderName = file.webkitRelativePath.split('/')[0];
          if (folderName) folderNames.add(folderName);
        }
      });

      // Create folders in IndexedDB
      const folderMap = new Map<string, string>();
      for (const folderName of Array.from(folderNames)) {
        const folderId = await createFolder(folderName);
        folderMap.set(folderName, folderId);
      }

      const updatedFolders = new Set<string>();

      const filesArray = Array.from(files);
      setUploadProgress({ current: 0, total: filesArray.length });
      
      let currentIdx = 0;
      for (const file of filesArray) {
        if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|ogg|mkv|mov|avi|m4v)$/i)) {
          let thumbnail = '';
          let duration = 0;
          try {
            const result = await createThumbnail(file);
            thumbnail = result.thumbnail;
            duration = result.duration;
          } catch (err) {
            console.warn('Could not generate thumbnail for', file.name);
          }
          
          let folderId = selectedFolderId;
          if (file.webkitRelativePath) {
            const folderName = file.webkitRelativePath.split('/')[0];
            if (folderName && folderMap.has(folderName)) {
              folderId = folderMap.get(folderName);
            }
          }

          if (thumbnail && folderId && !updatedFolders.has(folderId)) {
            updatedFolders.add(folderId);
            await updateFolder(folderId, { thumbnail });
          }
          
          await saveVideo({
            name: file.name,
            size: file.size,
            type: file.type || 'video/mp4', // fallback type
            blob: file,
            thumbnail,
            duration,
            folderId: folderId,
            uploadedAt: new Date(),
          });
        }
        
        currentIdx++;
        setUploadProgress({ current: currentIdx, total: filesArray.length });
      }
      
      // Update storage after upload
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
          if (estimate.usage) {
            const usedGB = (estimate.usage / (1024 * 1024 * 1024)).toFixed(2);
            setStorageUsed(`${usedGB} GB`);
          }
        });
      }

      onUploadComplete?.();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const createThumbnail = (file: File): Promise<{ thumbnail: string, duration: number }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(video.src);
        resolve({ thumbnail: '', duration: 0 }); // Resolve with empty string if timeout
      }, 3000); // 3 second timeout for thumbnail generation
      
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const seekTime = video.duration * (0.1 + Math.random() * 0.8);
        video.currentTime = seekTime;
      };
      
      video.onseeked = () => {
        clearTimeout(timeoutId);
        canvas.width = 320;
        canvas.height = (video.videoHeight / video.videoWidth) * 320;
        
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        
        URL.revokeObjectURL(video.src);
        resolve({ thumbnail, duration: video.duration });
      };
      
      video.onerror = () => {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(video.src);
        resolve({ thumbnail: '', duration: 0 });
      };
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
      // Refresh folders list
      const updatedFolders = await getFolders();
      setFolders(updatedFolders.map(f => ({ id: f.id!, name: f.name })));
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-[#303030] p-6 transition-colors duration-200">
      <div className="space-y-4">
        {/* Upload Area */}
        <div className="relative border-2 border-dashed border-gray-300 dark:border-[#3f3f3f] rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 pointer-events-none" />
          
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200 block pointer-events-none">
            {isUploading 
              ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} videos...` 
              : 'Click anywhere in this box to upload a video folder'}
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pointer-events-none">
            Supports MP4, WebM, OGG, MKV (No size limit)
          </p>
          
          {isUploading && uploadProgress.total > 0 && (
            <div className="w-full max-w-md mx-auto mt-4 h-2 bg-gray-200 dark:bg-[#272727] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              ></div>
            </div>
          )}
          
          <input
            type="file"
            ref={(input) => {
              if (input) {
                input.setAttribute('webkitdirectory', 'true');
                input.setAttribute('directory', 'true');
              }
            }}
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Upload Folder"
          />
        </div>

        {/* Folder & Storage Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {selectedFolderId && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm">
              <span>Selected folder</span>
              <span className="font-medium">
                {folders.find(f => f.id === selectedFolderId)?.name || 'Unknown'}
              </span>
            </div>
          )}
          
            <button
              onClick={() => setShowNewFolder(!showNewFolder)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#3f3f3f] dark:text-white rounded-full text-sm transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1a1a1a] px-3 py-1 rounded-full">
            Storage Used: <span className="font-medium text-gray-700 dark:text-gray-300">{storageUsed}</span>
          </div>
        </div>

        {/* New Folder Input */}
        {showNewFolder && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1 px-3 py-1 border border-gray-300 dark:border-[#303030] dark:bg-[#121212] dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <button
              onClick={handleCreateFolder}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewFolder(false);
                setNewFolderName('');
              }}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
