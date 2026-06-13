// src/types.ts
// AI Role: 型定義の提供
// 役割: アプリケーション全体で利用するデータ構造の定義。Team型をstringに変更し動的なチーム数に対応

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
  assignedSide: Side;
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
  team1: PlayerResult[];
  team2: PlayerResult[];
  team1Side: Side;
  team2Side: Side;
}