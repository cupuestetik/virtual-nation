import type { AssetDefinition, AssetCategory } from '../types/asset';
import { defaultAssets } from './defaultAssets';

export class AssetRegistry {
  private assets = new Map<string, AssetDefinition>();

  constructor(initialAssets: AssetDefinition[] = []) {
    initialAssets.forEach((asset) => {
      this.assets.set(asset.id, asset);
    });
  }

  /**
   * Mengambil definisi aset berdasarkan ID
   */
  get(id: string): AssetDefinition | undefined {
    return this.assets.get(id);
  }

  /**
   * Memeriksa apakah suatu ID terdaftar dalam registry
   */
  has(id: string): boolean {
    return this.assets.has(id);
  }

  /**
   * Mengambil semua aset yang terdaftar
   */
  getAll(): AssetDefinition[] {
    return Array.from(this.assets.values());
  }

  /**
   * Mengambil aset berdasarkan kategori
   */
  getByCategory(category: AssetCategory): AssetDefinition[] {
    return this.getAll().filter((asset) => asset.category === category);
  }

  /**
   * Mendaftarkan aset baru ke dalam registry
   */
  register(asset: AssetDefinition): void {
    this.assets.set(asset.id, asset);
  }

  /**
   * Mengosongkan dan mendaftarkan ulang daftar aset
   */
  reset(assets: AssetDefinition[] = []): void {
    this.assets.clear();
    assets.forEach((asset) => this.assets.set(asset.id, asset));
  }
}

/**
 * Singleton instance AssetRegistry dengan data aset bawaan Virtual Nation
 */
export const assetRegistry = new AssetRegistry(defaultAssets);
