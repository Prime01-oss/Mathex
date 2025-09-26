// File: src/renderer/components/ArchiveModal/ContextMenu.tsx

import React from 'react'; // Corrected this line
import './ContextMenu.scss';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onRestore,
  onDelete,
}) => {
  const handleRestore = () => {
    onRestore();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div
      className="archive-context-menu"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing it immediately
    >
      <button onClick={handleRestore} className="context-menu-button">
        Restore
      </button>
      <button onClick={handleDelete} className="context-menu-button delete">
        Delete Permanently
      </button>
    </div>
  );
};

export default ContextMenu;