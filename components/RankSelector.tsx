// src/components/RankSelector.tsx
// AI Role: ランク選択UIコンポーネント
// 役割: プレイヤーのランクとティアを画像ベースのポップアップメニューから選択できるようにする

import React, { useState, useRef, useEffect } from 'react';
import { Rank, Tier } from '../types';
import { getRankImagePath } from '../utils/imageUtils';

interface Props {
  rank: Rank;
  tier: Tier;
  onUpdateRank: (rank: Rank) => void;
  onUpdateTier: (tier: Tier) => void;
  t: Record<string, string>;
}

const RANK_COLUMNS: { rank: Rank; tiers: Tier[] }[] = [
  { rank: 'None', tiers: [1] },
  { rank: 'Iron', tiers: [3, 2, 1] },
  { rank: 'Bronze', tiers: [3, 2, 1] },
  { rank: 'Silver', tiers: [3, 2, 1] },
  { rank: 'Gold', tiers: [3, 2, 1] },
  { rank: 'Platinum', tiers: [3, 2, 1] },
  { rank: 'Diamond', tiers: [3, 2, 1] },
  { rank: 'Ascendant', tiers: [3, 2, 1] },
  { rank: 'Immortal', tiers: [3, 2, 1] },
  { rank: 'Radiant', tiers: [1] },
];

export const RankSelector: React.FC<Props> = ({ rank, tier, onUpdateRank, onUpdateTier, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedRank: Rank, selectedTier: Tier) => {
    onUpdateRank(selectedRank);
    onUpdateTier(selectedTier);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 hover:bg-black/30 rounded border border-transparent hover:border-val-gray/50 transition-colors bg-black/20 shrink-0"
        title={rank === 'None' ? t.unranked : `${t[rank] || rank} ${rank !== 'Radiant' ? tier : ''}`}
      >
        <img
          src={getRankImagePath(rank, tier)}
          alt={rank}
          className="w-full h-full object-contain p-1 drop-shadow-md"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-val-dark/95 backdrop-blur-sm border border-val-gray/30 p-3 rounded-lg shadow-2xl z-50 max-w-[90vw] md:max-w-none">
          <div className="flex gap-1 md:gap-2 overflow-x-auto px-1 py-1 pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-val-gray/50 [&::-webkit-scrollbar-thumb]:rounded-full">
            {RANK_COLUMNS.map((col) => (
              <div key={col.rank} className="flex flex-col gap-2 md:gap-3 justify-end items-center w-16 md:w-20 shrink-0">
                {col.tiers.map((tVal) => {
                  const isSelected = rank === col.rank && (col.tiers.length === 1 || tier === tVal);
                  return (
                    <button
                      key={`${col.rank}-${tVal}`}
                      onClick={() => handleSelect(col.rank, tVal)}
                      className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded transition-colors border group relative shrink-0 ${isSelected ? 'bg-white/10 border-white/30' : 'border-transparent hover:bg-white/10 hover:border-white/20'}`}
                      title={col.rank === 'None' ? t.unranked : `${t[col.rank] || col.rank} ${col.tiers.length > 1 ? tVal : ''}`.trim()}
                    >
                      <img
                        src={getRankImagePath(col.rank, tVal)}
                        alt={`${col.rank} ${tVal}`}
                        className={`w-full h-full object-contain p-1 transition-transform group-hover:scale-110 ${isSelected ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] scale-110' : 'opacity-70 group-hover:opacity-100'}`}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </button>
                  );
                })}
                <span className="text-[9px] md:text-[10px] text-val-gray font-bold uppercase tracking-wider text-center w-full mt-1 truncate px-1">
                  {col.rank === 'None' ? t.unranked : (t[col.rank] || col.rank)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-val-gray/30"></div>
          <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 border-8 border-transparent border-b-val-dark/95"></div>
        </div>
      )}
    </div>
  );
};