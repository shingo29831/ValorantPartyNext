// src/logic/randomizer.ts
// AI Role: コアロジックの提供
// 役割: チーム数に応じたプレイヤーの振り分けロジック、および3チーム以上のサポート

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

const balanceTeams = (players: Player[], maxDiff: number, teamCount: number): Record<string, Player[]> => {
  let bestTeams: Record<string, Player[]> = {};
  let minDiff = Infinity;

  for (let iter = 0; iter < 100; iter++) {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const tempTeams: Record<string, Player[]> = {};
    const tempWeights: Record<string, number> = {};
    
    for (let i = 1; i <= teamCount; i++) {
      tempTeams[`Team ${i}`] = [];
      tempWeights[`Team ${i}`] = 0;
    }

    const flexiblePlayers: Player[] = [];
    shuffled.forEach(p => {
      if (p.fixedTeam && tempTeams[p.fixedTeam]) {
        tempTeams[p.fixedTeam].push(p);
        tempWeights[p.fixedTeam] += getRankWeight(p.rank, p.tier);
      } else {
        flexiblePlayers.push(p);
      }
    });

    const maxPlayersPerTeam = Math.ceil(players.length / teamCount);

    for (const p of flexiblePlayers) {
      const pWeight = getRankWeight(p.rank, p.tier);
      const availableTeams = Object.keys(tempTeams).filter(t => tempTeams[t].length < maxPlayersPerTeam);
      
      if (availableTeams.length === 0) {
        const anyTeam = Object.keys(tempTeams)[0];
        tempTeams[anyTeam].push(p);
        tempWeights[anyTeam] += pWeight;
        continue;
      }

      let targetTeam = availableTeams[0];
      let minW = tempWeights[targetTeam];
      for (let i = 1; i < availableTeams.length; i++) {
        const t = availableTeams[i];
        if (tempWeights[t] < minW) {
          targetTeam = t;
          minW = tempWeights[t];
        }
      }

      tempTeams[targetTeam].push(p);
      tempWeights[targetTeam] += pWeight;
    }

    const weights = Object.values(tempWeights);
    const diff = Math.max(...weights) - Math.min(...weights);

    if (diff < minDiff) {
      minDiff = diff;
      bestTeams = tempTeams;
    }

    if (minDiff <= maxDiff) {
      break;
    }
  }

  return bestTeams;
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

export const generateMatch = (players: Player[], config: RandomizerConfig, advanced: AdvancedConfig, teamCount: number): MatchResult => {
  let teams: Record<string, Player[]> = {};

  if (!config.autoTeams) {
    for (let i = 1; i <= teamCount; i++) {
      teams[`Team ${i}`] = players.filter(p => p.fixedTeam === `Team ${i}`);
    }
  } else if (config.useRanks) {
    teams = balanceTeams(players, advanced.maxRankWeightDifference, teamCount);
  } else {
    for (let i = 1; i <= teamCount; i++) {
      teams[`Team ${i}`] = [];
    }
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    
    const flexiblePlayers: Player[] = [];
    shuffled.forEach(p => {
      if (p.fixedTeam && teams[p.fixedTeam]) {
        teams[p.fixedTeam].push(p);
      } else {
        flexiblePlayers.push(p);
      }
    });

    const maxPlayersPerTeam = Math.ceil(players.length / teamCount);
    for (const p of flexiblePlayers) {
      const availableTeams = Object.keys(teams).filter(t => teams[t].length < maxPlayersPerTeam);
      const targetTeam = availableTeams.length > 0 ? availableTeams[0] : Object.keys(teams)[0];
      teams[targetTeam].push(p);
    }
  }

  let sides: Record<string, Side> | undefined = undefined;
  if (teamCount === 2) {
    const isTeam1Attacker = Math.random() > 0.5;
    sides = {
      'Team 1': isTeam1Attacker ? 'Attacker' : 'Defender',
      'Team 2': isTeam1Attacker ? 'Defender' : 'Attacker'
    };
  }

  const selectedMap = getWeightedRandomItem(MAPS, advanced.bannedMaps, advanced.mapWeights);

  const usedAgentsByTeam: Record<string, Set<string>> = {};
  for (let i = 1; i <= teamCount; i++) {
    usedAgentsByTeam[`Team ${i}`] = new Set<string>();
  }

  const mapToResult = (p: Player, teamName: string, side?: Side): PlayerResult => {
    const res: PlayerResult = { ...p, assignedTeam: teamName, assignedSide: side };
    const usedAgents = usedAgentsByTeam[teamName] || new Set<string>();

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

  const resultTeams: Record<string, PlayerResult[]> = {};
  for (const teamKey of Object.keys(teams)) {
    const teamSide = sides ? sides[teamKey] : undefined;
    resultTeams[teamKey] = teams[teamKey].map(p => mapToResult(p, teamKey, teamSide));
  }

  return {
    map: selectedMap,
    teams: resultTeams,
    sides
  };
};