import React from 'react';
import './ContextMenu.scss';

type ContextMenuProps = {
  x: number;
  y: number;
  onArchive: () => void;
  onClose: () => void;
};

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onArchive, onClose }) => {
  return (
    <div className='context-menu-overlay' onClick={onClose}>
        <div className='context-menu' style={{ top: y, left: x }}>
            <ul>
                <li onClick={onArchive}>Archive</li>
            </ul>
        </div>
    </div>
  );
};

export default ContextMenu;