export type GameModuleId = 'mahjong' | 'pdk' | 'phz';

export type GameModule = {
  id: GameModuleId;
  displayName: string;
  // later: bundleName, enterRoomScene, preloadAssets, route handlers...
};

export const GameModuleRegistry: Record<GameModuleId, GameModule> = {
  mahjong: { id: 'mahjong', displayName: '麻将' },
  pdk: { id: 'pdk', displayName: '跑得快' },
  phz: { id: 'phz', displayName: '跑胡子' },
};

