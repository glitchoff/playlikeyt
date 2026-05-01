'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, PictureInPicture } from 'lucide-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface EnhancedVideoPlayerProps {
  src: string;
  thumbnail?: string;
  title?: string;
}

export default function EnhancedVideoPlayer({ src, thumbnail, title }: EnhancedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Video.js player
    const player = videojs(videoRef.current, {
      controls: false, // We'll use custom controls
      responsive: true,
      fluid: true,
      poster: thumbnail,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
    });

    playerRef.current = player;

    // Set up event listeners
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('timeupdate', () => {
      setCurrentTime(player.currentTime() || 0);
      setDuration(player.duration() || 0);
    });
    player.on('loadedmetadata', () => {
      setDuration(player.duration() || 0);
    });
    player.on('volumechange', () => {
      setVolume(player.volume() || 0);
      setIsMuted(player.muted() || false);
    });
    player.on('fullscreenchange', () => {
      setIsFullscreen(player.isFullscreen() || false);
    });

    // Load the video source
    if (src) {
      player.src({ type: 'video/mp4', src });
      player.ready(() => {
        console.log('Video player ready with source:', src);
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [src, thumbnail]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    if (!progressBar || !playerRef.current) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    playerRef.current.currentTime(pos * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.volume(newVolume);
      playerRef.current.muted(newVolume === 0);
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (playerRef.current) {
      const newMuted = !isMuted;
      playerRef.current.muted(newMuted);
      setIsMuted(newMuted);
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (isFullscreen) {
        playerRef.current.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen();
      }
    }
  };

  const skip = (seconds: number) => {
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(duration, playerRef.current.currentTime() + seconds));
      playerRef.current.currentTime(newTime);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate(rate);
      setPlaybackRate(rate);
    }
  };

  const changeQuality = (newQuality: string) => {
    if (playerRef.current) {
      // This would need to be implemented based on available sources
      setQuality(newQuality);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const togglePictureInPicture = () => {
    if (videoRef.current && 'requestPictureInPicture' in videoRef.current) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        (videoRef.current as any).requestPictureInPicture();
      }
    }
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group" onMouseMove={showControlsTemporarily} onMouseLeave={() => isPlaying && setShowControls(false)}>
      {/* Video.js Container */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered"
          data-setup='{"fluid": true}'
          onClick={togglePlay}
        />
      </div>
      
      {/* Enhanced Overlay Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* Play/Pause Button in Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 pointer-events-auto cursor-pointer" onClick={togglePlay}>
              <Play className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div 
            ref={progressBarRef}
            className="relative h-1 bg-white/30 rounded-full mb-4 cursor-pointer group/hover"
            onClick={handleSeek}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-red-600 rounded-full transition-all duration-150"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/hover:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button 
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              {/* Skip Back */}
              <button 
                onClick={() => skip(-10)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Skip Forward */}
              <button 
                onClick={() => skip(10)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Time */}
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Rate */}
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="bg-white/20 text-white text-xs px-2 py-1 rounded border border-white/30"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>

              {/* Quality */}
              <select
                value={quality}
                onChange={(e) => changeQuality(e.target.value)}
                className="bg-white/20 text-white text-xs px-2 py-1 rounded border border-white/30"
              >
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>

              {/* Picture in Picture */}
              <button
                onClick={togglePictureInPicture}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Picture in Picture"
              >
                <PictureInPicture className="w-5 h-5" />
              </button>

              {/* Settings */}
              <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* Fullscreen */}
              <button 
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      {title && (
        <div className="absolute top-4 left-4 text-white pointer-events-none">
          <h3 className="text-lg font-semibold drop-shadow-lg">{title}</h3>
        </div>
      )}
    </div>
  );
}
