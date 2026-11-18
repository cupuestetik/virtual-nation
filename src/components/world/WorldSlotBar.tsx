import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useWorldSlotsStore } from '../../stores/useWorldSlotsStore';
import './WorldSlotBar.css'; // optional: you can create CSS later if needed

/**
 * UI bar placed in the top header for creating new worlds and selecting
 * an existing world slot. It uses the existing `useWorldSlotsStore` API:
 *   - `addSlot(name)` creates a fresh empty world and makes it active.
 *   - `setActiveSlot(slotId)` switches to the given slot.
 * The component is deliberately lightweight and does not touch any
 * gameplay or editor state.
 */
export default function WorldSlotBar() {
  // modal open state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  // read slots and active slot id from the store (reactive)
  const slots = useWorldSlotsStore((state) => state.slots);
  const activeSlotId = useWorldSlotsStore((state) => state.activeSlotId);
  const setActiveSlot = useWorldSlotsStore((state) => state.setActiveSlot);
  const addSlot = useWorldSlotsStore((state) => state.addSlot);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id !== activeSlotId) {
      setActiveSlot(id);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setNewName('');
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      // ignore empty/whitespace names – could add UI feedback later
      return;
    }
    addSlot(trimmed);
    closeModal();
  };

  return (
    <div className="world-slot-bar">
      {/* New World button */}
      <button type="button" className="new-world-btn" onClick={openModal}>
        + New World
      </button>

      {/* Slot selector */}
      <select
        className="world-slot-select"
        value={activeSlotId ?? ''}
        onChange={handleSelectChange}
      >
        {slots.map((slot) => (
          <option key={slot.slotId} value={slot.slotId}>
            {slot.name}
          </option>
        ))}
      </select>

      {/* Simple modal – rendered conditionally */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New World</h3>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="World name"
                value={newName}
                onChange={handleNameChange}
                className="modal-input"
                autoFocus
              />
              <div className="modal-actions">
                <button type="submit" className="modal-create">
                  Create
                </button>
                <button type="button" className="modal-cancel" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
