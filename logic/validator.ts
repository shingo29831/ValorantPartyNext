// src/logic/validator.ts
// AI Role: チーム作成前の事前検証ロジック
// 役割: エージェント重複OFF時の必要エージェント数の検証を行う

export const validateTeamCreation = (
  totalAgentsCount: number,
  bannedAgentsCount: number,
  allowDuplicateAgents: boolean
): { isValid: boolean; errorMessageKey: string | null } => {
  if (!allowDuplicateAgents) {
    const unbannedAgentsCount = totalAgentsCount - bannedAgentsCount;
    
    // なぜ: 重複なしで1チーム5人を構成するには最低5体のエージェントが必要なため
    if (unbannedAgentsCount <= 4) {
      return {
        isValid: false,
        errorMessageKey: 'notEnoughAgentsWarning'
      };
    }
  }

  return {
    isValid: true,
    errorMessageKey: null
  };
};