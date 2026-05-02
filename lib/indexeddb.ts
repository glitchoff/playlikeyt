import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Bookmark {
  time: number;
  label: string;
}

export interface VideoMetadata {
  id?: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  thumbnail?: string;
  folderId?: string;
  uploadedAt: Date;
  blob?: Blob;
  opfs?: boolean;
  bookmarks?: Bookmark[];
  lastPosition?: number;
}

export interface Folder {
  id?: string;
  name: string;
  createdAt: Date;
  parentId?: string;
  thumbnail?: string;
}

interface VideoDBSchema extends DBSchema {
  videos: {
    key: string;
    value: VideoMetadata;
    indexes: {
      'by-folder': string;
      'by-date': Date;
    };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: {
      'by-parent': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<VideoDBSchema>> | null = null;

export async function initDB(): Promise<IDBPDatabase<VideoDBSchema>> {
  if (dbPromise) {
    try {
      const db = await dbPromise;
      // Test if it's closed by starting a dummy transaction or just relying on event listeners we add below
      return db;
    } catch (e) {
      dbPromise = null;
    }
  }
  
  dbPromise = openDB<VideoDBSchema>('VideoPlayerDB', 1, {
    upgrade(db) {
      const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
      videoStore.createIndex('by-folder', 'folderId');
      videoStore.createIndex('by-date', 'uploadedAt');
      
      const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
      folderStore.createIndex('by-parent', 'parentId');
    },
    terminated() {
      dbPromise = null;
    }
  }).then(db => {
    db.addEventListener('close', () => {
      dbPromise = null;
    });
    db.addEventListener('versionchange', () => {
      db.close();
      dbPromise = null;
    });
    return db;
  });
  
  return dbPromise;
}

export async function saveVideo(video: VideoMetadata): Promise<string> {
  const db = await initDB();
  const id = crypto.randomUUID();
  video.id = id;
  video.uploadedAt = new Date();
  
  try {
    if (video.blob && typeof navigator !== 'undefined' && navigator.storage && navigator.storage.getDirectory) {
      const opfsRoot = await navigator.storage.getDirectory();
      const fileHandle = await opfsRoot.getFileHandle(id, { create: true });
      // Create a writable stream to the file
      const writable = await (fileHandle as any).createWritable();
      await writable.write(video.blob);
      await writable.close();
      
      delete video.blob;
      video.opfs = true;
    }
  } catch (err) {
    console.error("Failed to save to OPFS, falling back to IndexedDB for blob", err);
  }

  await db.add('videos', video);
  return id;
}

export async function cleanupOldVideos(): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction('videos', 'readonly');
    const store = tx.objectStore('videos');
    
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const oldVideoIds: string[] = [];
    
    let cursor = await store.openCursor();
    while (cursor) {
      if (new Date(cursor.value.uploadedAt) < twoDaysAgo) {
        if (cursor.value.id) {
          oldVideoIds.push(cursor.value.id);
        }
      }
      cursor = await cursor.continue();
    }
    
    for (const id of oldVideoIds) {
      await deleteVideo(id);
    }
  } catch (err) {
    console.error('Failed to cleanup old videos:', err);
  }
}

export async function cleanupOrphanedOPFSFiles(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.getDirectory) return;
  
  try {
    const db = await initDB();
    const opfsRoot = await navigator.storage.getDirectory();
    
    const tx = db.transaction('videos', 'readonly');
    const store = tx.objectStore('videos');
    const allKeys = await store.getAllKeys();
    const validIds = new Set(allKeys.map(k => String(k)));
    
    // @ts-ignore
    for await (const name of opfsRoot.keys()) {
      if (!validIds.has(name)) {
        console.log(`Deleting orphaned OPFS file: ${name}`);
        await opfsRoot.removeEntry(name);
      }
    }
  } catch (err) {
    console.error('Failed to cleanup OPFS:', err);
  }
}

