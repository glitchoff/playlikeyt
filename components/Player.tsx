// Player.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Player.css';
import {
  Play,
  Pause,
  Volume as VolumeIcon,
  MoreVertical,
  Image as ImageIcon,
  Copy as CopyIcon,
  Monitor,
  MonitorOff,
  Settings,
  Maximize2,
  FileText,
  PictureInPicture,
  Volume1,
  Volume2,
  VolumeX,
  BookmarkPlus as BookmarkIcon,
} from 'lucide-react';
import { Bookmark } from '@/lib/indexeddb';

/**
 * Player.tsx
 * - React + TypeScript single-file player component using lucide-react icons
 * - Save/Copy frame actions are in a popover menu (three-dot)
 *
 * Usage:
 * <Player src="/data/videos/example.mp4" poster="/thumb.jpg" subtitleUrl="/data/subtitles/example.vtt" mediaId={123} />
 *
 * Notes:
 * - Wire playback progress API calls where TODO markers are.
 * - ASS subtitle rendering (octopus/libjass) not included here; we inject VTT tracks.
 */

type Props = {
  src: string;
  poster?: string;
  subtitleUrl?: string | null;
  mediaId?: number | null;
  className?: string;
  onEnded?: () => void;
  bookmarks?: Bookmark[];
  onAddBookmark?: (time: number) => void;
};

const SAVE_INTERVAL_MS = 5000;

export const SeekBus = {
  subs: new Set<(s: number) => void>(),
  on(cb: (s: number) => void) {
    this.subs.add(cb);
    return () => { this.subs.delete(cb); };
  },
  emit(seconds: number) {
    for (const cb of this.subs) cb(seconds);
  },
};

