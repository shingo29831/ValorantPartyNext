// AI Role: チーム振り分けロジックの提供
// 役割: プレイヤーのランク重み付けと固定チーム設定に基づくチーム分割

// なぜ: Teamの型はPlayerインターフェースのプロパティとして内部で解決されており、このファイル内で直接型として宣言・利用されないため削除
import { Player, Rank } from '../types';

const RANK_WEIGHTS: Record<Rank, number> = {
  None: 5,
  Iron: 1,
  Bronze: 2,
  Silver: 3,
  Gold: 4,
  Platinum: 5,
  Diamond: 6,
  Ascendant: 7,
  Immortal: 8,
  Radiant: 9,
};

interface BalancedTeams {
  team1: Player[];
  team2: Player[];
}

export const balanceTeams = (players: Player[], useRanks: boolean): BalancedTeams => {
  const team1: Player[] = [];
  const team2: Player[] = [];
  
  let team1Weight = 0;
  let team2Weight = 0;

  const getWeight = (rank: Rank) => useRanks ? RANK_WEIGHTS[rank] : 0;

  const flexiblePlayers: Player[] = [];
  players.forEach(player => {
    if (player.fixedTeam === 'Team 1') {
      team1.push(player);
      team1Weight += getWeight(player.rank);
    } else if (player.fixedTeam === 'Team 2') {
      team2.push(player);
      team2Weight += getWeight(player.rank);
    } else {
      flexiblePlayers.push(player);
    }
  });

  const sortedPlayers = [...flexiblePlayers].sort((a, b) => getWeight(b.rank) - getWeight(a.rank));

  sortedPlayers.forEach(player => {
    const weight = getWeight(player.rank);
    
    if (team1.length < team2.length) {
      team1.push(player);
      team1Weight += weight;
    } else if (team2.length < team1.length) {
      team2.push(player);
      team2Weight += weight;
    } else {
      if (team1Weight <= team2Weight) {
        team1.push(player);
        team1Weight += weight;
      } else {
        team2.push(player);
        team2Weight += weight;
      }
    }
  });

  return { team1, team2 };
};