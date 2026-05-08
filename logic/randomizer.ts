// src/logic/randomizer.ts
// AI Role: コアロジックの提供
// 役割: アイテム抽選のデフォルト重みを10に変更。また、チーム内でのエージェント重複を防止する設定を追加。

import { Player, PlayerResult, RandomizerConfig, AdvancedConfig, Rank, Tier, Team, Side, MatchResult } from '../types';
import { MAIN_WEAPONS, SUB_WEAPONS, AGENTS, ROLES, AGENT_ROLES, MAPS } from '../constants/valorant';

export const getRankWeight = (rank: Rank, tier: Tier): number => {
  if (rank === 'None') return 0;
  if (rank === 'Radiant') return 100;
  
  const rankScores: Record<Rank, number> = {
    'None': 0, 'Iron': 10, 'Bronze': 20, 'Silver': 30, 'Gold': 40,
    'Platinum': 50, 'Diamond': 60, 'Ascendant': 70, 'Immortal': 80, 'Radiant': 100
  };
  
  return rankScores[rank] + (tier - 1) * 3;
};

const balanceTeams = (players: Player[], maxDiff: number): { team1: Player[]; team2: Player[] } => {
  let bestTeam1: Player[] = [];
  let bestTeam2: Player[] = [];
  let minDiff = Infinity;

  for (let i = 0; i < 100; i++) {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const t1: Player[] = [];
    const t2: Player[] = [];
    let w1 = 0;
    let w2 = 0;

    for (const p of shuffled) {
      const pWeight = getRankWeight(p.rank, p.tier);
      if (t1.length < Math.ceil(players.length / 2) && (w1 <= w2 || t2.length >= Math.floor(players.length / 2))) {
        t1.push(p);
        w1 += pWeight;
      } else {
        t2.push(p);
        w2 += pWeight;
      }
    }

    const diff = Math.abs(w1 - w2);
    if (diff < minDiff) {
      minDiff = diff;
      bestTeam1 = t1;
      bestTeam2 = t2;
    }

    if (minDiff <= maxDiff) {
      break;
    }
  }

  return { team1: bestTeam1, team2: bestTeam2 };
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getWeightedRandomItem = <T extends string>(items: T[], banned: string[], weights: Record<string, number>): T | undefined => {
  const validItems = items.filter(i => !banned.includes(i) && (weights[i] ?? 10) > 0);
  if (validItems.length === 0) return undefined;

  const totalWeight = validItems.reduce((sum, item) => sum + (weights[item] ?? 10), 0);
  let rand = Math.random() * totalWeight;

  for (const item of validItems) {
    rand -= (weights[item] ?? 10);
    if (rand <= 0) return item;
  }
  return validItems[validItems.length - 1];
};

export const generateMatch = (players: Player[], config: RandomizerConfig, advanced: AdvancedConfig): MatchResult => {
  let team1: Player[] = [];
  let team2: Player[] = [];

  if (!config.autoTeams) {
    team1 = players.filter(p => p.fixedTeam === 'Team 1');
    team2 = players.filter(p => p.fixedTeam === 'Team 2');
  } else if (config.useRanks) {
    const balanced = balanceTeams(players, advanced.maxRankWeightDifference);
    team1 = balanced.team1;
    team2 = balanced.team2;
  } else {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const half = Math.ceil(shuffled.length / 2);
    team1 = shuffled.slice(0, half);
    team2 = shuffled.slice(half);
  }

  const isTeam1Attacker = Math.random() > 0.5;
  const team1Side: Side = isTeam1Attacker ? 'Attacker' : 'Defender';
  const team2Side: Side = isTeam1Attacker ? 'Defender' : 'Attacker';

  const selectedMap = getWeightedRandomItem(MAPS, advanced.bannedMaps, advanced.mapWeights);

  const team1UsedAgents = new Set<string>();
  const team2UsedAgents = new Set<string>();

  const mapToResult = (p: Player, team: Team, side: Side, usedAgents: Set<string>): PlayerResult => {
    const res: PlayerResult = { ...p, assignedTeam: team, assignedSide: side };

    if (config.restrictRoles) {
      res.role = getRandomItem(ROLES);
    } else {
      res.role = p.preferredRoles.length > 0 ? getRandomItem(p.preferredRoles) : getRandomItem(ROLES);
    }

    if (config.restrictAgents) {
      const roleAgents = AGENTS.filter(a => AGENT_ROLES[a] === res.role && (config.allowDuplicateAgents || !usedAgents.has(a)));
      res.agent = getWeightedRandomItem(roleAgents, advanced.bannedAgents, advanced.agentWeights);
      
      if (!res.agent) {
        const availableAgents = AGENTS.filter(a => config.allowDuplicateAgents || !usedAgents.has(a));
        res.agent = getWeightedRandomItem(availableAgents, advanced.bannedAgents, advanced.agentWeights);
      }

      if (res.agent) {
        if (!config.allowDuplicateAgents) {
          usedAgents.add(res.agent);
        }
        if (AGENT_ROLES[res.agent]) {
          res.role = AGENT_ROLES[res.agent];
        }
      }
    } else {
      res.agent = undefined; 
    }

    if (config.restrictWeapons) {
      res.mainWeapon = getWeightedRandomItem(MAIN_WEAPONS, advanced.bannedWeapons, advanced.weaponWeights);
      
      let availableSubs = SUB_WEAPONS;
      if (config.restrictWeaponCombinations && res.mainWeapon) {
        const comboAllowed = advanced.weaponCombinations[res.mainWeapon];
        if (comboAllowed) {
          availableSubs = comboAllowed;
        }
      }
      
      res.subWeapon = getWeightedRandomItem(availableSubs, advanced.bannedWeapons, advanced.weaponWeights);
    }

    return res;
  };

  return {
    map: selectedMap,
    team1Side,
    team2Side,
    team1: team1.map(p => mapToResult(p, 'Team 1', team1Side, team1UsedAgents)),
    team2: team2.map(p => mapToResult(p, 'Team 2', team2Side, team2UsedAgents)),
  };
};