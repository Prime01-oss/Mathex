// File: src/renderer/components/ArchiveModal/ContextMenu.tsx

import React, { useEffect, useRef } from 'react';
import './ContextMenu.scss';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRestore: () => void;
  onDelete: () => void;
  selectionCount: number;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onRestore,
  onDelete,
  selectionCount,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // --- THIS IS THE NEW LOGIC ---
  // This effect adds a listener to the whole document. If a click happens
  // outside of the context menu's own area, it calls the onClose function.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Add the listener when the menu is opened
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup the listener when the menu is closed
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleRestore = () => {
    onRestore();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const restoreText = selectionCount > 1 ? `Restore ${selectionCount} Items` : 'Restore';
  const deleteText = selectionCount > 1 ? `Delete ${selectionCount} Items` : 'Delete Permanently';

  return (
    <div
      ref={menuRef} // Assign the ref to the menu's main div
      className="archive-context-menu"
      style={{ top: y, left: x }}
    >
      <button onClick={handleRestore} className="context-menu-button">
        {restoreText}
      </button>
      <button onClick={handleDelete} className="context-menu-button delete">
        {deleteText}
      </button>
    </div>
  );
};

export default ContextMenu;