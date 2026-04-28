import { director } from 'cc';
import { BundleLoader } from './BundleLoader';
import type { GameModule, GameModuleId, RoomEnterContext } from './types';

export class GameModuleManager {
  private static modules = new Map<GameModuleId, GameModule>();

  public static register(mod: GameModule) {
    this.modules.set(mod.id, mod);
  }

  public static get(id: GameModuleId) {
    return this.modules.get(id) ?? null;
  }

  public static list(): GameModule[] {
    return [...this.modules.values()];
  }

  /**
   * Decide which module to use for a given room.
   * For now: if gameRuleID contains known mapping, otherwise default to mahjong.
   */
  public static resolveModuleId(ctx: RoomEnterContext): GameModuleId {
    const gid = `${ctx.gameRuleID ?? ''}`.trim();
    // TODO: replace with real mapping when server schema is known.
    if (gid.startsWith('2')) return 'pdk';
    if (gid.startsWith('3')) return 'phz';
    return 'mahjong';
  }

  public static async enterByContext(ctx: RoomEnterContext) {
    const id = this.resolveModuleId(ctx);
    const mod = this.get(id);
    if (!mod) throw new Error(`GameModule not registered: ${id}`);

    await BundleLoader.load(mod.bundle);
    if (mod.preload) await mod.preload();
    await mod.enter(ctx);
  }

  /**
   * Framework-level helper: load a scene from a module's bundle.
   */
  public static async loadSceneFromBundle(bundleName: string, sceneName: string): Promise<void> {
    await BundleLoader.load(bundleName);
    await new Promise<void>((resolve, reject) => {
      director.loadScene(sceneName, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

