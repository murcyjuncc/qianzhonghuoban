export type GameModuleId = 'mahjong' | 'pdk' | 'phz';

export type RoomEnterContext = {
  // from AppState.room (best-effort)
  roomID?: number | string;
  serverId?: string;
  unionID?: number | string;
  gameRuleID?: number | string;
  raw?: any;
};

export type GameModule = {
  id: GameModuleId;
  displayName: string;
  /**
   * Bundle name under assets (Cocos Creator bundle).
   * Later we can switch to remote bundles.
   */
  bundle: string;

  /**
   * Optional preload hook (assets, configs, etc.).
   * Should be idempotent.
   */
  preload?: () => Promise<void>;

  /**
   * Enter module after room session is ready.
   * For now it's allowed to be a placeholder.
   */
  enter: (ctx: RoomEnterContext) => Promise<void>;
};

