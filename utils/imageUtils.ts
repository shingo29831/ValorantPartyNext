// src/utils/imageUtils.ts
// AI Role: 画像パス解決のユーティリティ関数
// 役割: カテゴリやランクに応じた静的画像のURLを生成する

import { Rank, Tier } from '../types';

export const getImagePath = (category: 'agents' | 'weapons' | 'maps', name: string) => {
  const safeName = name.replace('/', '');
  return `/images/${category}/${safeName}.png`;
};

export const getRankImagePath = (rank: Rank, tier: Tier) => {
  if (rank === 'None') return '/images/ranks/Unranked_Rank.png';
  if (rank === 'Radiant') return '/images/ranks/Radiant_Rank.png';
  return `/images/ranks/${rank}_${tier}_Rank.png`;
};