import { useEditorStore } from '../../stores/useEditorStore';
import './SnapToggle.css'; // optional styling, ensure file exists or ignore

/**
 * Simple button to toggle snap‑to‑grid in Build Mode.
 */
export function SnapToggle() {
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);

  return (
    <button type="button" className="snap-toggle" onClick={toggleSnap}>
      Snap: {snapEnabled ? 'ON' : 'OFF'}
    </button>
  );
}
