import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEditorStore } from '../../stores/useEditorStore';
import { useWorldStore } from '../../stores/useWorldStore';
import { assetRegistry } from '../../registry/assetRegistry';

/**
 * Handles pointer interactions for placing assets in Build Mode.
 * - Updates ghost preview position on pointer move.
 * - Places an object on left click using useWorldStore.addObject.
 * - Supports snap‑to‑grid based on world metadata.
 */
export function BuildEditor() {
  const { gl, camera } = useThree();
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y = 0 ground plane

  const selectedAssetId = useEditorStore((s) => s.selectedAssetId);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setGhostPosition = useEditorStore((s) => s.setGhostPosition);
  const addObject = useWorldStore((s) => s.addObject);
  const gridSize = useWorldStore((s) => s.metadata.gridSize);

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      if (!selectedAssetId) {
        setGhostPosition(null);
        return;
      }
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera({ x, y }, camera);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersect);
      if (intersect) {
        setGhostPosition([intersect.x, 0, intersect.z]);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!selectedAssetId) return;
      if (event.button !== 0) return; // left click only
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera({ x, y }, camera);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersect);
      if (intersect) {
        let pos: [number, number, number] = [intersect.x, 0, intersect.z];
        if (snapEnabled) {
          const size = gridSize ?? 1;
          pos = [
            Math.round(pos[0] / size) * size,
            0,
            Math.round(pos[2] / size) * size,
          ];
        }
        addObject(selectedAssetId, pos);
      }
    };

    gl.domElement.addEventListener('pointermove', handlePointerMove);
    gl.domElement.addEventListener('pointerdown', handleClick);
    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
      gl.domElement.removeEventListener('pointerdown', handleClick);
    };
  }, [gl, camera, selectedAssetId, snapEnabled, gridSize, setGhostPosition, addObject]);

  return null;
}
