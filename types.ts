// src/types.ts
// AI Role: 型定義の提供
// 役割: アプリケーション全体で利用するデータ構造の定義。動的チーム数と複数チーム結果に対応

export type Team = string;
export type Side = 'Attacker' | 'Defender';
export type Role = 'Duelist' | 'Initiator' | 'Controller' | 'Sentinel';
export type Rank = 'None' | 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Ascendant' | 'Immortal' | 'Radiant';
export type Tier = 1 | 2 | 3;

export interface Player {
  id: string;
  name: string;
  rank: Rank;
  tier: Tier;
  fixedTeam: Team | null;
  preferredRoles: Role[];
}

export interface PlayerResult extends Player {
  assignedTeam: Team;
  assignedSide?: Side; // 3チーム以上の場合は未定義となる
  mainWeapon?: string;
  subWeapon?: string;
  agent?: string;
  role?: Role;
}

export interface RandomizerConfig {
  autoTeams: boolean;
  useRanks: boolean;
  restrictWeapons: boolean;
  restrictWeaponCombinations: boolean;
  restrictAgents: boolean;
  restrictRoles: boolean;
  allowDuplicateAgents: boolean;
}

export interface AdvancedConfig {
  bannedMaps: string[];
  bannedWeapons: string[];
  bannedAgents: string[];
  mapWeights: Record<string, number>;
  weaponWeights: Record<string, number>;
  agentWeights: Record<string, number>;
  weaponCombinations: Record<string, string[]>;
  maxRankWeightDifference: number;
}

export interface MatchResult {
  map?: string;
  teams: Record<string, PlayerResult[]>;
  sides?: Record<string, Side>; // 2チームの場合のみ保持される
}