export async function getTotalStorageUsed(): Promise<number> {
  try {
    const db = await initDB();
    const tx = db.transaction('videos', 'readonly');
    const store = tx.objectStore('videos');
    
    let totalBytes = 0;
    let cursor = await store.openCursor();
    while (cursor) {
      totalBytes += cursor.value.size || 0;
      cursor = await cursor.continue();
    }
    
    return totalBytes;
  } catch (err) {
    console.error('Failed to calculate storage:', err);
    return 0;
  }
}

export async function getVideos(folderId?: string): Promise<VideoMetadata[]> {
  cleanupOldVideos().catch(console.error); // Run async, don't await, prevents blocking
  cleanupOrphanedOPFSFiles().catch(console.error); // Sync OPFS with IDB to delete orphaned files
  
  const db = await initDB();
  const tx = db.transaction('videos', 'readonly');
  const store = tx.objectStore('videos');
  
  let cursor;
  if (folderId) {
    const index = store.index('by-folder');
    cursor = await index.openCursor(IDBKeyRange.only(folderId));
  } else {
    cursor = await store.openCursor();
  }

  const videos: VideoMetadata[] = [];
  while (cursor) {
    const { blob, ...metadataWithoutBlob } = cursor.value;
    videos.push(metadataWithoutBlob as VideoMetadata);
    cursor = await cursor.continue();
  }
  
  return videos;
}

export async function getVideo(id: string): Promise<VideoMetadata | undefined> {
  const db = await initDB();
  const video = await db.get('videos', id);
  
  if (video && video.opfs && typeof navigator !== 'undefined' && navigator.storage && navigator.storage.getDirectory) {
    try {
      const opfsRoot = await navigator.storage.getDirectory();
      const fileHandle = await opfsRoot.getFileHandle(id);
      const file = await fileHandle.getFile();
      video.blob = file;
    } catch (err) {
      console.error("Failed to read from OPFS", err);
    }
  }
  
  return video;
}

export async function updateVideo(id: string, updates: Partial<VideoMetadata>): Promise<void> {
  const db = await initDB();
  const video = await db.get('videos', id);
  if (video) {
    await db.put('videos', { ...video, ...updates });
  }
}

export async function deleteVideo(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('videos', id);
  
  // Try to delete from OPFS as well
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.getDirectory) {
    try {
      const opfsRoot = await navigator.storage.getDirectory();
      await opfsRoot.removeEntry(id);
    } catch (err) {
      console.error(`Failed to delete OPFS entry for video ${id}:`, err);
    }
  }
}

export async function createFolder(name: string, parentId?: string): Promise<string> {
  const db = await initDB();
  const id = crypto.randomUUID();
  
  const folder: Folder = {
    id,
    name,
    createdAt: new Date(),
    parentId,
  };
  
  await db.add('folders', folder);
  return id;
}

export async function getFolders(parentId?: string): Promise<Folder[]> {
  const db = await initDB();
  
  if (parentId) {
    return await db.getAllFromIndex('folders', 'by-parent', parentId);
  }
  
  return await db.getAll('folders');
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<void> {
  const db = await initDB();
  const folder = await db.get('folders', id);
  if (folder) {
    await db.put('folders', { ...folder, ...updates });
  }
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await initDB();
  
  // Delete videos in folder
  const videos = await db.getAllFromIndex('videos', 'by-folder', id);
  for (const video of videos) {
    if (video.id) {
      await deleteVideo(video.id);
    }
  }
  
  // Delete subfolders
  const subfolders = await db.getAllFromIndex('folders', 'by-parent', id);
  for (const folder of subfolders) {
    await deleteFolder(folder.id!);
  }
  
  await db.delete('folders', id);
}

export async function deleteAllData(): Promise<void> {
  const db = await initDB();
  
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.getDirectory) {
    try {
      const opfsRoot = await navigator.storage.getDirectory();
      // @ts-ignore
      for await (const name of opfsRoot.keys()) {
        await opfsRoot.removeEntry(name);
      }
    } catch (err) {
      console.error('Failed to clear OPFS:', err);
    }
  }
  
  await db.clear('videos');
  await db.clear('folders');
}
