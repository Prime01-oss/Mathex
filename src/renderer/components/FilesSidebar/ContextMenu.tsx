import React from 'react';
import './ContextMenu.scss';

type ContextMenuProps = {
  x: number;
  y: number;
  onAddFile: () => void;      // Add this
  onAddFolder: () => void;    // Add this
  onArchive: () => void;
  onClose: () => void;
};

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onAddFile, onAddFolder, onArchive, onClose }) => {
  return (
    <div className='context-menu-overlay' onClick={onClose}>
      <div className='context-menu' style={{ top: y, left: x }}>
        <ul>
          <li onClick={onAddFile}>New File</li>      {/* Add this */}
          <li onClick={onAddFolder}>New Folder</li>  {/* Add this */}
          <li onClick={onArchive}>Archive</li>
        </ul>
      </div>
    </div>
  );
};

export default ContextMenu;