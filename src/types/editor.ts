export type GameMode = 'GAMEPLAY' | 'BUILD';

export interface EditorModeState {
  // Mode management
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  toggleMode: () => void;

  // Build editor specifics
  selectedAssetId: string | null;
  snapEnabled: boolean;
  ghostPosition: [number, number, number] | null;
  setSelectedAsset: (assetId: string | null) => void;
  toggleSnap: () => void;
  setGhostPosition: (pos: [number, number, number] | null) => void;
  clearEditorState: () => void;
}
