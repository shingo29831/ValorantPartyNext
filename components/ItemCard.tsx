// src/components/ItemCard.tsx
// AI Role: 汎用アイテムカードUI
// 役割: エージェント、武器、マップの画像と、BAN状態・重み（確率）の表示・操作を提供する

import React, { useState, useRef, useEffect } from 'react';
import { Ban, ChevronDown, ChevronUp } from 'lucide-react';
import { getImagePath } from '../utils/imageUtils';

interface Props {
  item: string;
  category: 'maps' | 'weapons' | 'agents';
  isBanned: boolean;
  currentWeight: number;
  totalActiveWeight: number;
  onToggleBan: () => void;
  onUpdateWeight: (weight: number) => void;
  t: Record<string, string>;
  className?: string;
}

export const ItemCard: React.FC<Props> = ({ item, category, isBanned, currentWeight, totalActiveWeight, onToggleBan, onUpdateWeight, t, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const [showWeightOverlay, setShowWeightOverlay] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setShowWeightOverlay(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowWeightOverlay(false);
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentWeight]);

  const probability = (!isBanned && totalActiveWeight > 0) 
    ? ((currentWeight / totalActiveWeight) * 100).toFixed(1) 
    : '0.0';
    
  const aspectClass = category === 'agents' ? 'aspect-[2/3]' : 'aspect-video';
  const bgClass = category === 'maps' ? 'bg-white' : 'bg-black/50';

  const displayName = t[item] || item;

  return (
    <div className={`flex flex-col gap-2 group/card ${className}`}>
      <button
        onClick={onToggleBan}
        className={`relative w-full rounded overflow-hidden border-2 transition-all group ${isBanned ? 'border-val-red shadow-[0_0_8px_rgba(255,70,85,0.4)]' : 'border-val-gray/20 hover:border-val-gray/60'} ${aspectClass} ${bgClass}`}
        title={`${displayName} (${isBanned ? (t.bannedStatus || 'Banned') : 'Active'})`}
      >
        {!imgError ? (
          <img
            src={getImagePath(category, item)}
            alt={item}
            className={`w-full h-full transition-transform duration-300 ${category === 'weapons' ? 'object-contain p-2' : 'object-cover object-top'} ${isBanned ? 'grayscale opacity-40' : 'opacity-100 group-hover:scale-110'}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-center p-2">
            <span className={`text-xs md:text-sm font-bold uppercase break-all ${isBanned ? 'text-val-gray' : 'text-val-light'}`}>{displayName}</span>
          </div>
        )}
        
        {isBanned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/30 z-10">
            <Ban className="w-10 h-10 md:w-14 md:h-14 text-val-red drop-shadow-md mb-1" />
            <span className="text-xs md:text-sm text-white font-bold leading-tight px-1 whitespace-nowrap tracking-wider">{t.banned || "BANNED"}</span>
          </div>
        )}

        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 pointer-events-none transition-opacity ${showWeightOverlay && !isBanned ? 'opacity-100 duration-75' : 'opacity-0 duration-1000 ease-out'}`}
        >
          <span className="text-val-gray text-sm md:text-base uppercase font-bold tracking-widest">{t.weight}</span>
          <span className="text-6xl md:text-7xl text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">{currentWeight}</span>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/70 to-transparent p-2 pt-10 pointer-events-none text-center z-10">
          <div className={`font-bold text-sm md:text-base truncate drop-shadow-md flex items-center justify-center gap-2 ${isBanned ? 'text-val-gray line-through' : 'text-white'}`}>
            <span>{displayName}</span>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between px-2 py-2 md:py-3 bg-black/40 rounded border border-val-gray/30 relative gap-2 mt-auto">
        <button 
          onClick={() => onUpdateWeight(Math.max(0, currentWeight - 1))} 
          disabled={isBanned}
          className={`text-val-gray hover:text-val-red transition-all duration-300 p-2 bg-black/50 rounded hover:bg-black/80 border border-transparent hover:border-val-red/30 shrink-0 ${isBanned ? 'invisible' : 'opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto'}`} 
          title="Decrease Weight"
        >
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        
        <span className={`text-xl md:text-2xl lg:text-3xl font-mono font-bold text-center flex-1 tracking-wider transition-colors ${isBanned ? 'text-val-gray/50' : 'text-val-light'}`}>
          {probability}%
        </span>

        <button 
          onClick={() => onUpdateWeight(Math.max(0, currentWeight + 1))} 
          disabled={isBanned}
          className={`text-val-gray hover:text-val-red transition-all duration-300 p-2 bg-black/50 rounded hover:bg-black/80 border border-transparent hover:border-val-red/30 shrink-0 ${isBanned ? 'invisible' : 'opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto'}`} 
          title="Increase Weight"
        >
          <ChevronUp className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
    </div>
  );
};