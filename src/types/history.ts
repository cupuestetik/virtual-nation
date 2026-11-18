import type { WorldObject, Vector3Tuple, RotationTuple } from './world';

export type HistoryCommand =
  | {
      type: 'PLACE_OBJECT';
      object: WorldObject;
    }
  | {
      type: 'DELETE_OBJECT';
      object: WorldObject;
    }
  | {
      type: 'TRANSFORM_OBJECT';
      objectId: string;
      prev: {
        position: Vector3Tuple;
        rotation: RotationTuple;
        scale: Vector3Tuple;
      };
      next: {
        position: Vector3Tuple;
        rotation: RotationTuple;
        scale: Vector3Tuple;
      };
    }
  | {
      type: 'DUPLICATE_OBJECT';
      duplicatedObject: WorldObject;
    }
  | {
      type: 'BATCH_ACTION';
      actions: HistoryCommand[];
    };