export default function Player({ src, poster, subtitleUrl = null, mediaId = null, className, onEnded, bookmarks = [], onAddBookmark }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dur, setDur] = useState<number>(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [ambient, setAmbient] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(Boolean(subtitleUrl));
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [centerFeedback, setCenterFeedback] = useState<React.ReactNode | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const drawRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const initialSpeedRef = useRef(speed);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTogglingPlayRef = useRef(false);

  const togglePlay = useCallback(() => {
    if (!videoRef.current || isTogglingPlayRef.current) return;
    isTogglingPlayRef.current = true;
    if (videoRef.current.paused) {
      videoRef.current.play()
        .catch(err => console.debug('Play interrupted', err))
        .finally(() => { setTimeout(() => isTogglingPlayRef.current = false, 50); });
    } else {
      videoRef.current.pause();
      setTimeout(() => isTogglingPlayRef.current = false, 50);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(console.error);
    } else {
      document.exitFullscreen?.().catch(console.error);
    }
  }, []);
  
  const showFeedback = useCallback((content: React.ReactNode) => {
    setCenterFeedback(content);
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setCenterFeedback(null);
    }, 800) as unknown as number;
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    if (playing) {
      hideTimeoutRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 2500) as unknown as number;
    }
  }, [playing]);

  useEffect(() => {
    showControls();
  }, [playing, showControls]);

  // --- speed indicator effect ---
  useEffect(() => {
    if (initialSpeedRef.current !== speed) {
      showFeedback(`${speed}x`);
      initialSpeedRef.current = speed;
    }
  }, [speed, showFeedback]);

  // --- restore volume from localStorage ---
  useEffect(() => {
    const saved = localStorage.getItem('playlikeyt-volume');
    if (saved !== null) {
      const v = parseFloat(saved);
      if (!isNaN(v)) {
        setVolume(v);
        if (videoRef.current) {
          videoRef.current.volume = v;
          videoRef.current.muted = v === 0;
        }
      }
    }
  }, []);

  // --- keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

      const key = e.key.toLowerCase();
      const code = e.code;

      if (code === 'Backquote' || key === '`' || key === '~') {
        e.preventDefault();
        setSpeed((prev) => {
          const newSpeed = e.ctrlKey ? (prev === 3 ? 1 : 3) : (prev === 2 ? 1 : 2);
          v.playbackRate = newSpeed;
          return newSpeed;
        });
        return;
      }

      switch (key) {
        case 'k':
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'j':
        case 'arrowleft':
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 10);
          break;
        case 'l':
        case 'arrowright':
          e.preventDefault();
          v.currentTime = Math.min(v.duration || Infinity, v.currentTime + 10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((prev) => {
            const nv = Math.max(0, Math.min(1, Math.round((prev + 0.05) * 100) / 100));
            if (videoRef.current) {
              videoRef.current.volume = nv;
              videoRef.current.muted = nv === 0;
            }
            localStorage.setItem('playlikeyt-volume', nv.toString());
            
            let Icon = Volume2;
            if (nv === 0) Icon = VolumeX;
            else if (nv < 0.5) Icon = Volume1;
            
            showFeedback(
              <div className="flex items-center gap-2">
                <Icon size={28} /> {Math.round(nv * 100)}%
              </div>
            );
            return nv;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((prev) => {
            const nv = Math.max(0, Math.min(1, Math.round((prev - 0.05) * 100) / 100));
            if (videoRef.current) {
              videoRef.current.volume = nv;
              videoRef.current.muted = nv === 0;
            }
            localStorage.setItem('playlikeyt-volume', nv.toString());
            
            let Icon = Volume2;
            if (nv === 0) Icon = VolumeX;
            else if (nv < 0.5) Icon = Volume1;
            
            showFeedback(
              <div className="flex items-center gap-2">
                <Icon size={28} /> {Math.round(nv * 100)}%
              </div>
            );
            return nv;
          });
          break;
        case 'm':
          e.preventDefault();
          v.muted = !v.muted;
          const newVol = v.muted ? 0 : v.volume || 1;
          setVolume(newVol);
          localStorage.setItem('playlikeyt-volume', newVol.toString());
          break;
        case '0': case '1': case '2': case '3': case '4': 
        case '5': case '6': case '7': case '8': case '9':
          e.preventDefault();
          const percent = parseInt(key) * 10;
          v.currentTime = (v.duration || 0) * (percent / 100);
          showFeedback(`${percent}%`);
          break;
        case 't':
          e.preventDefault();
          document.body.classList.toggle('player-theatre-mode');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, toggleFullscreen]);

  // --- wire video events ---
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onDur = () => setDur(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEndedEvent = () => {
      setPlaying(false);
      if (onEnded) onEnded();
    };

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('durationchange', onDur);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEndedEvent);

    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('durationchange', onDur);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEndedEvent);
    };
  }, [onEnded]);

  // --- periodic save progress (placeholder) ---
  useEffect(() => {
    let id: number | null = null;
    const save = async () => {
      const v = videoRef.current;
      if (!v || !mediaId || Number.isNaN(mediaId)) return;
      const offset = Math.floor(v.currentTime);
      const pct = dur ? Math.min(Math.round((offset / dur) * 100), 100) : 0;
      if (pct < 5) return; // match Vue logic: don't save <5% progress
      // TODO: call upsertProgress(mediaId, { progress_offset: offset })
      console.debug('[Player] save progress', { mediaId, offset });
    };
    id = window.setInterval(save, SAVE_INTERVAL_MS) as unknown as number;
    return () => {
      if (id) window.clearInterval(id);
      save();
    };
  }, [mediaId, dur]);

  // --- seek bus subscription ---
  useEffect( () => {
    const unsub = SeekBus.on((s) => {
      const v = videoRef.current;
      if (v) v.currentTime = s;
    });
    return unsub;
  }, []);

  // --- subtitle injection (VTT only) ---
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // cleanup old subtitle tracks
    v.querySelectorAll('track[kind="subtitles"]').forEach((t) => t.remove());
    if (subtitleUrl && subtitlesOn) {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = 'Subs';
      track.srclang = 'en';
      track.src = subtitleUrl;
      track.default = true;
      track.addEventListener('error', () => console.warn('Subtitle failed to load', subtitleUrl));
      v.appendChild(track);
    }
    return () => {
      v.querySelectorAll('track[kind="subtitles"]').forEach((t) => t.remove());
    };
  }, [subtitleUrl, subtitlesOn]);

  // --- frame capture: download or copy ---
  const captureFrame = useCallback(
    async (copy = false) => {
      const v = videoRef.current;
      if (!v) return;
      if (!v.videoWidth || !v.videoHeight) {
        alert('Wait for video to load metadata before capturing a frame.');
        return;
      }
      const c = document.createElement('canvas');
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const blob = await new Promise<Blob | null>((res) => c.toBlob((b) => res(b), 'image/png'));
      if (!blob) {
        alert('Failed to generate frame.');
        return;
      }
      if (copy && navigator.clipboard && (window as any).ClipboardItem) {
        try {
          // @ts-ignore
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          // simple feedback
          console.debug('Frame copied to clipboard');
        } catch (err) {
          alert('Clipboard copy failed. Requires HTTPS and permissions.');
          console.error(err);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `frame-${v.currentTime.toFixed(2)}s.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setPopoverOpen(false); // close menu after action
    },
    [setPopoverOpen],
  );

  // --- ambient canvas blending effect ---
  const blendStrength = 0.03;
  const ambientStep = useCallback(() => {
    const v = videoRef.current;
    const canvas = ambientCanvasRef.current;
    if (!v || !canvas) {
      drawRef.current = requestAnimationFrame(ambientStep);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      drawRef.current = requestAnimationFrame(ambientStep);
      return;
    }
    if (v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      drawRef.current = requestAnimationFrame(ambientStep);
      return;
    }

    const w = (canvas.width = v.videoWidth || v.clientWidth || 640);
    const h = (canvas.height = v.videoHeight || v.clientHeight || 360);
    ctx.drawImage(v, 0, 0, w, h);

    const newFrame = ctx.getImageData(0, 0, w, h);
    const prev = prevFrameRef.current;
    if (prev && prev.width === newFrame.width && prev.height === newFrame.height) {
      const nd = newFrame.data;
      const pd = prev.data;
      for (let i = 0; i < nd.length; i += 4) {
        nd[i] = nd[i] * blendStrength + pd[i] * (1 - blendStrength);
        nd[i + 1] = nd[i + 1] * blendStrength + pd[i + 1] * (1 - blendStrength);
        nd[i + 2] = nd[i + 2] * blendStrength + pd[i + 2] * (1 - blendStrength);
      }
      ctx.putImageData(newFrame, 0, 0);
    }
    prevFrameRef.current = newFrame;
    drawRef.current = requestAnimationFrame(ambientStep);
  }, []);

  useEffect(() => {
    if (ambient) {
      if (drawRef.current) cancelAnimationFrame(drawRef.current);
      drawRef.current = requestAnimationFrame(ambientStep);
    } else {
      if (drawRef.current) cancelAnimationFrame(drawRef.current);
      drawRef.current = null;
      prevFrameRef.current = null;
    }
    return () => {
      if (drawRef.current) cancelAnimationFrame(drawRef.current);
      drawRef.current = null;
    };
  }, [ambient, ambientStep]);

  // --- click outside popover close ---
  const popoverRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!popoverOpen && !speedMenuOpen) return;
      const target = e.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        setPopoverOpen(false);
        setSpeedMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [popoverOpen, speedMenuOpen]);

  // --- basic stats placeholder ---
  const [stats, setStats] = useState({ resolution: 'Unknown', bitrate: 'Unknown', frameHealth: '0/0' });
  useEffect(() => {
    let t: number | null = null;
    const sample = () => {
      const v = videoRef.current;
      if (!v) return;
      const resolution = v.videoWidth ? `${v.videoWidth}x${v.videoHeight}` : 'Unknown';
      setStats((s) => ({ ...s, resolution }));
      t = window.setTimeout(sample, 2000);
    };
    sample();
    return () => {
      if (t) clearTimeout(t);
    };
  }, []);

  return (
    <div className={`ms-player ${className ?? ''}`}>
      <canvas
        className="ms-ambient"
        ref={ambientCanvasRef}
        style={{ opacity: ambient ? 0.36 : 0, pointerEvents: 'none' }}
        aria-hidden
      />

      <div 
        ref={containerRef}
        className="ms-video-wrap" 
        onMouseMove={showControls} 
        onMouseLeave={() => playing && setControlsVisible(false)}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.ms-bottom-bar, .ms-top-controls, .ms-play-center, .ms-popover-menu')) return;
          togglePlay();
        }}
        onDoubleClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.ms-bottom-bar, .ms-top-controls, .ms-play-center, .ms-popover-menu')) return;
          toggleFullscreen();
        }}
      >
        <video ref={videoRef} className="ms-video" src={src} poster={poster} playsInline />

        {/* three-dot popover (top-right) */}
        <div className={`ms-top-controls ${controlsVisible ? '' : 'ms-controls-hidden'}`}>
          <div className="ms-popover" ref={popoverRef}>
            <button
              className="ms-btn icon"
              aria-haspopup="menu"
              aria-expanded={popoverOpen}
              onClick={() => setPopoverOpen((p) => !p)}
              title="More"
            >
              <MoreVertical />
            </button>
            {popoverOpen && (
              <div className="ms-popover-menu" role="menu">
                <button className="ms-popover-item" role="menuitem" onClick={() => { setSubtitlesOn((s) => !s); setPopoverOpen(false); }}>
                  <FileText size={16} /> {subtitlesOn ? 'Hide Subtitles' : 'Show Subtitles'}
                </button>
                <button className="ms-popover-item" role="menuitem" onClick={() => { setAmbient((a) => !a); setPopoverOpen(false); }}>
                  {ambient ? <MonitorOff size={16} /> : <Monitor size={16} />} {ambient ? 'Disable Ambient' : 'Enable Ambient'}
                </button>
                <button className="ms-popover-item" role="menuitem" onClick={() => { setShowStats((s) => !s); setPopoverOpen(false); }}>
                  <Settings size={16} /> {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
                <div className="ms-popover-divider" />
                <button className="ms-popover-item" role="menuitem" onClick={() => captureFrame(false)}>
                  <ImageIcon size={16} /> Save frame
                </button>
                <button className="ms-popover-item" role="menuitem" onClick={() => captureFrame(true)}>
                  <CopyIcon size={16} /> Copy frame
                </button>
              </div>
            )}
          </div>
        </div>

        {/* center play icon when paused */}
        {!playing && (
          <button
            className="ms-play-center"
            onClick={togglePlay}
            aria-label="Play"
          >
            <Play size={36} />
          </button>
        )}

        {/* center feedback popup indicator */}
        {centerFeedback && (
          <div className="ms-speed-indicator">
            {centerFeedback}
          </div>
        )}

        {/* bottom controls wrapper */}
        <div className={`ms-bottom-bar ${controlsVisible ? '' : 'ms-controls-hidden'}`}>
          <div className="ms-timeline" style={{ position: 'relative' }}>
            <input
              className="ms-timeline-range"
              type="range"
              min={0}
              max={dur || 0}
              step={0.1}
              value={current}
              style={{
                background: `linear-gradient(90deg, #ffcf33 ${(current / (dur || 1)) * 100}%, rgba(255,255,255,0.2) ${(current / (dur || 1)) * 100}%)`,
                position: 'relative',
                zIndex: 2,
              }}
              onChange={(e) => {
                const t = Number(e.target.value || 0);
                if (videoRef.current) videoRef.current.currentTime = t;
                setCurrent(t);
              }}
            />
            {/* Bookmark Dots */}
            {dur > 0 && bookmarks.map((b, i) => {
              const leftPct = (b.time / dur) * 100;
              return (
                <div
                  key={i}
                  title={b.label}
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    zIndex: 3,
                    pointerEvents: 'none',
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                  }}
                />
              );
            })}
          </div>

          <div className="ms-controls">
            <div className="ms-controls-left">
              <button
                className="ms-btn"
                title={playing ? 'Pause' : 'Play'}
                onClick={togglePlay}
              >
                {playing ? <Pause /> : <Play />}
              </button>

              <button
                className="ms-btn small"
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = Math.max(0, (videoRef.current.currentTime || 0) - 10);
                }}
                title="Rewind 10s"
              >
                -10s
              </button>
              <button
                className="ms-btn small"
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = Math.min((videoRef.current.duration || 0), (videoRef.current.currentTime || 0) + 10);
                }}
                title="Forward 10s"
              >
                +10s
              </button>

              <div className="ms-volume">
                <VolumeIcon size={20} />
                <input
                  className="ms-range"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  style={{
                    background: `linear-gradient(90deg, #fff ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
                  }}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    localStorage.setItem('playlikeyt-volume', v.toString());
                    if (videoRef.current) {
                      videoRef.current.volume = v;
                      videoRef.current.muted = v === 0;
                    }
                  }}
                  aria-label="Volume"
                />
              </div>

              <div className="ms-time">
                <span>{formatTime(current)}</span>
                <span> / </span>
                <span>{formatTime(dur)}</span>
              </div>
            </div>

            <div className="ms-controls-right">
            {onAddBookmark && (
              <button 
                className="ms-btn" 
                onClick={() => {
                  if (videoRef.current) onAddBookmark(videoRef.current.currentTime);
                }} 
                title="Add Bookmark"
              >
                <BookmarkIcon size={16} />
              </button>
            )}

            <div className="ms-popover" ref={popoverRef}>
              <button 
                className="ms-btn icon" 
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)} 
                title="Playback speed"
              >
                <Settings size={16} />
              </button>
              {speedMenuOpen && (
                <div className="ms-popover-menu" style={{ top: 'auto', bottom: '42px', minWidth: '120px' }}>
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4].map((v) => (
                    <button 
                      key={v} 
                      className="ms-popover-item"
                      onClick={() => {
                        setSpeed(v);
                        if (videoRef.current) videoRef.current.playbackRate = v;
                        setSpeedMenuOpen(false);
                      }}
                    >
                      {v}x {speed === v && '✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="ms-btn" 
              onClick={() => { 
                if (videoRef.current && document.pictureInPictureEnabled) {
                  if (videoRef.current.readyState < 1) {
                    console.debug('Wait for video metadata to load before entering PiP.');
                    return;
                  }
                  if (document.pictureInPictureElement) {
                    document.exitPictureInPicture().catch(console.error);
                  } else {
                    videoRef.current.requestPictureInPicture().catch(console.error);
                  }
                } 
              }} 
              title="Miniplayer (i)"
            >
              <PictureInPicture size={16} />
            </button>

            <button className="ms-btn" onClick={toggleFullscreen} title="Fullscreen (f)">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

        {/* stats popup */}
        {showStats && (
          <div className="ms-stats">
            <h5>Player Info</h5>
            <p>Resolution: {stats.resolution}</p>
            <p>Bitrate: {stats.bitrate}</p>
            <p>Frame Health: {stats.frameHealth}</p>
          </div>
        )}
      </div>
    </div>
  );  
}

// small helper
function formatTime(s: number) {
  if (!Number.isFinite(s) || s <= 0) return '0:00';
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  const m = Math.floor(s / 60);
  return `${m}:${sec}`;
}