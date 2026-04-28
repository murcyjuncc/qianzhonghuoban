import { GameModuleManager } from './GameModuleManager';
import type { GameModule } from './types';
import { AppState } from '../AppState';
import { Node, director } from 'cc';
import { MaJiangBoot } from '../../bundles/mahjong/MaJiangBoot';

const Modules: GameModule[] = [
  {
    id: 'mahjong',
    displayName: '麻将',
    // First real bundle.
    bundle: 'mahjong',
    async enter(ctx) {
      // Keep old naming convention: MaJiang (as used by assets/images/Game/MaJiang).
      const sceneName = 'MaJiang';
      try {
        await GameModuleManager.loadSceneFromBundle('mahjong', sceneName);
        const scene = director.getScene();
        if (scene) {
          // Put boot under Canvas to ensure UI layer rendering.
          const canvas = scene.getChildByName('Canvas');
          const bootNode = new Node('MaJiangBoot');
          if (canvas) {
            bootNode.layer = canvas.layer;
            canvas.addChild(bootNode);
          } else {
            // Fallback: use UI_2D layer mask value.
            bootNode.layer = 33554432;
            scene.addChild(bootNode);
          }
          bootNode.addComponent(MaJiangBoot);
          // eslint-disable-next-line no-console
          console.log('[GameModule][mahjong] boot attached under', canvas ? 'Canvas' : 'Scene', 'active=', bootNode.active);
        }
        return;
      } catch (e: any) {
        // Bundle exists but scene not created yet; don't crash.
        // eslint-disable-next-line no-console
        console.warn(`[GameModule][mahjong] scene '${sceneName}' not ready, stay in hall.`, e?.message || e);
      }

      // As a placeholder, keep the hall overlay, but persist room context.
      AppState.setRoom({
        ...AppState.room,
        gameRuleID: ctx.gameRuleID ?? AppState.room?.gameRuleID,
        unionID: ctx.unionID ?? AppState.room?.unionID,
      });
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


