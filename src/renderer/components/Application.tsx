import React from 'react';
import '../../../node_modules/react-grid-layout/css/styles.css';
import '../../../node_modules/react-resizable/css/styles.css';
import './Application.scss';
import { CommandBar } from './CommandBar/CommandBar';
import FilesSidebar from './FilesSidebar/FilesSidebar';
import { GeneralContextProvider, useGeneralContext } from './GeneralContext';
import Header from './Header/Header';
import MathSidebar from './MathSidebar/MathSidebar';
import Page from './Page/Page';
import ChalkBoard from './ChalkBoard/ChalkBoard';
import ShortcutsModal from './common/Modals/ShortcutsModal';

// This new inner component can access the context
const AppContent = () => {
  // --- START: UPDATE THIS LINE ---
  const { isShortcutsModalOpen, isChalkBoardOpen } = useGeneralContext();
  // --- END: UPDATE THIS LINE ---

  return (
    <div id='main-app'>
      <Header />
      <div className='workspace'>
        <FilesSidebar />
        <CommandBar />
        <Page />
        <MathSidebar />
      </div>
      
      {/* --- START: ADD THIS LINE TO RENDER THE CHALKBOARD --- */}
      {isChalkBoardOpen && <ChalkBoard />}
      {/* --- END: ADD THIS LINE --- */}

      {/* Conditionally render the modal here */}
      {isShortcutsModalOpen && <ShortcutsModal />}
    </div>
  );
};

// The main Application component now just provides the context
const Application = () => {
  return (
    <GeneralContextProvider>
      <AppContent />
    </GeneralContextProvider>
  );
};

export default Application;