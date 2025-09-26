// File: src/renderer/components/ArchiveModal/ContextMenu.tsx

import React from 'react';
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
      className="archive-context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing it immediately
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