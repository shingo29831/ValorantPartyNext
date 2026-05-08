// src/components/QuickBanCarousel.tsx
// AI Role: カルーセルUIコンポーネント
// 役割: 初期画面でのアイテムカード一覧を横スクロール可能なカルーセル形式で表示する

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemCard } from './ItemCard';

interface Props {
  title: string;
  items: string[];
  category: 'maps' | 'weapons' | 'agents';
  bannedList: string[];
  weights: Record<string, number>;
  onToggle: (item: string) => void;
  onUpdateWeight: (item: string, weight: number) => void;
  t: Record<string, string>;
}

export const QuickBanCarousel: React.FC<Props> = ({ title, items, category, bannedList, weights, onToggle, onUpdateWeight, t }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const widthClass = category === 'agents' ? 'w-32 md:w-40 lg:w-48' : 'w-48 md:w-64 lg:w-72';
  const activeWeight = items.reduce((sum, item) => bannedList.includes(item) ? sum : sum + (weights[item] ?? 10), 0);
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end px-1 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm md:text-base font-bold text-val-gray">{title}</span>
          <span className="text-[10px] md:text-xs text-val-gray/50 italic tracking-wider">
            {t.clickToBanHint || "画像をクリックでBAN"}
          </span>
        </div>
      </div>
      <div className="relative group flex items-center">
        <button 
          onClick={() => scroll('left')} 
          className="absolute left-0 z-20 bg-black/80 hover:bg-val-red p-2 md:p-3 rounded-r opacity-0 group-hover:opacity-100 transition-all shadow-lg"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] w-full px-2">
          {items.map(item => {
            const isBanned = bannedList.includes(item);
            const currentWeight = weights[item] ?? 10;
            return (
              <ItemCard
                key={item}
                item={item}
                category={category}
                isBanned={isBanned}
                currentWeight={currentWeight}
                totalActiveWeight={activeWeight}
                onToggleBan={() => onToggle(item)}
                onUpdateWeight={(w) => onUpdateWeight(item, w)}
                t={t}
                className={`shrink-0 snap-start ${widthClass} relative`}
              />
            );
          })}
        </div>

        <button 
          onClick={() => scroll('right')} 
          className="absolute right-0 z-20 bg-black/80 hover:bg-val-red p-2 md:p-3 rounded-l opacity-0 group-hover:opacity-100 transition-all shadow-lg"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </button>
      </div>
    </div>
  );
};