import { create } from 'zustand';
import type { GameMode, EditorModeState } from '../types/editor';

/**
 * Store khusus antarmuka editor dan status mode permainan.
 * Dipisahkan sepenuhnya dari data dunia (useWorldStore) untuk mencegah
 * status UI sementara tersimpan ke dalam dokumen dunia.
 */
export const useEditorStore = create<EditorModeState>((set) => ({
  mode: 'GAMEPLAY', // Mode default saat aplikasi pertama kali dimuat

  setMode: (mode: GameMode) => set({ mode }),

  toggleMode: () =>
    set((state) => ({
      mode: state.mode === 'GAMEPLAY' ? 'BUILD' : 'GAMEPLAY',
    })),
}));
