// src/components/PlayerCard.tsx
// AI Role: プレイヤーの生成結果カードUI
// 役割: 各プレイヤーに割り当てられたエージェント、武器、ランクなどを表示する結果画面用カードコンポーネント

import React, { useState } from 'react';
import { PlayerResult } from '../types';
import { RoleIcon } from './RoleIcon';
import { getImagePath, getRankImagePath } from '../utils/imageUtils';

interface Props {
  player: PlayerResult;
  isDefender: boolean;
  t: Record<string, string>;
}

export const PlayerCard: React.FC<Props> = ({ player, isDefender, t }) => {
  const [agentImgError, setAgentImgError] = useState(false);
  const borderColor = isDefender ? 'border-blue-500/50' : 'border-val-red/50';
  const hoverColor = isDefender ? 'hover:border-blue-400' : 'hover:border-red-400';
  const weaponCount = (player.mainWeapon ? 1 : 0) + (player.subWeapon ? 1 : 0);

  return (
    <div className={`bg-black/60 border ${borderColor} ${hoverColor} transition-colors flex flex-col overflow-hidden relative group`}>
      
      <div className="p-1.5 md:p-2 flex justify-between items-center bg-val-dark z-10 border-b border-val-gray/20">
        <div className="font-bold text-sm md:text-base truncate pr-1 text-white">{player.name}</div>
      </div>

      {weaponCount > 0 && (
        <div className={`p-1 z-10 bg-val-dark/90 border-b border-val-gray/20 grid gap-1 ${weaponCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {player.mainWeapon && (
            <div className="w-full aspect-video bg-black/40 rounded-sm overflow-hidden relative flex items-center justify-center">
              <img src={getImagePath('weapons', player.mainWeapon)} alt={player.mainWeapon} className="w-full h-full object-contain p-0.5" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="absolute bottom-0 left-0 bg-black/70 text-[9px] md:text-[11px] px-1 text-val-light font-bold truncate max-w-full">{t[player.mainWeapon] || player.mainWeapon}</span>
            </div>
          )}
          {player.subWeapon && (
            <div className="w-full aspect-video bg-black/40 rounded-sm overflow-hidden relative flex items-center justify-center">
              <img src={getImagePath('weapons', player.subWeapon)} alt={player.subWeapon} className="w-full h-full object-contain p-0.5" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="absolute bottom-0 left-0 bg-black/70 text-[8px] md:text-[10px] px-1 text-val-light font-bold truncate max-w-full">{t[player.subWeapon] || player.subWeapon}</span>
            </div>
          )}
        </div>
      )}

      {player.agent && (
        <div className="w-full relative bg-black/20 overflow-hidden flex items-end justify-center aspect-[2/3]">
          
          {player.rank !== 'None' && (
            <div className="absolute top-1 left-1 md:top-2 md:left-2 z-20 pointer-events-none">
              <img 
                src={getRankImagePath(player.rank, player.tier)} 
                alt={player.rank} 
                className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-lg"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
          )}
          
          {!agentImgError ? (
            <img
              src={getImagePath('agents', player.agent)}
              alt={player.agent}
              className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              onError={() => setAgentImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-yellow-400 font-bold text-sm md:text-base uppercase tracking-widest bg-black/50 px-2 py-1 rounded">{t[player.agent] || player.agent}</span>
            </div>
          )}

          {player.role && (
            <div 
              className="absolute top-1 right-1 md:top-2 md:right-2 bg-val-dark/80 p-1 md:p-1.5 rounded-full border border-val-gray/30 z-20"
              title={t[player.role] || player.role}
            >
              <RoleIcon role={player.role} className="w-4 h-4 md:w-5 md:h-5 text-white opacity-90 drop-shadow-md" />
            </div>
          )}
        </div>
      )}

      {!player.agent && (player.role || player.rank !== 'None') && (
        <div className="p-1.5 md:p-2 flex gap-1.5 md:gap-2 bg-val-dark/40 mt-auto">
          {player.rank !== 'None' && (
            <div className="flex-1 bg-black/50 border border-val-gray/30 rounded flex flex-col items-center justify-center p-1.5 md:p-2 gap-1 min-w-0">
              <img src={getRankImagePath(player.rank, player.tier)} alt={player.rank} className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-md" />
              <span className="text-[8px] md:text-[9px] text-val-light font-bold truncate w-full text-center">
                {player.rank === 'Radiant' ? (t[player.rank] || player.rank) : `${t[player.rank] || player.rank} ${player.tier}`}
              </span>
            </div>
          )}
          {player.role && (
            <div className="flex-1 bg-black/50 border border-val-gray/30 rounded flex flex-col items-center justify-center p-1.5 md:p-2 gap-1 min-w-0">
              <RoleIcon role={player.role} className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
              <span className="text-[8px] md:text-[9px] text-val-light font-bold truncate w-full text-center">
                {t[player.role] || player.role}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};