# PlayLikeYT 🎥

A completely serverless, high-performance local video library and player clone of YouTube, built specifically to provide the exact YouTube Desktop aesthetic and playback experience for your personal offline video files.

Built with **Next.js**, **React**, and **Tailwind CSS**.

## ✨ Features

- **Pixel-Perfect YouTube Aesthetic**: Implements YouTube's exact "Rich Grid" layout. Features identical card spacing, typography, border-radius manipulation, hover micro-animations, and exact UI components.
- **Advanced Local Storage Engine**: 
  - Uses the browser's **Origin Private File System (OPFS)** to handle massive gigabyte-sized video blobs natively. This results in zero-memory bloat and eliminates database crashes typical of large local files.
  - Pairs OPFS with **IndexedDB** for lightning-fast metadata, hierarchy, and folder querying.
- **Dynamic Thumbnail Extraction**: Automatically scrubs through and randomly extracts video frames as cover thumbnails locally using an `OffscreenCanvas`.
- **Pro Video Player**:
  - Full theater-mode toggle and Picture-in-Picture (PiP).
  - Centered visual feedback (e.g., when changing volume or speed).
  - Clean, custom HTML5 player UI that overrides default browser styling.
- **YouTube Keyboard Shortcuts**:
  - `Space` / `k`: Play/Pause
  - `f`: Toggle Fullscreen
  - `t`: Toggle Theatre mode
  - `m`: Mute
  - `j` / `l` or `Left` / `Right`: Seek backward/forward 10s
  - `Up` / `Down`: Adjust volume by 5%
  - `0` - `9`: Jump directly to a percentage of the video (e.g. `5` skips to 50%)
  - `` ` `` / `~`: Cycle playback speeds
- **Dark Mode Support**: Deeply integrated dark mode matching YouTube's `#0f0f0f` cinematic environment.
- **Local Analytics**: Calculates and displays total storage used by your uploads via `navigator.storage.estimate()`.

## 🚀 Getting Started

Since the entire application is powered by your browser's local sandbox, there is no backend setup required. 

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📖 Usage Guide

**1. Uploading Videos**
- Click the **Upload** icon (the cloud with an up arrow) in the top-right navigation bar.
- On the Upload page, you can drag and drop multiple video files (MP4, MKV, WebM, etc.) directly into the drop zone, or click to browse.
- PlayLikeYT will process each video sequentially, extract a dynamic thumbnail frame for the cover, and stream the file into your browser's internal OPFS storage. 
- A progress bar and a "Total Storage Used" tracker will update live to show you how much space is being consumed.

**2. Managing Folders (Playlists)**
- On the main homepage feed, you'll see a default "All Videos" grid. 
- You can create Folders (acting like playlists) on the Upload page to group specific videos together (e.g., "Lectures", "Movies", "Anime").
- Select a folder before uploading, and the videos will be organized into that folder automatically.

**3. Playing Videos**
- Click on any video card from the home feed to enter the cinematic player view.
- The sidebar will automatically populate with other videos from the same folder/playlist so you can easily continue watching related content.
- Use the keyboard shortcuts (like `Space` to pause, `f` for fullscreen, or `t` for theatre mode) to control your playback experience perfectly.

**4. Deleting Videos**
- Hover over any video card on the home feed and click the three vertical dots (⋮) in the top right corner of the thumbnail.
- Select **Delete** to instantly remove the video. This will wipe the metadata and permanently delete the binary file from your browser's OPFS storage, immediately freeing up disk space.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: `idb` for IndexedDB and `navigator.storage.getDirectory()` for Origin Private File System (OPFS)

## 📁 How OPFS Works in this App

To prevent the UI from freezing when uploading bulk video files, PlayLikeYT separates data:
- **IndexedDB** stores lightweight metadata: Video title, duration, base64 thumbnails, upload dates, and folder associations.
- **OPFS (Origin Private File System)** streams the actual binary video `Blob` natively onto the hard drive structure hidden in the browser profile. When a user clicks play, it creates a memory-mapped `File` handle directly into the `<video src>` tag, completely bypassing database parsing overhead.

## 📝 License

MIT
