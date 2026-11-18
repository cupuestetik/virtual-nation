import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { WorldObject } from '../../types/world';

interface FallbackObjectProps {
  object: WorldObject;
  onSelect?: (object: WorldObject) => void;
}

const warnedAssetIds = new Set<string>();

export function FallbackObject({ object, onSelect }: FallbackObjectProps) {
  const hasWarned = useRef(false);

  useEffect(() => {
    if (!hasWarned.current && !warnedAssetIds.has(object.assetId)) {
      warnedAssetIds.add(object.assetId);
      hasWarned.current = true;
      console.warn(
        `[WorldRenderer] Aset "${object.assetId}" (obj ID: ${object.id}) tidak ditemukan di AssetRegistry. Menampilkan objek fallback.`
      );
    }
  }, [object.assetId, object.id]);

  return (
    <group
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(object);
      }}
    >
      {/* Inti box transparan */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.3} />
      </mesh>

      {/* Garis wireframe penanda */}
      <lineSegments position={[0, 1, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
        <lineBasicMaterial color="#f59e0b" linewidth={2} />
      </lineSegments>
    </group>
  );
}
