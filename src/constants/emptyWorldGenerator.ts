import type { WorldData } from '../types/world';
import { getFreshDefaultWorldData } from './defaultWorld';

/**
 * Generate a brand‑new empty world.
 *
 * - No objects, roads, or zones.
 * - Terrain is kept from the default world so the renderer has a valid surface.
 * - Metadata is cloned from the default but a fresh unique `id` and timestamps are applied.
 * - Returns a deep‑cloned independent object (no shared references with the default).
 */
export function generateEmptyWorld(): WorldData {
  // Start with a fresh clone of the default world data.
  const world = getFreshDefaultWorldData();

  // Strip everything that would populate the world.
  world.objects = [];
  world.roads = { nodes: [], segments: [] };
  // Preserve the terrain as‑is (including water bodies) for rendering.
  // Zones keep the original cell size but no cells.
  world.zones = { cellSize: world.zones.cellSize, cells: [] };

  // Create a unique metadata entry.
  const now = Date.now();
  world.metadata = {
    ...world.metadata,
    id: `vn_world_${now}`,
    createdAt: now,
    updatedAt: now,
  };

  return world;
}
