// src/components/AdvancedCategory.tsx
// AI Role: 詳細設定のカテゴリ表示UIコンポーネント
// 役割: アイテムの一覧を表示し、エージェントの場合はロールフィルターを提供する

import React, { useState } from 'react';
import { Role } from '../types';
import { ROLES, AGENT_ROLES } from '../constants/valorant';
import { RoleIcon } from './RoleIcon';
import { ItemCard } from './ItemCard';

interface Props {
  title: string;
  items: string[];
  category: 'maps' | 'weapons' | 'agents';
  bannedList: string[];
  weights: Record<string, number>;
  onToggleBan: (item: string) => void;
  onUpdateWeight: (item: string, weight: number) => void;
  t: Record<string, string>;
}

export const AdvancedCategory: React.FC<Props> = ({
  title,
  items,
  category,
  bannedList,
  weights,
  onToggleBan,
  onUpdateWeight,
  t,
}) => {
  const [agentFilter, setAgentFilter] = useState<Role | 'All'>('All');

  const displayedItems =
    category === 'agents' && agentFilter !== 'All'
      ? items.filter((item) => AGENT_ROLES[item] === agentFilter)
      : items;

  const activeWeight = items.reduce(
    (sum, item) => (bannedList.includes(item) ? sum : sum + (weights[item] ?? 10)),
    0
  );

  return (
    <div className="bg-black/30 p-4 md:p-6 border-l-4 border-val-gray mb-4 md:mb-6 shadow-xl animate-fade-in">
      <div className="font-bold text-xl md:text-2xl flex justify-between items-center outline-none">
        <div className="flex items-center gap-3">{title}</div>
      </div>

      <p className="text-val-gray/50 text-xs md:text-sm italic mt-3 mb-1 tracking-wider">
        {t.clickToBanHint || '画像をクリックでBAN'}
      </p>

      {category === 'agents' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setAgentFilter('All')}
            className={`px-4 py-2 border rounded text-sm md:text-base font-bold transition-colors ${
              agentFilter === 'All'
                ? 'border-val-red bg-val-red/20 text-white'
                : 'border-val-gray/30 bg-val-dark text-val-gray hover:border-val-gray/60 hover:text-val-light'
            }`}
          >
            {t.all || "ALL"}
          </button>
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setAgentFilter(role)}
              className={`flex items-center gap-2 px-4 py-2 border rounded text-sm md:text-base font-bold transition-colors ${
                agentFilter === role
                  ? 'border-val-red bg-val-red/20 text-white'
                  : 'border-val-gray/30 bg-val-dark text-val-gray hover:border-val-gray/60 hover:text-val-light'
              }`}
            >
              <RoleIcon role={role} className="w-4 h-4 md:w-5 md:h-5" /> {t[role] || role}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-6 overflow-visible pb-12">
        {displayedItems.map((item) => (
          <ItemCard
            key={item}
            item={item}
            category={category}
            isBanned={bannedList.includes(item)}
            currentWeight={weights[item] ?? 10}
            totalActiveWeight={activeWeight}
            onToggleBan={() => onToggleBan(item)}
            onUpdateWeight={(w) => onUpdateWeight(item, w)}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};