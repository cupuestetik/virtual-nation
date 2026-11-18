export type GameMode = 'GAMEPLAY' | 'BUILD';

export interface EditorModeState {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  toggleMode: () => void;
}
