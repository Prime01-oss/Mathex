import React from 'react';
import './ArchiveActionsPopup.scss';

interface ArchiveActionsPopupProps {
  selectionCount: number;
  onSelectAll: () => void;
  onArchive: () => void;
  onCancel: () => void;
}

export const ArchiveActionsPopup: React.FC<ArchiveActionsPopupProps> = ({
  selectionCount,
  onSelectAll,
  onArchive,
  onCancel,
}) => {
  return (
    <div className="archive-actions-popup">
      <div className="popup-header">
        <span>{selectionCount} items selected</span>
        <button onClick={onCancel} className="cancel-button">&times;</button>
      </div>
      <div className="popup-actions">
        <button onClick={onSelectAll} className="popup-button">
          Select All
        </button>
        <button
          onClick={onArchive}
          className="popup-button archive"
          disabled={selectionCount === 0}
        >
          Archive
        </button>
      </div>
    </div>
  );
};