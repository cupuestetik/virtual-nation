import { useMemo } from 'react';
import { useWorldStore } from '../../stores/useWorldStore';
import { assetRegistry } from '../../registry/assetRegistry';
import type { WorldObject } from '../../types/world';
import type { AssetDefinition } from '../../types/asset';
import { StandardObjectRenderer } from './StandardObjectRenderer';
import { InstancedAssetGroup } from './InstancedAssetGroup';
import { FallbackObject } from './FallbackObject';

export interface WorldRendererProps {
  onSelect?: (object: WorldObject, definition: AssetDefinition) => void;
}

export function WorldRenderer({ onSelect }: WorldRendererProps) {
  // 1. Membaca data objek dunia dari Single Source of Truth (useWorldStore)
  const objects = useWorldStore((state) => state.objects);

  // 2. Mengelompokkan objek berdasarkan renderMode dari AssetDefinition (tanpa prefix check)
  const { standardObjects, instancedGroups, unknownObjects } = useMemo(() => {
    const standard: { object: WorldObject; definition: AssetDefinition }[] = [];
    const instancedMap = new Map<string, { definition: AssetDefinition; objects: WorldObject[] }>();
    const unknown: WorldObject[] = [];

    for (const obj of objects) {
      const definition = assetRegistry.get(obj.assetId);

      // Penanganan aman jika aset belum terdaftar (tidak crash)
      if (!definition) {
        unknown.push(obj);
        continue;
      }

      // Pemilahan murni berdasarkan properti renderMode di AssetDefinition
      if (definition.renderMode === 'INSTANCED') {
        const group = instancedMap.get(obj.assetId) || {
          definition,
          objects: [],
        };
        group.objects.push(obj);
        instancedMap.set(obj.assetId, group);
      } else {
        standard.push({ object: obj, definition });
      }
    }

    return {
      standardObjects: standard,
      instancedGroups: Array.from(instancedMap.values()),
      unknownObjects: unknown,
    };
  }, [objects]);

  return (
    <group name="world-dynamic-renderer">
      {/* 1. Objek dengan renderMode STANDARD (Bangunan, Kantor, Fasilitas) */}
      {standardObjects.map(({ object, definition }) => (
        <StandardObjectRenderer
          key={object.id}
          object={object}
          definition={definition}
          onSelect={onSelect}
        />
      ))}

      {/* 2. Objek dengan renderMode INSTANCED (Batch rendering 1 draw-call per jenis aset) */}
      {instancedGroups.map(({ definition, objects: groupObjects }) => (
        <InstancedAssetGroup
          key={definition.id}
          definition={definition}
          objects={groupObjects}
        />
      ))}

      {/* 3. Objek cadangan jika assetId tidak dikenali di AssetRegistry (Aman & Tidak Crash) */}
      {unknownObjects.map((obj) => (
        <FallbackObject
          key={obj.id}
          object={obj}
          onSelect={(unsupportedObj) => {
            console.warn(`Objek yang dipilih tidak memiliki definisi: ${unsupportedObj.assetId}`);
          }}
        />
      ))}
    </group>
  );
}

export default WorldRenderer;
