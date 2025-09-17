import React, { useEffect, useState } from 'react';
import '../Application.scss';
import './Page.scss';
import ToolsPanel from './ToolsPanel/ToolsPanel';
import './ToolsPanel/ToolsPanel.scss';
import { useGeneralContext } from '@components/GeneralContext';
import PagePlaceholder from './PagePlaceholder';
import PageGrid from './Grid/Grid';

const gridStyle = {
  width: '100%',
  height: '100%',
  backgroundImage:
    'radial-gradient(circle at 50% 100%, var(--tool-hover-bgcolor) 1px, transparent 1px)',
  backgroundSize: '50px 50px',
  color: 'white',
};

const Page = () => {
  const { selectedFile, setSaveRequest } = useGeneralContext();
  const [currentFilePath, setCurrentFilePath] = useState('');

  useEffect(() => {
    setCurrentFilePath(selectedFile);
  }, [selectedFile]);

  // --- START: FINAL CORRECTED KEYBOARD SHORTCUT LOGIC ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Logic for Ctrl+S (Save)
      if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setSaveRequest({ cmd: 'save' });
      }

      // Smart shortcut logic for Ctrl+O
      if (event.key === 'o' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        
        if (selectedFile) {
          // If a folder is open, send a 'new-file' request
          window.api.send('new-file-request');
        } else {
          // If no folder is open, send an 'open-folder' request
          // This is the correct way to trigger the open folder dialog
          window.api.send('open-folder'); 
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFile, setSaveRequest]); 
  // --- END: FINAL CORRECTED KEYBOARD SHORTCUT LOGIC ---

  return (
    <div className='page' style={gridStyle}>
      {currentFilePath ? (
        <div className='page-grid'>
          <PageGrid />
          <ToolsPanel />
        </div>
      ) : (
        <PagePlaceholder />
      )}
    </div>
  );
};

export default Page;