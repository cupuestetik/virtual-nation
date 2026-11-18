import type { ComponentType } from 'react';
import type { Vector3Tuple } from './world';

export type AssetCategory =
  | 'GOVERNMENT'
  | 'PUBLIC_SERVICE'
  | 'COMMERCIAL'
  | 'RESIDENTIAL'
  | 'INFRASTRUCTURE'
  | 'ENVIRONMENT';

export type AssetRenderMode = 'STANDARD' | 'INSTANCED';

export interface ObjectColliderConfig {
  type: 'BOX' | 'CYLINDER';
  dimensions: Vector3Tuple; // [width, height, depth]
  offset?: Vector3Tuple;
}

export interface AssetRenderProps {
  color?: string;
  isGhost?: boolean;
}

export interface AssetDefinition {
  id: string;
  name: string;
  category: AssetCategory;
  description: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  defaultColor: string;
  iconName: string;
  collider: ObjectColliderConfig;
  renderMode: AssetRenderMode;
  renderComponent?: ComponentType<AssetRenderProps>;
}
