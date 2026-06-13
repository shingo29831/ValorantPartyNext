// src/app/page.tsx
// AI Role: メインUIの提供 (Client Component)
// 役割: アプリケーション全体のUI構成と状態管理。分割されたコンポーネントを組み合わせ、生成の制御を行う。

"use client";

import React, { useState, useEffect } from 'react';
import { generateMatch, getRankWeight } from '../logic/randomizer';
import { validateTeamCreation } from '../logic/validator';
import { Player, RandomizerConfig, AdvancedConfig, Rank, Tier, Role, Team, MatchResult } from '../types';
import { Swords, Shield, Settings2, Users, ArrowLeft, RefreshCw, Globe, SlidersHorizontal, Ban, Menu, ChevronDown, History } from 'lucide-react';
import { MAPS, MAIN_WEAPONS, SUB_WEAPONS, AGENTS } from '../constants/valorant';
import { PlayerCard } from '../components/PlayerCard';
import { QuickBanCarousel } from '../components/QuickBanCarousel';
import { PlayerRow } from '../components/PlayerRow';
import { AdvancedCategory } from '../components/AdvancedCategory';
import { getImagePath } from '../utils/imageUtils';

import jaTranslation from '../locales/ja.json';
import enTranslation from '../locales/en.json';

const TRANSLATIONS = {
  ja: jaTranslation,
  en: enTranslation
};

