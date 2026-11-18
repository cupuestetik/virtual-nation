import { create } from 'zustand';
import type { GameMode, EditorModeState } from '../types/editor';

/**
 * Store for editor UI state, separate from world data.
 */
export const useEditorStore = create<EditorModeState>((set) => ({
  // Mode management
  mode: 'GAMEPLAY',
  setMode: (mode: GameMode) => set({ mode }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'GAMEPLAY' ? 'BUILD' : 'GAMEPLAY' })),

  // Build editor specifics
  selectedAssetId: null,
  snapEnabled: false,
  ghostPosition: null,
  setSelectedAsset: (assetId: string | null) => set({ selectedAssetId: assetId }),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  setGhostPosition: (pos: [number, number, number] | null) => set({ ghostPosition: pos }),
  clearEditorState: () => set({ selectedAssetId: null, ghostPosition: null, snapEnabled: false }),
}));