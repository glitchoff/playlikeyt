'use client';

import YouTubeLayout from '@/components/YouTubeLayout';
import Link from 'next/link';
import { Info, MonitorPlay, Settings, ShieldCheck } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function AboutPage() {
  return (
    <YouTubeLayout currentView="about">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto mt-4">
        <div className="max-w-4xl space-y-10">
          
          {/* Header Section */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              About PlayLikeYT
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
              A modern, high-performance video management interface designed to provide a native YouTube-like experience for your personal media collection. Built with Next.js and Tailwind CSS.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-[#2a2a2a] transition-all hover:shadow-md">
              <MonitorPlay className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Native Experience</h3>
              <p className="text-gray-600 dark:text-gray-400">Enjoy familiar player controls, keyboard shortcuts, and a seamless responsive interface that feels just like YouTube.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-[#2a2a2a] transition-all hover:shadow-md">
              <Settings className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Advanced Controls</h3>
              <p className="text-gray-600 dark:text-gray-400">Double-tap to seek, adjustable playback speeds, picture-in-picture mode, and persistent progress tracking.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-[#2a2a2a] transition-all hover:shadow-md">
              <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Local First</h3>
              <p className="text-gray-600 dark:text-gray-400">Your videos stay on your device. Powered by local storage and IndexedDB for lightning-fast performance.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-[#2a2a2a] transition-all hover:shadow-md">
              <Info className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Modern Tech Stack</h3>
              <p className="text-gray-600 dark:text-gray-400">Built using Next.js App Router, React 18, Tailwind CSS, and Lucide Icons for a robust foundation.</p>
            </div>
          </div>

          {/* Keyboard Shortcuts Section */}
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20 mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              Keyboard Shortcuts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Cycle Playback Speed</span>
                <kbd className="px-2 py-1 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3f3f3f] rounded-md font-mono text-gray-900 dark:text-white shadow-sm">` / ~</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Toggle Play/Pause</span>
                <kbd className="px-2 py-1 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3f3f3f] rounded-md font-mono text-gray-900 dark:text-white shadow-sm">Space / K</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Toggle Fullscreen</span>
                <kbd className="px-2 py-1 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3f3f3f] rounded-md font-mono text-gray-900 dark:text-white shadow-sm">F</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Seek 10s Backward/Forward</span>
                <kbd className="px-2 py-1 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3f3f3f] rounded-md font-mono text-gray-900 dark:text-white shadow-sm">J / L</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Volume Up/Down</span>
                <kbd className="px-2 py-1 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3f3f3f] rounded-md font-mono text-gray-900 dark:text-white shadow-sm">↑ / ↓</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Mute Toggle</span>
                <kbd className="px-2 py-1 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3f3f3f] rounded-md font-mono text-gray-900 dark:text-white shadow-sm">M</kbd>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-6 border-t border-gray-200 dark:border-[#2a2a2a]">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Open Source</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://github.com/glitchoff/playlikeyt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-6 py-3.5 rounded-full font-medium transition-colors shadow-sm"
              >
                <GithubIcon className="w-5 h-5" />
                View Source on GitHub
              </a>
              <Link 
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#272727] dark:hover:bg-[#3f3f3f] text-gray-900 dark:text-white px-6 py-3.5 rounded-full font-medium transition-colors"
              >
                Back to Feed
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </YouTubeLayout>
  );
}