const INITIAL_PLAYERS: Player[] = Array.from({ length: 10 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Player ${i + 1}`,
  rank: 'None',
  tier: 2,
  fixedTeam: i < 5 ? 'Team 1' : 'Team 2',
  preferredRoles: [],
}));

const INITIAL_COMBINATIONS = MAIN_WEAPONS.reduce((acc, mw) => {
  acc[mw] = [...SUB_WEAPONS];
  return acc;
}, {} as Record<string, string[]>);

type ScreenState = 'setup' | 'advanced' | 'result';
type Language = 'ja' | 'en';
type AdvancedTab = 'adv-rank' | 'adv-maps' | 'adv-agents' | 'adv-main-weapons' | 'adv-sub-weapons' | 'adv-combos';

interface PlayerHistoryData {
  name: string;
  rank: Rank;
  tier: Tier;
  preferredRoles: Role[];
}

const TEAM_COLORS = [
  { border: 'border-blue-500', borderAlpha: 'border-blue-500/30', bg: 'bg-blue-900/10', header: 'text-blue-400', line: 'from-blue-500/50' },
  { border: 'border-val-red', borderAlpha: 'border-val-red/30', bg: 'bg-red-900/10', header: 'text-val-red', line: 'from-val-red/50' },
  { border: 'border-yellow-500', borderAlpha: 'border-yellow-500/30', bg: 'bg-yellow-900/10', header: 'text-yellow-400', line: 'from-yellow-500/50' },
  { border: 'border-green-500', borderAlpha: 'border-green-500/30', bg: 'bg-green-900/10', header: 'text-green-400', line: 'from-green-500/50' },
  { border: 'border-purple-500', borderAlpha: 'border-purple-500/30', bg: 'bg-purple-900/10', header: 'text-purple-400', line: 'from-purple-500/50' },
  { border: 'border-pink-500', borderAlpha: 'border-pink-500/30', bg: 'bg-pink-900/10', header: 'text-pink-400', line: 'from-pink-500/50' },
  { border: 'border-orange-500', borderAlpha: 'border-orange-500/30', bg: 'bg-orange-900/10', header: 'text-orange-400', line: 'from-orange-500/50' },
  { border: 'border-teal-500', borderAlpha: 'border-teal-500/30', bg: 'bg-teal-900/10', header: 'text-teal-400', line: 'from-teal-500/50' },
  { border: 'border-indigo-500', borderAlpha: 'border-indigo-500/30', bg: 'bg-indigo-900/10', header: 'text-indigo-400', line: 'from-indigo-500/50' },
  { border: 'border-cyan-500', borderAlpha: 'border-cyan-500/30', bg: 'bg-cyan-900/10', header: 'text-cyan-400', line: 'from-cyan-500/50' },
];

export default function Page() {
  const [screen, setScreen] = useState<ScreenState>('setup');
  const [lang, setLang] = useState<Language>('ja');
  const [activeTab, setActiveTab] = useState<AdvancedTab>('adv-rank');
  const [teamCount, setTeamCount] = useState<number>(2);
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(5);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  
  const [config, setConfig] = useState<RandomizerConfig>({
    autoTeams: true,
    useRanks: true,
    restrictWeapons: true,
    restrictWeaponCombinations: false,
    restrictAgents: false,
    restrictRoles: false,
    allowDuplicateAgents: false,
  });

  const [advanced, setAdvanced] = useState<AdvancedConfig>({
    bannedMaps: [],
    bannedWeapons: [],
    bannedAgents: [],
    mapWeights: {},
    weaponWeights: {},
    agentWeights: {},
    weaponCombinations: INITIAL_COMBINATIONS,
    maxRankWeightDifference: 10
  });

  const [selectedComboMain, setSelectedComboMain] = useState<string>(MAIN_WEAPONS[0]);
  const [result, setResult] = useState<MatchResult | null>(null);

  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryData[]>([]);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  const t = TRANSLATIONS[lang] as Record<string, string>;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('valorantPartyPlayerHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPlayerHistory(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGenerate = () => {
    const activePlayers = players.filter(p => p.name.trim() !== '');
    if (activePlayers.length === 0) return;
    
    if (config.restrictAgents) {
      const validationResult = validateTeamCreation(
        AGENTS.length,
        advanced.bannedAgents.length,
        config.allowDuplicateAgents
      );

      if (!validationResult.isValid && validationResult.errorMessageKey) {
        alert(t[validationResult.errorMessageKey] || validationResult.errorMessageKey);
        return;
      }
    }

    try {
      const newHistory = [...playerHistory];
      activePlayers.forEach(p => {
        if (/^Player \d+$/.test(p.name)) return;
        
        const existingIndex = newHistory.findIndex(h => h.name === p.name);
        if (existingIndex >= 0) {
          newHistory.splice(existingIndex, 1);
        }
        newHistory.unshift({
          name: p.name,
          rank: p.rank,
          tier: p.tier,
          preferredRoles: p.preferredRoles
        });
      });
      const limitedHistory = newHistory.slice(0, 50);
      setPlayerHistory(limitedHistory);
      localStorage.setItem('valorantPartyPlayerHistory', JSON.stringify(limitedHistory));
    } catch (e) {
      console.error(e);
    }

    const matchResult = generateMatch(activePlayers, config, advanced, teamCount);

    if (!config.restrictAgents && !config.restrictRoles) {
      Object.values(matchResult.teams).forEach(team => {
        team.forEach(p => { p.role = undefined; });
      });
    }

    setResult(matchResult);
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRerollMap = () => {
    if (!result) return;
    const availableMaps = MAPS.filter(m => !advanced.bannedMaps.includes(m));
    if (availableMaps.length === 0) return;

    const weights = availableMaps.map(m => advanced.mapWeights[m] ?? 10);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    let selectedMap = availableMaps[0];
    for (let i = 0; i < availableMaps.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedMap = availableMaps[i];
        break;
      }
    }

    setResult(prev => prev ? { ...prev, map: selectedMap } : null);
  };

  const handleAddFromHistory = (historyItem: PlayerHistoryData) => {
    const defaultPlayerIndex = players.findIndex(p => /^Player \d+$/.test(p.name));
    if (defaultPlayerIndex !== -1) {
      const newPlayers = [...players];
      newPlayers[defaultPlayerIndex] = {
        ...newPlayers[defaultPlayerIndex],
        name: historyItem.name,
        rank: historyItem.rank,
        tier: historyItem.tier,
        preferredRoles: [...historyItem.preferredRoles]
      };
      setPlayers(newPlayers);
    } else {
      alert(t.noEmptyPlayerSlot || '空きのプレイヤー枠がありません。');
    }
  };

  const toggleConfig = (key: keyof RandomizerConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const updatePlayerRank = (index: number, rank: Rank) => {
    const newPlayers = [...players];
    newPlayers[index].rank = rank;
    setPlayers(newPlayers);
  };

  const updatePlayerTier = (index: number, tier: Tier) => {
    const newPlayers = [...players];
    newPlayers[index].tier = tier;
    setPlayers(newPlayers);
  };

  const togglePlayerRole = (index: number, role: Role) => {
    const newPlayers = [...players];
    const roles = newPlayers[index].preferredRoles;
    if (roles.includes(role)) {
      newPlayers[index].preferredRoles = roles.filter(r => r !== role);
    } else {
      newPlayers[index].preferredRoles = [...roles, role];
    }
    setPlayers(newPlayers);
  };

  const updatePlayerTeam = (index: number, team: Team) => {
    const newPlayers = [...players];
    newPlayers[index].fixedTeam = team;
    setPlayers(newPlayers);
  };

  const swapPlayers = (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    setPlayers(prev => {
      const newPlayers = [...prev];
      const dragPlayer = prev[dragIndex];
      const dropPlayer = prev[dropIndex];
      newPlayers[dragIndex] = { ...dropPlayer, fixedTeam: dragPlayer.fixedTeam };
      newPlayers[dropIndex] = { ...dragPlayer, fixedTeam: dropPlayer.fixedTeam };
      return newPlayers;
    });
  };

  const toggleBan = (listKey: 'bannedMaps' | 'bannedWeapons' | 'bannedAgents', item: string) => {
    setAdvanced(prev => ({
      ...prev,
      [listKey]: prev[listKey].includes(item) 
        ? prev[listKey].filter(i => i !== item)
        : [...prev[listKey], item]
    }));
  };

  const updateWeight = (dictKey: 'mapWeights' | 'weaponWeights' | 'agentWeights', item: string, weight: number) => {
    setAdvanced(prev => ({
      ...prev,
      [dictKey]: { ...prev[dictKey], [item]: weight }
    }));
  };

  const updatePlayerSlots = (newTeamCount: number, newPlayersPerTeam: number) => {
    const targetPlayerCount = newTeamCount * newPlayersPerTeam;
    setPlayers(prev => {
      let updatedPlayers = [...prev];
      
      if (updatedPlayers.length < targetPlayerCount) {
        for (let i = updatedPlayers.length; i < targetPlayerCount; i++) {
          updatedPlayers.push({
            id: `p${i + 1}`,
            name: `Player ${i + 1}`,
            rank: 'None',
            tier: 2,
            fixedTeam: null,
            preferredRoles: [],
          });
        }
      } else if (updatedPlayers.length > targetPlayerCount) {
        updatedPlayers = updatedPlayers.slice(0, targetPlayerCount);
      }

      return updatedPlayers.map((p, i) => {
        const teamIndex = Math.floor(i / newPlayersPerTeam) + 1;
        return {
          ...p,
          fixedTeam: `Team ${teamIndex}`
        };
      });
    });
  };

  const handleTeamCountChange = (count: number) => {
    const validCount = Math.max(2, count);
    setTeamCount(validCount);
    updatePlayerSlots(validCount, playersPerTeam);
  };

  const handlePlayersPerTeamChange = (count: number) => {
    const validCount = Math.max(2, Math.min(10, count));
    setPlayersPerTeam(validCount);
    updatePlayerSlots(teamCount, validCount);
  };

  const renderToggle = (key: keyof RandomizerConfig, label: string) => (
    <label key={key} className="flex items-center gap-3 cursor-pointer group bg-black/30 px-3 py-2 md:px-4 md:py-2.5 transition-colors rounded hover:bg-black/50">
      <div className="relative pointer-events-none shrink-0">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={config[key]}
          onChange={() => toggleConfig(key)}
        />
        <div className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-colors ${config[key] ? 'bg-val-red' : 'bg-val-gray'}`}></div>
        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 md:w-5 md:h-5 rounded-full transition-transform ${config[key] ? 'translate-x-5 md:translate-x-6' : ''}`}></div>
      </div>
      <span className="uppercase text-sm md:text-base tracking-wider group-hover:text-val-red transition-colors whitespace-nowrap">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-val-dark text-val-light font-sans selection:bg-val-red selection:text-white flex flex-col relative">
      <header className="border-b border-val-gray/30 p-2 md:p-3 flex justify-between items-center bg-val-dark sticky top-0 z-40 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          {screen !== 'setup' && (
            <button 
              onClick={() => setScreen('setup')}
              className="text-val-gray hover:text-white transition-colors p-1"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}
          <h1 className="text-lg md:text-2xl font-bold tracking-tighter uppercase italic flex items-center gap-1.5 md:gap-2">
            <Swords className="text-val-red w-4 h-4 md:w-6 md:h-6" />
            {t.title?.split(' ')[0] || 'Valorant'} <span className="text-val-red">{t.title?.split(' ')[1] || 'Party'}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded border border-val-gray/20">
            <Globe className="w-4 h-4 text-val-gray" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-val-light text-xs md:text-sm outline-none cursor-pointer uppercase font-bold"
            >
              <option value="ja">JP</option>
              <option value="en">EN</option>
            </select>
          </div>

          {screen === 'result' && (
            <button 
              onClick={handleGenerate}
              className="bg-val-gray/20 hover:bg-val-gray/40 text-white px-3 py-1.5 md:px-4 md:py-2 font-bold uppercase tracking-wider transition-colors border border-val-gray/50 flex items-center gap-2 text-xs md:text-sm shrink-0"
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4" /> {t.reroll}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-400 w-full mx-auto p-2 md:p-4 flex flex-col min-h-0 relative">
        
        {screen === 'setup' && (
          <div className="space-y-4 md:space-y-6 animate-slide-up overflow-y-auto pb-10">
            <section className="bg-val-blue border-l-4 border-val-red p-4 md:p-6">
              <div 
                className="flex justify-between items-center cursor-pointer group" 
                onClick={() => setIsRulesExpanded(!isRulesExpanded)}
              >
                <h2 className="text-xl md:text-2xl font-bold uppercase italic flex items-center gap-2 group-hover:text-val-red transition-colors">
                  <Settings2 className="text-val-red w-6 h-6" /> {t.rules}
                  <ChevronDown className={`w-5 h-5 text-val-gray transition-transform duration-300 ${isRulesExpanded ? 'rotate-180' : ''}`} />
                </h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); setScreen('advanced'); setActiveTab('adv-rank'); window.scrollTo({ top: 0 }); }}
                  className="bg-val-gray/20 hover:bg-val-gray/40 text-val-light px-4 py-2 rounded text-sm md:text-base flex items-center gap-2 transition-colors border border-val-gray/30"
                >
                  <SlidersHorizontal className="w-5 h-5 text-val-red" /> {t.advancedSettings}
                </button>
              </div>

              {isRulesExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 animate-fade-in">
                  <div className="bg-val-dark/50 p-4 rounded border border-val-gray/20 flex flex-col gap-3">
                    <h3 className="text-base md:text-lg font-bold text-val-gray border-b border-val-gray/30 pb-2 mb-1">{t.categoryTeam}</h3>
                    {renderToggle('autoTeams', t.autoTeams)}
                    {config.autoTeams && (
                      <div className="pl-5 ml-2 border-l-2 border-val-gray/30 flex flex-col gap-3">
                        {renderToggle('useRanks', t.useRanks)}
                      </div>
                    )}
                  </div>

                  <div className="bg-val-dark/50 p-4 rounded border border-val-gray/20 flex flex-col gap-3">
                    <h3 className="text-base md:text-lg font-bold text-val-gray border-b border-val-gray/30 pb-2 mb-1">{t.categoryAgent}</h3>
                    {renderToggle('restrictAgents', t.restrictAgents)}
                    {config.restrictAgents && (
                      <div className="pl-5 ml-2 border-l-2 border-val-gray/30 flex flex-col gap-3">
                        {renderToggle('allowDuplicateAgents', t.allowDuplicateAgents)}
                      </div>
                    )}
                    {renderToggle('restrictRoles', t.restrictRoles)}
                  </div>

                  <div className="bg-val-dark/50 p-4 rounded border border-val-gray/20 flex flex-col gap-3">
                    <h3 className="text-base md:text-lg font-bold text-val-gray border-b border-val-gray/30 pb-2 mb-1">{t.categoryWeapon}</h3>
                    {renderToggle('restrictWeapons', t.restrictWeapons)}
                    {config.restrictWeapons && (
                      <div className="pl-5 ml-2 border-l-2 border-val-gray/30 flex flex-col gap-3">
                        {renderToggle('restrictWeaponCombinations', t.restrictWeaponCombinations)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* なぜ: チーム生成ボタンがヘッダーの右上だと分かりづらいため、ルール設定の直下に大きく配置してフローを改善 */}
            <button 
              onClick={handleGenerate}
              className="w-full bg-val-red hover:bg-red-600 text-white py-4 md:py-6 rounded shadow-lg font-bold text-xl md:text-3xl uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-3 animate-pulse border-2 border-red-400/50"
            >
              <Swords className="w-6 h-6 md:w-8 md:h-8" />
              {t.generate}
            </button>

            {playerHistory.length > 0 && (
              <section className="bg-val-dark p-3 md:p-4 border-l-4 border-val-gray rounded shadow-md">
                <h3 className="text-sm md:text-base font-bold uppercase italic text-val-gray mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 md:w-5 md:h-5" /> {t.playerHistory || (lang === 'ja' ? 'プレイヤー履歴' : 'Player History')}
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                  {playerHistory
                    .filter(h => !players.some(p => p.name === h.name))
                    .map(h => (
                      <button
                        key={h.name}
                        onClick={() => handleAddFromHistory(h)}
                        className="whitespace-nowrap px-4 py-2 bg-black/40 hover:bg-val-red/80 border border-val-gray/30 hover:border-val-red rounded text-sm md:text-base font-bold transition-all text-val-light"
                      >
                        {h.name}
                      </button>
                    ))}
                  {playerHistory.filter(h => !players.some(p => p.name === h.name)).length === 0 && (
                    <span className="text-val-gray text-xs md:text-sm italic px-2">
                      {t.allHistoryPlayersAdded || (lang === 'ja' ? 'すべての履歴プレイヤーが追加されました。' : 'All history players are added.')}
                    </span>
                  )}
                </div>
              </section>
            )}

            <section className="bg-val-blue border-l-4 border-val-gray p-4 md:p-6">
              <div className="mb-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold uppercase italic flex items-center gap-2 mb-1">
                    <Users className="text-val-gray w-6 h-6" /> {t.players}
                  </h2>
                  <p className="text-val-gray/50 text-xs md:text-sm italic tracking-wider">
                    {t.dragDropHint || 'プレイヤーをドラッグ&ドロップで入れ替え'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 bg-black/30 px-4 py-2 rounded border border-val-gray/20 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-val-gray text-sm md:text-base">
                      {t.teamCount || (lang === 'ja' ? 'チーム数' : 'Team Count')}:
                    </span>
                    <select
                      value={teamCount}
                      onChange={(e) => handleTeamCountChange(parseInt(e.target.value))}
                      className="bg-black/50 text-val-light px-3 py-1.5 rounded border border-val-gray/40 outline-none focus:border-val-red text-center cursor-pointer"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num} className="bg-val-dark text-val-light">{num}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-px h-6 bg-val-gray/40 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-val-gray text-sm md:text-base">
                      {t.playersPerTeam || (lang === 'ja' ? 'チーム人数' : 'Players per Team')}:
                    </span>
                    <select
                      value={playersPerTeam}
                      onChange={(e) => handlePlayersPerTeamChange(parseInt(e.target.value))}
                      className="bg-black/50 text-val-light px-3 py-1.5 rounded border border-val-gray/40 outline-none focus:border-val-red text-center cursor-pointer"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num} className="bg-val-dark text-val-light">{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {!config.autoTeams ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
                  {Array.from({ length: teamCount }).map((_, teamIdx) => {
                    const teamNum = teamIdx + 1;
                    const color = teamCount === 2 
                      ? (teamIdx === 0 ? TEAM_COLORS[0] : TEAM_COLORS[1]) 
                      : TEAM_COLORS[teamIdx % TEAM_COLORS.length];

                    return (
                      <div key={`team-${teamNum}`}>
                        <h3 className={`text-xl font-bold mb-4 border-b pb-2 flex justify-between items-end ${color.header} ${color.borderAlpha}`}>
                          {t[`team${teamNum}`] || (lang === 'ja' ? `チーム ${teamNum}` : `Team ${teamNum}`)}
                          <span className="text-sm font-normal text-val-light opacity-60">
                            {players.filter(p => p.fixedTeam === `Team ${teamNum}`).length} {t.playerCount}
                          </span>
                        </h3>
                        <div className="flex flex-col gap-3">
                          {players.map((p, i) => p.fixedTeam === `Team ${teamNum}` && (
                            <PlayerRow
                              key={p.id}
                              player={p}
                              index={i}
                              config={config}
                              t={t}
                              onUpdateName={updatePlayerName}
                              onUpdateRank={updatePlayerRank}
                              onUpdateTier={updatePlayerTier}
                              onToggleRole={togglePlayerRole}
                              onToggleTeam={updatePlayerTeam}
                              onSwapPlayers={swapPlayers}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
                  {players.map((p, i) => (
                    <PlayerRow
                      key={p.id}
                      player={p}
                      index={i}
                      config={config}
                      t={t}
                      onUpdateName={updatePlayerName}
                      onUpdateRank={updatePlayerRank}
                      onUpdateTier={updatePlayerTier}
                      onToggleRole={togglePlayerRole}
                      onToggleTeam={updatePlayerTeam}
                      onSwapPlayers={swapPlayers}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="bg-val-dark p-4 md:p-6 border border-val-gray/20 rounded shadow-md overflow-visible">
              <h2 className="text-base md:text-lg font-bold mb-4 uppercase italic text-val-gray flex items-center gap-2">
                <Ban className="w-5 h-5" /> {t.quickBansWeights || (lang === 'ja' ? 'クイックBAN & 重み設定' : 'Quick Bans & Weights')}
              </h2>
              <div className="space-y-8">
                <QuickBanCarousel title={t.mapSettings} items={MAPS} category="maps" bannedList={advanced.bannedMaps} weights={advanced.mapWeights} onToggle={(item) => toggleBan('bannedMaps', item)} onUpdateWeight={(item, weight) => updateWeight('mapWeights', item, weight)} t={t} />
                <QuickBanCarousel title={t.agentSettings} items={AGENTS} category="agents" bannedList={advanced.bannedAgents} weights={advanced.agentWeights} onToggle={(item) => toggleBan('bannedAgents', item)} onUpdateWeight={(item, weight) => updateWeight('agentWeights', item, weight)} t={t} />
                <QuickBanCarousel title={t.mainWeapons || 'MAIN WEAPONS'} items={MAIN_WEAPONS} category="weapons" bannedList={advanced.bannedWeapons} weights={advanced.weaponWeights} onToggle={(item) => toggleBan('bannedWeapons', item)} onUpdateWeight={(item, weight) => updateWeight('weaponWeights', item, weight)} t={t} />
                <QuickBanCarousel title={t.subWeapons || 'SUB WEAPONS'} items={SUB_WEAPONS} category="weapons" bannedList={advanced.bannedWeapons} weights={advanced.weaponWeights} onToggle={(item) => toggleBan('bannedWeapons', item)} onUpdateWeight={(item, weight) => updateWeight('weaponWeights', item, weight)} t={t} />
              </div>
            </section>
          </div>
        )}

        {screen === 'advanced' && (
          <div className="animate-slide-up overflow-visible pb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 uppercase italic flex items-center gap-3 text-val-red">
              <SlidersHorizontal className="w-8 h-8" /> {t.advancedSettings}
            </h2>

            <nav className="sticky top-13 md:top-15 z-30 bg-val-dark/95 backdrop-blur-md border-y border-val-gray/30 py-3 md:py-4 mb-6 -mx-2 px-2 md:-mx-4 md:px-4 shadow-lg">
              <div className="flex gap-2 md:gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden items-center pb-1">
                <Menu className="w-6 h-6 md:w-8 md:h-8 text-val-gray shrink-0 mr-1 md:mr-2" />
                {[
                  { id: 'adv-rank', label: t.maxRankDifference },
                  { id: 'adv-maps', label: t.mapSettings },
                  { id: 'adv-agents', label: t.agentSettings },
                  { id: 'adv-main-weapons', label: t.mainWeapons || 'MAIN WEAPONS' },
                  { id: 'adv-sub-weapons', label: t.subWeapons || 'SUB WEAPONS' },
                  { id: 'adv-combos', label: t.weaponCombinations }
                ].map(menu => (
                  <button
                    key={menu.id}
                    onClick={() => setActiveTab(menu.id as AdvancedTab)}
                    className={`px-4 py-2 md:px-6 md:py-2.5 rounded border transition-colors whitespace-nowrap text-sm md:text-base font-bold tracking-wider shrink-0 ${
                      activeTab === menu.id
                        ? 'bg-val-red text-white border-val-red shadow-[0_0_12px_rgba(255,70,85,0.6)]'
                        : 'bg-black/40 hover:bg-val-red/80 text-val-gray hover:text-white border-val-gray/30'
                    }`}
                  >
                    {menu.label}
                  </button>
                ))}
              </div>
            </nav>

            {activeTab === 'adv-rank' && (
              <div className="bg-black/30 p-4 md:p-6 border-l-4 border-val-gray mb-6 shadow-xl flex items-center justify-between animate-fade-in">
                <span className="font-bold text-base md:text-xl">{t.maxRankDifference}</span>
                <div className="flex items-center bg-black/40 px-3 py-1.5 rounded border border-val-gray/30 focus-within:border-val-red">
                  <input
                    type="number"
                    min="0"
                    value={advanced.maxRankWeightDifference}
                    onChange={(e) => setAdvanced(prev => ({ ...prev, maxRankWeightDifference: Number(e.target.value) }))}
                    className="bg-transparent text-val-light text-base md:text-lg w-16 text-center outline-none appearance-none [-moz-appearance:textfield]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'adv-maps' && (
              <AdvancedCategory title={t.mapSettings} items={MAPS} category="maps" bannedList={advanced.bannedMaps} weights={advanced.mapWeights} onToggleBan={(item) => toggleBan('bannedMaps', item)} onUpdateWeight={(item, w) => updateWeight('mapWeights', item, w)} t={t} />
            )}
            
            {activeTab === 'adv-agents' && (
              <AdvancedCategory title={t.agentSettings} items={AGENTS} category="agents" bannedList={advanced.bannedAgents} weights={advanced.agentWeights} onToggleBan={(item) => toggleBan('bannedAgents', item)} onUpdateWeight={(item, w) => updateWeight('agentWeights', item, w)} t={t} />
            )}
            
            {activeTab === 'adv-main-weapons' && (
              <AdvancedCategory title={t.mainWeapons || 'MAIN WEAPONS'} items={MAIN_WEAPONS} category="weapons" bannedList={advanced.bannedWeapons} weights={advanced.weaponWeights} onToggleBan={(item) => toggleBan('bannedWeapons', item)} onUpdateWeight={(item, w) => updateWeight('weaponWeights', item, w)} t={t} />
            )}
            
            {activeTab === 'adv-sub-weapons' && (
              <AdvancedCategory title={t.subWeapons || 'SUB WEAPONS'} items={SUB_WEAPONS} category="weapons" bannedList={advanced.bannedWeapons} weights={advanced.weaponWeights} onToggleBan={(item) => toggleBan('bannedWeapons', item)} onUpdateWeight={(item, w) => updateWeight('weaponWeights', item, w)} t={t} />
            )}
            
            {activeTab === 'adv-combos' && (
              <div className="bg-black/30 p-4 md:p-6 border-l-4 border-val-gray mb-6 shadow-xl animate-fade-in">
                <div className="font-bold text-xl md:text-2xl flex justify-between items-center outline-none">
                  {t.weaponCombinations}
                </div>
                <div className="mt-6 flex flex-col gap-8">
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-bold text-val-gray">{t.selectMainWeapon}</span>
                      <span className="text-[10px] md:text-xs text-val-gray/50 italic tracking-wider">
                        {t.clickToBanHint || '画像をクリックでBAN'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                      {MAIN_WEAPONS.map(mw => {
                        const isSelected = selectedComboMain === mw;
                        const isBanned = advanced.bannedWeapons.includes(mw);
                        return (
                          <button
                            key={mw}
                            onClick={() => {
                              if (isBanned) {
                                if (window.confirm(t.unbanConfirm.replace('{weapon}', t[mw] || mw))) {
                                  setAdvanced(prev => ({
                                    ...prev,
                                    bannedWeapons: prev.bannedWeapons.filter(w => w !== mw)
                                  }));
                                  setSelectedComboMain(mw);
                                }
                              } else {
                                setSelectedComboMain(mw);
                              }
                            }}
                            className={`relative w-full aspect-video rounded overflow-hidden border-2 transition-all ${isSelected && !isBanned ? 'border-val-red bg-val-red/10 shadow-[0_0_8px_rgba(255,70,85,0.4)]' : 'border-val-gray/30 bg-val-dark hover:border-val-gray/60'} ${isBanned ? 'opacity-80' : ''}`}
                            title={`Select ${t[mw] || mw}`}
                          >
                            <img 
                              src={getImagePath('weapons', mw)} 
                              alt={mw} 
                              className={`w-full h-full object-contain p-2 transition-all duration-300 ${isSelected && !isBanned ? 'opacity-100 scale-110' : 'opacity-60 group-hover:opacity-100'} ${isBanned ? 'grayscale opacity-40' : ''}`} 
                              onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                            {isBanned && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 z-10">
                                <Ban className="w-8 h-8 md:w-10 md:h-10 text-val-red drop-shadow-md mb-1" />
                                <span className="text-xs md:text-sm text-white font-bold leading-tight px-1 whitespace-nowrap">{t.bannedStatus || 'BANNED'}</span>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black via-black/70 to-transparent p-2 pt-6 pointer-events-none text-center z-20">
                              <div className={`font-bold text-sm md:text-base truncate drop-shadow-md ${isSelected && !isBanned ? 'text-white' : 'text-val-gray'} ${isBanned ? 'line-through' : ''}`}>
                                {t[mw] || mw}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-bold text-val-gray">{t.allowedSubWeapons}</span>
                      <span className="text-[10px] md:text-xs text-val-gray/50 italic tracking-wider">
                        {t.clickToBanHint || '画像をクリックでBAN'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                      {SUB_WEAPONS.map(sw => {
                        const isAllowed = advanced.weaponCombinations[selectedComboMain]?.includes(sw) ?? true;
                        const isBanned = advanced.bannedWeapons.includes(sw);
                        return (
                          <button
                            key={sw}
                            onClick={() => {
                              if (isBanned) {
                                if (window.confirm(t.unbanConfirm.replace('{weapon}', t[sw] || sw))) {
                                  setAdvanced(prev => {
                                    const newBannedWeapons = prev.bannedWeapons.filter(w => w !== sw);
                                    const current = prev.weaponCombinations[selectedComboMain] || [];
                                    const updated = current.includes(sw) ? current : [...current, sw];
                                    return { ...prev, bannedWeapons: newBannedWeapons, weaponCombinations: { ...prev.weaponCombinations, [selectedComboMain]: updated } };
                                  });
                                }
                              } else {
                                setAdvanced(prev => {
                                  const current = prev.weaponCombinations[selectedComboMain] || [];
                                  const updated = current.includes(sw) ? current.filter(w => w !== sw) : [...current, sw];
                                  return { ...prev, weaponCombinations: { ...prev.weaponCombinations, [selectedComboMain]: updated } };
                                });
                              }
                            }}
                            className={`relative w-full aspect-video rounded overflow-hidden border-2 transition-all ${isAllowed && !isBanned ? 'border-val-red bg-val-dark shadow-[0_0_8px_rgba(255,70,85,0.4)]' : 'border-val-gray/20 bg-black/80'}`}
                          >
                            <img src={getImagePath('weapons', sw)} alt={sw} className={`w-full h-full object-contain p-2 transition-transform ${isAllowed && !isBanned ? 'opacity-100 group-hover:scale-110' : 'grayscale opacity-40'}`} onError={(e) => e.currentTarget.style.display = 'none'} />
                            
                            {isBanned ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 z-10">
                                <Ban className="w-8 h-8 md:w-10 md:h-10 text-val-red drop-shadow-md mb-1" />
                                <span className="text-xs md:text-sm text-white font-bold leading-tight px-1 whitespace-nowrap">{t.bannedStatus || 'BANNED'}</span>
                              </div>
                            ) : !isAllowed && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-900/30 z-10">
                                <Ban className="w-10 h-10 md:w-12 md:h-12 text-val-red drop-shadow-md" />
                              </div>
                            )}

                            <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black via-black/70 to-transparent p-2 pt-6 pointer-events-none text-center z-20">
                              <div className={`font-bold text-sm md:text-base truncate drop-shadow-md ${isAllowed && !isBanned ? 'text-white' : 'text-val-gray line-through'}`}>
                                  {t[sw] || sw}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {screen === 'result' && result && (
          <div className="flex flex-col gap-6 md:gap-8 animate-slide-up flex-1 relative min-h-0 pb-4">
            {result.map && (
              <div className="relative w-full h-24 md:h-40 shrink-0 rounded overflow-hidden border border-val-gray/30 shadow-lg bg-val-dark">
                <img 
                  src={getImagePath('maps', result.map)} 
                  alt={result.map} 
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-linear-to-r from-val-dark via-val-dark/70 to-transparent pointer-events-none"></div>
                <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-4 md:p-8 pointer-events-none">
                  <span className="text-[10px] md:text-sm text-val-gray font-bold uppercase tracking-widest mb-1">{t.map}</span>
                  <span className="text-2xl md:text-5xl text-white font-bold uppercase tracking-tighter italic drop-shadow-md">{t[result.map] || result.map}</span>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 md:pr-8 z-10">
                  <button 
                    onClick={handleRerollMap}
                    className="bg-val-red hover:bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 text-xs md:text-sm shadow-md rounded animate-fade-in"
                  >
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                    {lang === 'ja' ? 'マップ再抽選' : 'Reroll Map'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col relative min-h-0 gap-6 md:gap-8">
              {Object.keys(result.teams).map((teamKey, index) => {
                const teamPlayers = result.teams[teamKey];
                const side = result.sides?.[teamKey];
                const isDefender = side === 'Defender';
                
                const color = teamCount === 2 
                  ? (isDefender ? TEAM_COLORS[0] : TEAM_COLORS[1]) 
                  : TEAM_COLORS[index % TEAM_COLORS.length];
                
                const title = side 
                  ? (isDefender ? t.defenders : t.attackers) 
                  : (t[teamKey.replace(' ', '').toLowerCase()] || (lang === 'ja' ? `チーム ${index + 1}` : teamKey));

                const teamWeight = teamPlayers.reduce((sum, p) => sum + getRankWeight(p.rank, p.tier), 0);

                return (
                  <React.Fragment key={teamKey}>
                    {index > 0 && teamCount === 2 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center gap-1">
                        <div className="bg-val-dark px-5 py-2 border-2 border-val-red text-val-red font-bold text-xl md:text-2xl italic shadow-2xl -skew-x-10">
                          <div className="skew-x-10">{t.vs || 'VS'}</div>
                        </div>
                      </div>
                    )}

                    <div className={`flex-1 ${color.bg} border-t-2 ${color.border} p-2 md:p-3 relative overflow-hidden shadow-lg flex flex-col min-h-0 rounded-b items-start`}>
                      {teamCount === 2 && (
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                           {isDefender ? <Shield className="w-80 h-80" /> : <Swords className="w-80 h-80" />}
                         </div>
                      )}
                      <div className="flex items-center gap-4 mb-2 relative z-10 pl-2 shrink-0 w-full">
                        <h2 className={`text-xl md:text-2xl font-bold uppercase italic tracking-tighter ${color.header} flex items-center gap-3`}>
                          {title}
                          {!config.autoTeams && teamCount === 2 && (
                            <span className="text-base font-normal text-val-light opacity-80 tracking-widest">[{t[teamKey.replace(' ', '').toLowerCase()] || (lang === 'ja' ? `チーム ${index + 1}` : teamKey)}]</span>
                          )}
                        </h2>
                        {config.useRanks && config.autoTeams && (
                          <span className={`${color.bg} ${color.header} px-3 py-1 rounded text-sm md:text-base border ${color.border}/30`}>
                            {t.teamWeight.replace('{weight}', String(teamWeight))}
                          </span>
                        )}
                        <div className={`h-0.5 flex-1 bg-linear-to-r ${color.line} to-transparent`}></div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 relative z-10 w-full">
                        {teamPlayers.map(p => <PlayerCard key={p.id} player={p} isDefender={isDefender} t={t} />)}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};