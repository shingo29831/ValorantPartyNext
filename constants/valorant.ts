// src/constants/valorant.ts

import { Rank, Role } from '../types';

export const MAIN_WEAPONS = [
  'Vandal', 'Phantom', 'Operator', 'Judge', 'Odin', 'Ares', 'Bucky', 'Bulldog', 
  'Guardian', 'Marshal', 'Outlaw', 'Spectre', 'Stinger'
];

export const SUB_WEAPONS = [
  'Classic', 'Shorty', 'Frenzy', 'Ghost', 'Sheriff', 'Bandit'
];

export const ROLES: Role[] = [
  'Duelist', 'Initiator', 'Controller', 'Sentinel'
];

export const AGENTS = [
  'Astra', 'Breach', 'Brimstone', 'Chamber', 'Clove', 'Cypher', 'Deadlock', 
  'Fade', 'Gekko', 'Harbor', 'Iso', 'Jett', 'KAY/O', 'Killjoy', 'Miks', 
  'Neon', 'Omen', 'Phoenix', 'Raze', 'Reyna', 'Sage', 'Skye', 'Sova', 
  'Tejo', 'Veto', 'Viper', 'Vyse', 'Waylay', 'Yoru'
];

export const AGENT_ROLES: Record<string, Role> = {
  'Astra': 'Controller', 'Breach': 'Initiator', 'Brimstone': 'Controller', 'Chamber': 'Sentinel',
  'Clove': 'Controller', 'Cypher': 'Sentinel', 'Deadlock': 'Sentinel', 'Fade': 'Initiator',
  'Gekko': 'Initiator', 'Harbor': 'Controller', 'Iso': 'Duelist', 'Jett': 'Duelist',
  'KAY/O': 'Initiator', 'Killjoy': 'Sentinel', 'Miks': 'Initiator', 'Neon': 'Duelist',
  'Omen': 'Controller', 'Phoenix': 'Duelist', 'Raze': 'Duelist', 'Reyna': 'Duelist',
  'Sage': 'Sentinel', 'Skye': 'Initiator', 'Sova': 'Initiator', 'Tejo': 'Initiator',
  'Veto': 'Duelist', 'Viper': 'Controller', 'Vyse': 'Sentinel', 'Waylay': 'Controller', 'Yoru': 'Duelist'
};

export const RANKS: Rank[] = [
  'None', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'
];

// なぜ: HTMLから抽出した最新のマップリストに更新
export const MAPS = [
  'Abyss', 'Ascent', 'Bind', 'Breeze', 'Corrode', 'Fracture', 'Haven', 'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset'
];