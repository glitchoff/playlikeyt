'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getVideo, VideoMetadata } from '@/lib/indexeddb';
import YouTubePlayerView from '@/components/YouTubePlayerView';
import YouTubeLayout from '@/components/YouTubeLayout';

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getVideo(id as string).then((v) => {
      setVideo(v || null);
      setLoading(false);
    });
  }, [id]);

  const createVideoUrl = (v: VideoMetadata) => {
    if (v.blob) {
      return URL.createObjectURL(v.blob);
    }
    return '';
  };

  const handleVideoSelect = (v: VideoMetadata) => {
    if (v.id) {
      router.push(`/video/${v.id}`);
    }
  };

  if (loading) {
    return (
      <YouTubeLayout currentView="player">
        <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </YouTubeLayout>
    );
  }

  if (!video) {
    return (
      <YouTubeLayout currentView="player">
        <div className="p-8 text-center bg-[#f9f9f9] min-h-screen">Video not found.</div>
      </YouTubeLayout>
    );
  }

  return (
    <YouTubeLayout currentView="player">
      <YouTubePlayerView
        video={video}
        onVideoSelect={handleVideoSelect}
        createVideoUrl={createVideoUrl}
      />
    </YouTubeLayout>
  );
}
