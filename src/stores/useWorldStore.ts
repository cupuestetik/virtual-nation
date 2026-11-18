import { create } from 'zustand';
import type {
  WorldData,
  WorldObject,
  Vector3Tuple,
  RotationTuple,
  RoadData,
  TerrainData,
  ZoneData,
  WorldMetadata,
} from '../types/world';
import type { HistoryCommand } from '../types/history';
import { initialWorldData, getFreshDefaultWorldData } from '../constants/defaultWorld';

const MAX_HISTORY_DEPTH = 30;

function generateUniqueId(prefix = 'obj'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export interface WorldStoreState {
  // Data Dunia Inti (Single Source of Truth)
  metadata: WorldMetadata;
  objects: WorldObject[];
  roads: RoadData;
  terrain: TerrainData;
  zones: ZoneData;

  // Status Riwayat Undo / Redo
  past: HistoryCommand[];
  future: HistoryCommand[];
  canUndo: boolean;
  canRedo: boolean;

  // Aksi CRUD Objek
  addObject: (
    assetId: string,
    position: Vector3Tuple,
    rotation?: RotationTuple,
    scale?: Vector3Tuple,
    customName?: string
  ) => string;
  updateObject: (id: string, updates: Partial<Omit<WorldObject, 'id' | 'assetId'>>) => void;
  updateObjectTransform: (
    id: string,
    transform: { position?: Vector3Tuple; rotation?: RotationTuple; scale?: Vector3Tuple },
    recordHistory?: boolean
  ) => void;
  removeObject: (id: string) => boolean;
  duplicateObject: (id: string, offset?: Vector3Tuple) => string | null;

  // Aksi Undo / Redo
  undo: () => void;
  redo: () => void;
  recordAction: (command: HistoryCommand) => void;
  clearHistory: () => void;

  // Aksi Manajemen Dunia
  loadWorld: (data: WorldData) => void;
  resetToDefault: () => void;
  updateNationName: (name: string) => void;
  updateCityName: (name: string) => void;
}

/**
 * Logika eksekusi balik (Undo) untuk satu HistoryCommand
 */
function applyUndoCommand(command: HistoryCommand, currentObjects: WorldObject[]): WorldObject[] {
  switch (command.type) {
    case 'PLACE_OBJECT':
      return currentObjects.filter((o) => o.id !== command.object.id);

    case 'DELETE_OBJECT':
      return [...currentObjects, command.object];

    case 'TRANSFORM_OBJECT':
      return currentObjects.map((o) =>
        o.id === command.objectId
          ? {
              ...o,
              position: command.prev.position,
              rotation: command.prev.rotation,
              scale: command.prev.scale,
            }
          : o
      );

    case 'DUPLICATE_OBJECT':
      return currentObjects.filter((o) => o.id !== command.duplicatedObject.id);

    case 'BATCH_ACTION': {
      let result = currentObjects;
      // Undo batch dilakukan dari aksi terakhir ke aksi pertama
      for (let i = command.actions.length - 1; i >= 0; i--) {
        result = applyUndoCommand(command.actions[i], result);
      }
      return result;
    }

    default:
      return currentObjects;
  }
}

/**
 * Logika eksekusi ulang (Redo) untuk satu HistoryCommand
 */
function applyRedoCommand(command: HistoryCommand, currentObjects: WorldObject[]): WorldObject[] {
  switch (command.type) {
    case 'PLACE_OBJECT':
      return [...currentObjects, command.object];

    case 'DELETE_OBJECT':
      return currentObjects.filter((o) => o.id !== command.object.id);

    case 'TRANSFORM_OBJECT':
      return currentObjects.map((o) =>
        o.id === command.objectId
          ? {
              ...o,
              position: command.next.position,
              rotation: command.next.rotation,
              scale: command.next.scale,
            }
          : o
      );

    case 'DUPLICATE_OBJECT':
      return [...currentObjects, command.duplicatedObject];

    case 'BATCH_ACTION': {
      let result = currentObjects;
      for (let i = 0; i < command.actions.length; i++) {
        result = applyRedoCommand(command.actions[i], result);
      }
      return result;
    }

    default:
      return currentObjects;
  }
}

export const useWorldStore = create<WorldStoreState>((set, get) => ({
  metadata: initialWorldData.metadata,
  objects: initialWorldData.objects,
  roads: initialWorldData.roads,
  terrain: initialWorldData.terrain,
  zones: initialWorldData.zones,

  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  addObject: (
    assetId: string,
    position: Vector3Tuple,
    rotation: RotationTuple = [0, 0, 0],
    scale: Vector3Tuple = [1, 1, 1],
    customName?: string
  ) => {
    const newId = generateUniqueId('obj');
    const newObj: WorldObject = {
      id: newId,
      assetId,
      position: [...position],
      rotation: [...rotation],
      scale: [...scale],
      customName,
      isLocked: false,
    };

    set((state) => {
      const nextObjects = [...state.objects, newObj];
      const nextPast = [...state.past, { type: 'PLACE_OBJECT' as const, object: newObj }];
      if (nextPast.length > MAX_HISTORY_DEPTH) {
        nextPast.shift();
      }

      return {
        objects: nextObjects,
        past: nextPast,
        future: [],
        canUndo: true,
        canRedo: false,
        metadata: { ...state.metadata, updatedAt: Date.now() },
      };
    });

    return newId;
  },

  updateObject: (id, updates) => {
    set((state) => ({
      objects: state.objects.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
      metadata: { ...state.metadata, updatedAt: Date.now() },
    }));
  },

  updateObjectTransform: (id, transform, recordHistory = false) => {
    const current = get().objects.find((o) => o.id === id);
    if (!current || current.isLocked) return;

    const prevTransform = {
      position: [...current.position] as Vector3Tuple,
      rotation: [...current.rotation] as RotationTuple,
      scale: [...current.scale] as Vector3Tuple,
    };

    const nextTransform = {
      position: transform.position ? [...transform.position] as Vector3Tuple : prevTransform.position,
      rotation: transform.rotation ? [...transform.rotation] as RotationTuple : prevTransform.rotation,
      scale: transform.scale ? [...transform.scale] as Vector3Tuple : prevTransform.scale,
    };

    set((state) => {
      const nextObjects = state.objects.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              position: nextTransform.position,
              rotation: nextTransform.rotation,
              scale: nextTransform.scale,
            }
          : obj
      );

      if (!recordHistory) {
        return {
          objects: nextObjects,
          metadata: { ...state.metadata, updatedAt: Date.now() },
        };
      }

      const nextPast = [
        ...state.past,
        {
          type: 'TRANSFORM_OBJECT' as const,
          objectId: id,
          prev: prevTransform,
          next: nextTransform,
        },
      ];
      if (nextPast.length > MAX_HISTORY_DEPTH) {
        nextPast.shift();
      }

      return {
        objects: nextObjects,
        past: nextPast,
        future: [],
        canUndo: true,
        canRedo: false,
        metadata: { ...state.metadata, updatedAt: Date.now() },
      };
    });
  },

  removeObject: (id) => {
    const target = get().objects.find((o) => o.id === id);
    if (!target || target.isLocked) return false;

    set((state) => {
      const nextObjects = state.objects.filter((o) => o.id !== id);
      const nextPast = [...state.past, { type: 'DELETE_OBJECT' as const, object: target }];
      if (nextPast.length > MAX_HISTORY_DEPTH) {
        nextPast.shift();
      }

      return {
        objects: nextObjects,
        past: nextPast,
        future: [],
        canUndo: true,
        canRedo: false,
        metadata: { ...state.metadata, updatedAt: Date.now() },
      };
    });

    return true;
  },

  duplicateObject: (id, offset = [2, 0, 2]) => {
    const target = get().objects.find((o) => o.id === id);
    if (!target) return null;

    const newId = generateUniqueId('obj');
    const duplicated: WorldObject = {
      ...target,
      id: newId,
      position: [
        target.position[0] + offset[0],
        target.position[1] + offset[1],
        target.position[2] + offset[2],
      ],
      isLocked: false,
    };

    set((state) => {
      const nextObjects = [...state.objects, duplicated];
      const nextPast = [
        ...state.past,
        { type: 'DUPLICATE_OBJECT' as const, duplicatedObject: duplicated },
      ];
      if (nextPast.length > MAX_HISTORY_DEPTH) {
        nextPast.shift();
      }

      return {
        objects: nextObjects,
        past: nextPast,
        future: [],
        canUndo: true,
        canRedo: false,
        metadata: { ...state.metadata, updatedAt: Date.now() },
      };
    });

    return newId;
  },

  recordAction: (command) => {
    set((state) => {
      const nextPast = [...state.past, command];
      if (nextPast.length > MAX_HISTORY_DEPTH) {
        nextPast.shift();
      }
      return {
        past: nextPast,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { past, future, objects } = get();
    if (past.length === 0) return;

    const command = past[past.length - 1];
    const nextPast = past.slice(0, -1);
    const nextObjects = applyUndoCommand(command, objects);
    const nextFuture = [command, ...future];

    set((state) => ({
      objects: nextObjects,
      past: nextPast,
      future: nextFuture,
      canUndo: nextPast.length > 0,
      canRedo: true,
      metadata: { ...state.metadata, updatedAt: Date.now() },
    }));
  },

  redo: () => {
    const { past, future, objects } = get();
    if (future.length === 0) return;

    const command = future[0];
    const nextFuture = future.slice(1);
    const nextObjects = applyRedoCommand(command, objects);
    const nextPast = [...past, command];

    set((state) => ({
      objects: nextObjects,
      past: nextPast,
      future: nextFuture,
      canUndo: true,
      canRedo: nextFuture.length > 0,
      metadata: { ...state.metadata, updatedAt: Date.now() },
    }));
  },

  clearHistory: () => {
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  loadWorld: (data) => {
    // Pastikan membuat deep clone mandiri agar tidak terjadi referensi shared object
    const cloned: WorldData = JSON.parse(JSON.stringify(data));
    set({
      metadata: cloned.metadata,
      objects: cloned.objects,
      roads: cloned.roads,
      terrain: cloned.terrain,
      zones: cloned.zones,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  resetToDefault: () => {
    const fresh = getFreshDefaultWorldData();
    set({
      metadata: fresh.metadata,
      objects: fresh.objects,
      roads: fresh.roads,
      terrain: fresh.terrain,
      zones: fresh.zones,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  updateNationName: (name) => {
    set((state) => ({
      metadata: { ...state.metadata, nationName: name, updatedAt: Date.now() },
    }));
  },

  updateCityName: (name) => {
    set((state) => ({
      metadata: { ...state.metadata, cityName: name, updatedAt: Date.now() },
    }));
  },
}));
