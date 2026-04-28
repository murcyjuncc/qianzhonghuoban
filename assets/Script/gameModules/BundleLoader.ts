import { assetManager } from 'cc';

type LoadedBundle = {
  name: string;
  bundle: any;
};

/**
 * Small wrapper around Cocos assetManager.loadBundle with caching.
 * Keep it framework-only: no game-specific knowledge here.
 */
export class BundleLoader {
  private static cache = new Map<string, LoadedBundle>();
  private static inflight = new Map<string, Promise<LoadedBundle>>();

  public static async load(bundleName: string): Promise<LoadedBundle> {
    const cached = this.cache.get(bundleName);
    if (cached) return cached;

    const inflight = this.inflight.get(bundleName);
    if (inflight) return inflight;

    const p = new Promise<LoadedBundle>((resolve, reject) => {
      assetManager.loadBundle(bundleName, (err, bundle) => {
        if (err) {
          reject(new Error(`loadBundle failed: ${bundleName}: ${String((err as any)?.message || err)}`));
          return;
        }
        const loaded = { name: bundleName, bundle };
        this.cache.set(bundleName, loaded);
        resolve(loaded);
      });
    }).finally(() => this.inflight.delete(bundleName));

    this.inflight.set(bundleName, p);
    return p;
  }

  public static get(bundleName: string) {
    return this.cache.get(bundleName)?.bundle ?? null;
  }
}

