import { useEditorStore } from '../../stores/useEditorStore';
import { assetRegistry } from '../../registry/assetRegistry';
import { ProceduralBuilding } from '../world/ProceduralBuilding';
import { useMemo } from 'react';

/**
 * Ghost preview component used in Build Mode.
 * It renders the selected asset at the current ghost position with transparency.
 */
export function GhostPreview() {
  const selectedAssetId = useEditorStore((s) => s.selectedAssetId);
  const ghostPos = useEditorStore((s) => s.ghostPosition);

  const definition = useMemo(() => {
    return selectedAssetId ? assetRegistry.get(selectedAssetId) ?? null : null;
  }, [selectedAssetId]);

  if (!definition || !ghostPos) return null;

  return (
    <group position={ghostPos as [number, number, number]}>
      <ProceduralBuilding definition={definition} isGhost />
    </group>
  );
}
