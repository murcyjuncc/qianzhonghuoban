import { GameModuleManager } from './GameModuleManager';
import type { GameModule } from './types';

const Modules: GameModule[] = [
  {
    id: 'mahjong',
    displayName: '麻将',
    // First real bundle.
    bundle: 'mahjong',
    async enter(ctx) {
      // Placeholder: real implementation will load bundle scene & init room.
      // eslint-disable-next-line no-console
      console.log('[GameModule][mahjong] enter ctx=', ctx);
      // Keep user in hall for now.
    },
  },
  {
    id: 'pdk',
    displayName: '跑得快',
    bundle: 'resources',
    async enter(ctx) {
      // eslint-disable-next-line no-console
      console.log('[GameModule][pdk] enter ctx=', ctx);
    },
  },
  {
    id: 'phz',
    displayName: '跑胡子',
    bundle: 'resources',
    async enter(ctx) {
      // eslint-disable-next-line no-console
      console.log('[GameModule][phz] enter ctx=', ctx);
    },
  },
];

export function registerDefaultGameModules() {
  for (const m of Modules) GameModuleManager.register(m);
}


