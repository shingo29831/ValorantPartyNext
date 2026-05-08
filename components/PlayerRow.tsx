// src/components/PlayerRow.tsx
// AI Role: プレイヤー設定行UIコンポーネント
// 役割: 各プレイヤーの名前、ランク、希望ロール、固定チームを設定する入力UIを提供する。DnDによる入れ替えも担当する。

import React, { useState, useRef } from 'react';
import { Player, Rank, Tier, Role, Team, RandomizerConfig } from '../types';
import { ROLES } from '../constants/valorant';
import { RoleIcon } from './RoleIcon';
import { RankSelector } from './RankSelector';
import { GripVertical } from 'lucide-react';

interface Props {
  player: Player;
  index: number;
  config: RandomizerConfig;
  t: Record<string, string>;
  onUpdateName: (index: number, name: string) => void;
  onUpdateRank: (index: number, rank: Rank) => void;
  onUpdateTier: (index: number, tier: Tier) => void;
  onToggleRole: (index: number, role: Role) => void;
  onToggleTeam: (index: number, team: Team) => void;
  onSwapPlayers: (dragIndex: number, dropIndex: number) => void;
}

export const PlayerRow: React.FC<Props> = ({
  player,
  index,
  config,
  t,
  onUpdateName,
  onUpdateRank,
  onUpdateTier,
  onToggleRole,
  onSwapPlayers,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
    dragCounter.current = 0;
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(dragIndex) && dragIndex !== index) {
      onSwapPlayers(dragIndex, index);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-black/40 p-1.5 md:p-2 transition-all flex items-center gap-1.5 md:gap-3 cursor-grab active:cursor-grabbing rounded ${
        isDragOver 
          ? 'border-2 border-val-red shadow-[0_0_12px_rgba(255,70,85,0.8)] scale-[1.02] z-10' 
          : 'border border-val-gray/20 focus-within:border-val-red'
      }`}
    >
      <div className="text-val-gray shrink-0 flex items-center justify-center hover:text-white transition-colors">
        <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
      </div>

      <span className="text-val-gray font-bold w-4 md:w-5 text-sm md:text-lg text-right shrink-0">
        {index + 1}.
      </span>

      <input
        type="text"
        value={player.name}
        onChange={(e) => onUpdateName(index, e.target.value)}
        className="bg-transparent border-b border-val-gray/50 focus:border-val-red outline-none px-1 md:px-2 py-1 flex-1 text-sm md:text-lg min-w-[60px]"
        placeholder={t.playerName}
      />

      <div className="flex gap-1.5 md:gap-2 shrink-0 items-center">
        <RankSelector 
          rank={player.rank}
          tier={player.tier}
          onUpdateRank={(rank) => onUpdateRank(index, rank)}
          onUpdateTier={(tier) => onUpdateTier(index, tier)}
          t={t}
        />
      </div>

      {config.restrictAgents && (
        <div className="flex gap-0.5 md:gap-1.5 items-center bg-black/30 p-1 md:p-1.5 rounded border border-val-gray/30 shrink-0 pointer-events-none md:pointer-events-auto">
          {ROLES.map((role) => {
            const isSelected = config.restrictRoles || player.preferredRoles.includes(role);
            const isDisabled = config.restrictRoles;

            return (
              <button
                key={role}
                onClick={() => onToggleRole(index, role)}
                disabled={isDisabled}
                className={`p-1.5 md:p-2 rounded transition-colors ${
                  isSelected
                    ? 'bg-val-red/80 text-white shadow-[0_0_8px_rgba(255,70,85,0.6)]'
                    : 'bg-transparent text-val-gray hover:bg-val-gray/20 hover:text-white'
                } ${isDisabled ? 'cursor-not-allowed opacity-80' : 'pointer-events-auto'}`}
                title={isDisabled ? (t.randomRoleEnabled || 'Random Role Enabled') : (t[role] || role)}
              >
                <RoleIcon role={role} className="w-3.5 h-3.5 md:w-5 md:h-5 drop-shadow-md" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};