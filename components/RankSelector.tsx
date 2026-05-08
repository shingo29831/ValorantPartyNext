// src/components/RankSelector.tsx
// AI Role: ランク選択UIコンポーネント
// 役割: プレイヤーのランクとティアを画像ベースのポップアップメニューから選択できるようにする
// 背景: 親要素のoverflow制限を回避するため、createPortalを使用してDOMの階層をエスケープして描画する

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 画面外クリックで閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // スクロールや画面リサイズ時は表示ズレを防ぐためメニューを閉じる
  useEffect(() => {
    if (isOpen) {
      const handleScrollOrResize = () => setIsOpen(false);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen]);

  // 見切れ防止とPortal描画用の位置計算
  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const padding = 16; // 画面端からの安全余白

      // 基本位置（ボタンの中央）
      const defaultLeft = btnRect.left + (btnRect.width / 2);
      const halfMenuWidth = menuRect.width / 2;

      const arrowOuter = menuRef.current.querySelector('.menu-arrow-outer') as HTMLElement;
      const arrowInner = menuRef.current.querySelector('.menu-arrow-inner') as HTMLElement;

      if (defaultLeft - halfMenuWidth < padding) {
        // 左にはみ出す場合
        menuRef.current.style.left = `${padding}px`;
        menuRef.current.style.transform = `none`;
        
        // 吹き出しの三角形をボタンの位置に合わせる
        const arrowOffset = `${btnRect.left + (btnRect.width / 2) - padding}px`;
        if (arrowOuter) arrowOuter.style.left = arrowOffset;
        if (arrowInner) arrowInner.style.left = arrowOffset;
        
      } else if (defaultLeft + halfMenuWidth > window.innerWidth - padding) {
        // 右にはみ出す場合
        const adjustedLeft = window.innerWidth - padding - menuRect.width;
        menuRef.current.style.left = `${adjustedLeft}px`;
        menuRef.current.style.transform = `none`;
        
        // 吹き出しの三角形を調整
        const arrowOffset = `${btnRect.left + (btnRect.width / 2) - adjustedLeft}px`;
        if (arrowOuter) arrowOuter.style.left = arrowOffset;
        if (arrowInner) arrowInner.style.left = arrowOffset;
        
      } else {
        // 正常に収まる場合（中央揃え）
        menuRef.current.style.left = `${defaultLeft}px`;
        menuRef.current.style.transform = `translateX(-50%)`;
        
        if (arrowOuter) arrowOuter.style.left = `50%`;
        if (arrowInner) arrowInner.style.left = `50%`;
      }

      // 縦位置の設定（ボタンのすぐ下）
      menuRef.current.style.top = `${btnRect.bottom + 12}px`;
    }
  }, [isOpen]);

  const handleSelect = (selectedRank: Rank, selectedTier: Tier) => {
    onUpdateRank(selectedRank);
    onUpdateTier(selectedTier);
    setIsOpen(false);
  };

  // createPortalを使用してDOMツリーの外側（body直下）にメニューを描画
  const renderMenu = () => {
    if (!isOpen || !mounted) return null;

    return createPortal(
      <div
        ref={menuRef}
        className="fixed bg-val-dark/95 backdrop-blur-sm border border-val-gray/30 p-3 rounded-lg shadow-2xl z-9999 max-w-[90vw] md:max-w-none"
        style={{ top: '-9999px', left: '-9999px' }}
      >
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

        {/* 吹き出しの三角形 */}
        <div className="menu-arrow-outer absolute -top-4 -translate-x-1/2 border-8 border-transparent border-b-val-gray/30"></div>
        <div className="menu-arrow-inner absolute -top-3.5 -translate-x-1/2 border-8 border-transparent border-b-val-dark/95"></div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
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
      {renderMenu()}
    </>
  );
};