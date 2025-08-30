import React, { useState, useEffect } from 'react';
import { KBarProvider } from 'kbar';
import { useTranslation } from 'react-i18next';
import { GeneralContextProvider } from './GeneralContext';
import FilesSidebar from './FilesSidebar/FilesSidebar';
import MathSidebar from './MathSidebar/MathSidebar';
import CommandBar from './CommandBar/CommandBar';
import Header from './Header/Header';
import Page from './Page/Page';
import SettingsModal from './common/Modals/SettingsModal'; // 1. Import our new modal
import './Theme.scss';
import './Fonts.css';
import './Application.scss';

const Application = () => {
  const { t, i18n } = useTranslation();
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false); // 2. Add state for our modal

  useEffect(() => {
    document.dir = i18n.dir();
  }, [i18n, i18n.language]);

  return (
    <KBarProvider>
      <GeneralContextProvider>
        <div className='app-container'>
          {/* 3. Pass a function to the command bar to open the modal */}
          <CommandBar openSettingsModal={() => setSettingsModalOpen(true)} />
          <FilesSidebar />
          <div className='main-content'>
            <Header />
            <Page />
          </div>
          <MathSidebar />
        </div>
        {/* 4. Render the modal itself */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
        />
      </GeneralContextProvider>
    </KBarProvider>
  );
};

export default Application;

