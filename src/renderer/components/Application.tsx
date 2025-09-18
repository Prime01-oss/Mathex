import React from 'react';
import './Application.scss';
import { CommandBar } from './CommandBar/CommandBar';
import FilesSidebar from './FilesSidebar/FilesSidebar';
import { GeneralContextProvider, useGeneralContext } from './GeneralContext';
import Header from './Header/Header';
import MathSidebar from './MathSidebar/MathSidebar';
import Page from './Page/Page';
import ChalkBoard from './ChalkBoard/ChalkBoard';
import ShortcutsModal from './common/Modals/ShortcutsModal';

const AppContent = () => {
  // Get the state for both the chalkboard and the shortcuts modal
  const { isChalkBoardOpen, isShortcutsModalOpen } = useGeneralContext();

  return (
    <div id='main-app'>
      {/* --- THIS IS THE KEY CHANGE --- */}
      {/* Only show the Header if the ChalkBoard is NOT open */}
      {!isChalkBoardOpen && <Header />}

      <div className='workspace'>
        <FilesSidebar />
        <CommandBar />
        <Page />
        <MathSidebar />
      </div>

      {/* Conditionally render the overlays */}
      {isChalkBoardOpen && <ChalkBoard />}
      {isShortcutsModalOpen && <ShortcutsModal />}
    </div>
  );
};

const Application = () => {
  return (
    <GeneralContextProvider>
      <AppContent />
    </GeneralContextProvider>
  );
};

export default Application;