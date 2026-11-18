import type { WorldObject } from '../../types/world';
import type { AssetDefinition } from '../../types/asset';
import { ProceduralBuilding } from './ProceduralBuilding';

interface StandardObjectRendererProps {
  object: WorldObject;
  definition: AssetDefinition;
  onSelect?: (object: WorldObject, definition: AssetDefinition) => void;
}

export function StandardObjectRenderer({
  object,
  definition,
  onSelect,
}: StandardObjectRendererProps) {
  const CustomRenderer = definition.renderComponent;

  return (
    <group
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(object, definition);
      }}
    >
      {CustomRenderer ? (
        <CustomRenderer color={definition.defaultColor} />
      ) : (
        <ProceduralBuilding definition={definition} />
      )}
    </group>
  );
}
