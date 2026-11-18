import { create } from 'zustand';
import type { WorldData } from '../types/world';
import { generateEmptyWorld } from '../constants/emptyWorldGenerator';
import { getFreshDefaultWorldData } from '../constants/defaultWorld';
import { useWorldStore } from './useWorldStore';

/** Helper to generate a unique id safe for both browsers & node */
function generateId(prefix: string): string {
  const now = Date.now();
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return `${prefix}_${(crypto as any).randomUUID()}`;
  }
  return `${prefix}_${now}_${Math.random().toString(36).substring(2, 9)}`;
}

/** Cached default slot to avoid duplicate creation when the module is evaluated more than once (e.g., React StrictMode). */
let cachedDefaultSlot: WorldSlot | null = null;

export interface WorldSlot {
  slotId: string;
  worldId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  size?: number;
  data: WorldData;
}

export interface WorldSlotsStore {
  slots: WorldSlot[];
  activeSlotId: string | null;
  addSlot: (name: string) => void;
  setActiveSlot: (slotId: string) => void;
}

/** Capture the current world store state (only serializable world data) into the provided slot. */
function syncCurrentWorldToSlot() {
  const ws = useWorldStore.getState();
  const snapshot: WorldData = {
    metadata: ws.metadata,
    objects: ws.objects,
    roads: ws.roads,
    terrain: ws.terrain,
    zones: ws.zones,
  };
  // Deep clone to ensure immutability of saved data
  const deepClone: WorldData = JSON.parse(JSON.stringify(snapshot));
  return { data: deepClone, updatedAt: Date.now() };
}

export const useWorldSlotsStore = create<WorldSlotsStore>((set, get) => {
  // Initialise default slot once
  if (!cachedDefaultSlot) {
    const defaultData = getFreshDefaultWorldData();
    cachedDefaultSlot = {
      slotId: generateId('slot'),
      worldId: defaultData.metadata.id,
      name: 'Default World',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      size: defaultData.metadata.gridSize,
      data: defaultData,
    };
    // Load into the main world store
    useWorldStore.getState().loadWorld(cachedDefaultSlot.data);
  }

  const defaultSlot = cachedDefaultSlot!;

  return {
    slots: [defaultSlot],
    activeSlotId: defaultSlot.slotId,

    addSlot: (name: string) => {
      // Save current active slot before creating a new one
      const currentId = get().activeSlotId;
      if (currentId) {
        const snapshot = syncCurrentWorldToSlot();
        set(state => ({
          slots: state.slots.map(s =>
            s.slotId === currentId ? { ...s, data: snapshot.data, updatedAt: snapshot.updatedAt } : s
          ),
        }));
      }

      const newWorld = generateEmptyWorld();
      const now = Date.now();
      const newSlot: WorldSlot = {
        slotId: generateId('slot'),
        worldId: newWorld.metadata.id,
        name: name || 'Untitled World',
        createdAt: now,
        updatedAt: now,
        size: newWorld.metadata.gridSize,
        data: newWorld,
      };

      set((state) => ({
        slots: [...state.slots, newSlot],
        activeSlotId: newSlot.slotId,
      }));

      // Load the newly created world
      useWorldStore.getState().loadWorld(newSlot.data);
    },

    setActiveSlot: (slotId: string) => {
      // If the requested slot is already active, do nothing
      const currentId = get().activeSlotId;
      if (slotId === currentId) return;

      // Find the target slot; abort if it doesn't exist
      const targetSlot = get().slots.find((s) => s.slotId === slotId);
      if (!targetSlot) return;

      // Save currently active slot's data before switching
      if (currentId) {
        const snapshot = syncCurrentWorldToSlot();
        set(state => ({
          slots: state.slots.map(s =>
            s.slotId === currentId ? { ...s, data: snapshot.data, updatedAt: snapshot.updatedAt } : s
          ),
        }));
      }

      // Activate the new slot and load its world data
      set({ activeSlotId: slotId });
      useWorldStore.getState().loadWorld(targetSlot.data);
    },
  };
});
