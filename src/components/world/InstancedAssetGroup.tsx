import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import type { WorldObject } from '../../types/world';
import type { AssetDefinition } from '../../types/asset';

interface InstancedAssetGroupProps {
  definition: AssetDefinition;
  objects: WorldObject[];
}

export function InstancedAssetGroup({ definition, objects }: InstancedAssetGroupProps) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  const genericRef = useRef<THREE.InstancedMesh>(null);

  const isTree = definition.id === 'prop_tree';

  useLayoutEffect(() => {
    if (objects.length === 0) return;
    const tempObj = new THREE.Object3D();

    if (isTree) {
      if (trunkRef.current && foliageRef.current) {
        objects.forEach((obj, i) => {
          // Batang pohon
          tempObj.position.set(obj.position[0], obj.position[1] + 0.7, obj.position[2]);
          tempObj.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
          tempObj.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
          tempObj.updateMatrix();
          trunkRef.current!.setMatrixAt(i, tempObj.matrix);

          // Daun pohon
          tempObj.position.set(obj.position[0], obj.position[1] + 1.8, obj.position[2]);
          tempObj.updateMatrix();
          foliageRef.current!.setMatrixAt(i, tempObj.matrix);
        });
        trunkRef.current.instanceMatrix.needsUpdate = true;
        foliageRef.current.instanceMatrix.needsUpdate = true;
      }
    } else {
      if (genericRef.current) {
        objects.forEach((obj, i) => {
          tempObj.position.set(...obj.position);
          tempObj.rotation.set(...obj.rotation);
          tempObj.scale.set(...obj.scale);
          tempObj.updateMatrix();
          genericRef.current!.setMatrixAt(i, tempObj.matrix);
        });
        genericRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  }, [objects, isTree]);

  if (objects.length === 0) return null;

  if (isTree) {
    return (
      <group>
        <instancedMesh
          ref={trunkRef}
          args={[undefined, undefined, objects.length]}
          castShadow
        >
          <cylinderGeometry args={[0.15, 0.2, 1.4, 8]} />
          <meshStandardMaterial color="#765039" />
        </instancedMesh>
        <instancedMesh
          ref={foliageRef}
          args={[undefined, undefined, objects.length]}
          castShadow
        >
          <sphereGeometry args={[0.9, 12, 12]} />
          <meshStandardMaterial color="#438456" roughness={0.9} />
        </instancedMesh>
      </group>
    );
  }

  // Generic Instanced Mesh untuk aset lainnya dengan renderMode INSTANCED
  const { width, height, depth } = definition.dimensions;
  return (
    <instancedMesh
      ref={genericRef}
      args={[undefined, undefined, objects.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={definition.defaultColor} />
    </instancedMesh>
  );
}
