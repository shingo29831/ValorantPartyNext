// src/types/index.ts
// AI Role: ドメインモデルと型定義の提供
// 役割: アプリケーション全体で利用するデータ構造の定義

export type Rank = 'None' | 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Ascendant' | 'Immortal' | 'Radiant';
export type Team = 'Team1' | 'Team2';
export type Side = 'Attacker' | 'Defender';
export type Role = 'Duelist' | 'Initiator' | 'Controller' | 'Sentinel';

export interface Player {
  id: string;
  name: string;
  rank: Rank;
  fixedTeam?: Team | null; // nullの場合はランダム振り分けの対象
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
  useRanks: boolean;
  restrictWeapons: boolean;
  restrictAgents: boolean;
  restrictRoles: boolean;
}