import React, { useEffect, useState } from 'react';
import './ArchiveModal.scss';
import ArchiveFileSystem from './ArchiveFileSystem';
import { useGeneralContext } from '../GeneralContext';

const ArchiveModal: React.FC = () => {
  const { isArchiveModalOpen, setIsArchiveModalOpen } = useGeneralContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isArchiveModalOpen) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow for the closing animation
      const timer = setTimeout(() => setIsVisible(false), 300); // Must match transition duration
      return () => clearTimeout(timer);
    }
  }, [isArchiveModalOpen]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`archive-modal-overlay ${isArchiveModalOpen ? 'open' : ''}`}
      onClick={() => setIsArchiveModalOpen(false)}
    >
      <div
        className='archive-modal-content'
        onClick={(e) => e.stopPropagation()}
      >
        <ArchiveFileSystem />
      </div>
    </div>
  );
};

export default ArchiveModal;