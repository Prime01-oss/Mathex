import React from 'react';
import './Application.scss';
import { CommandBar } from './CommandBar/CommandBar';
import FilesSidebar from './FilesSidebar/FilesSidebar';
import { GeneralContextProvider, useGeneralContext } from './GeneralContext';
import Header from './Header/Header';
import Page from './Page/Page';
import ChalkBoard from './ChalkBoard/ChalkBoard';
import ShortcutsModal from './common/Modals/ShortcutsModal';
// --- 1. IMPORT THE NEW POPUP CALCULATOR ---
import PopupCalculator from './PopupCalculator/PopupCalculator';
import ArchiveModal from './ArchiveModal/ArchiveModal'; // ADD THIS LINE

const AppContent = () => {
  // --- 2. GET THE NEW STATE FROM THE CONTEXT ---
  const { isChalkBoardOpen, isShortcutsModalOpen, isCalculatorOpen, isArchiveModalOpen } = useGeneralContext(); // ADD isArchiveModalOpen

  return (
    <div id='main-app'>
      {!isChalkBoardOpen && <Header />}

      <div className='workspace'>
        <FilesSidebar />
        <CommandBar />
        <Page />
        {/* The old MathSidebar component is now completely removed from the layout */}
      </div>

      {/* Conditionally render all overlays */}
      {isChalkBoardOpen && <ChalkBoard />}
      {isShortcutsModalOpen && <ShortcutsModal />}
      {/* --- 3. RENDER THE CALCULATOR WHEN ITS STATE IS TRUE --- */}
      {isCalculatorOpen && <PopupCalculator />}
      {isArchiveModalOpen && <ArchiveModal />} {/* ADD THIS LINE */}
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