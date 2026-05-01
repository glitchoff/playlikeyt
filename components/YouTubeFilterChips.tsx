'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
        isActive
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

export default function YouTubeFilterChips() {
  const [activeChip, setActiveChip] = useState('All');
  const [scrollPosition, setScrollPosition] = useState(0);

  const chips = [
    'All',
    'Music',
    'Mixes',
    'J-Pop',
    'Podcasts',
    'Gaming',
    'Reaction videos',
    'APIs',
    'Live',
    'AI',
    'Original video animation',
    'Audio commentaries',
    'Algorithms',
    'Media theories',
    'Pokémon',
    'Psychology',
    'Guitar',
    'Role-Playing Games',
    'Recently uploaded',
    'Watched',
    'New to you'
  ];

  const scrollLeft = () => {
    const container = document.getElementById('chips-container');
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
      setScrollPosition(Math.max(0, scrollPosition - 200));
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('chips-container');
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
      setScrollPosition(scrollPosition + 200);
    }
  };

  return (
    <div className="sticky top-14 z-40 bg-white border-b border-gray-200">
      <div className="relative">
        {/* Left Arrow */}
        {scrollPosition > 0 && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1.5 sm:p-2 shadow-md border border-gray-200"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}

        {/* Chips Container */}
        <div className="overflow-hidden">
          <div
            id="chips-container"
            className="flex gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 overflow-x-auto scrollbar-hide"
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          >
            {chips.map((chip) => (
              <FilterChip
                key={chip}
                label={chip}
                isActive={activeChip === chip}
                onClick={() => setActiveChip(chip)}
              />
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1.5 sm:p-2 shadow-md border border-gray-200"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
