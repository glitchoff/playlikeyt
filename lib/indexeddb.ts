import { openDB, DBSchema, IDBPDatabase } from 'idb';

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

let db: IDBPDatabase<VideoDBSchema>;

export async function initDB(): Promise<IDBPDatabase<VideoDBSchema>> {
  if (db) return db;
  
  db = await openDB<VideoDBSchema>('VideoPlayerDB', 1, {
    upgrade(db) {
      const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
      videoStore.createIndex('by-folder', 'folderId');
      videoStore.createIndex('by-date', 'uploadedAt');
      
      const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
      folderStore.createIndex('by-parent', 'parentId');
    },
  });
  
  return db;
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

export async function getVideos(folderId?: string): Promise<VideoMetadata[]> {
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
      // Might not exist in OPFS, safely ignore
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
      await db.delete('videos', video.id);
    }
  }
  
  // Delete subfolders
  const subfolders = await db.getAllFromIndex('folders', 'by-parent', id);
  for (const folder of subfolders) {
    await deleteFolder(folder.id!);
  }
  
  await db.delete('folders', id);
}
