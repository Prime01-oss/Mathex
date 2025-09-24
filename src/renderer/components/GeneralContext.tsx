import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { newWidgetRequest } from '@renderer/common/types';
import i18n from '@common/i18n';
import { Action, KBarProvider } from 'kbar';

// --- DEFINE ACTIONS OUTSIDE THE COMPONENT ---
const staticActions: Action[] = [
  { id: 'preferences', name: 'Preferences' },
  { id: 'language', name: 'Language', parent: 'preferences' },
  { id: 'theme', name: 'Theme', parent: 'preferences' },
  { id: 'color', name: 'Color', parent: 'preferences' },
  { id: 'english', name: 'English', parent: 'language' },
  { id: 'hindi', name: 'Hindi', parent: 'language' },
  { id: 'blue', name: 'Blue', parent: 'color' },
  { id: 'pink', name: 'Pink', parent: 'color' },
  { id: 'yellow', name: 'Yellow', parent: 'color' },
  { id: 'purple', name: 'Purple', parent: 'color' },
  { id: 'red', name: 'Red', parent: 'color' },
  { id: 'green', name: 'Green', parent: 'color' },
  { id: 'light', name: 'Light', parent: 'theme' },
  { id: 'dark', name: 'Dark', parent: 'theme' },
];

const GeneralContext = createContext(null);

function GeneralContextProvider({ children }: PropsWithChildren) {
  // --- All State variables ---
  const getDefaultLang = () => {
    return localStorage.getItem('language') || 'en';
  };
  const [saveRequest, setSaveRequest] = useState({ cmd: '' });
  const [clearPageRequest, setClearPageRequest] = useState({ cmd: '' });
  const [newWidgetRequest, setNewWidgetRequest] = useState<newWidgetRequest>();
  const [selectedFile, setSelectedFile] = useState<string>();
  const [currentFileTags, setCurrentFileTags] = useState<string[]>([]);
  const [isFilesSidebarOpen, setIsFilesSidebarOpen] = useState(false);
  const [isMathSidebarOpen, setIsMathSidebarOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isChalkBoardOpen, setIsChalkBoardOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false); // ADD THIS LINE
  const [isRtl, setIsRtl] = useState(true);
  const [language, setLanguage] = useState(getDefaultLang());
  const [currentOS, setCurrentOS] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // <-- ADDED: Search query state

  // ✅ 1. INITIALIZE STATE FROM LOCALSTORAGE
  const [darkTheme, setDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('dark-mode');
    return savedTheme ? savedTheme === '1' : true; // Default to dark
  });
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('color') || 'blue'; // Default to blue
  });

  // --- All Functions ---
  // ✅ 2. UPDATE SETTER FUNCTIONS TO SYNC STATE
  const setColor = (name: string, hue: number) => {
    localStorage.setItem('color', name);
    document.documentElement.style.setProperty('--theme-hue', hue.toString());
    setColorTheme(name); // Sync React state
  };

  const setLang = (language: string) => {
    i18n.changeLanguage(language);
    setLanguage(language);
    localStorage.setItem('language', language);
    if (isRtlLang(language)) {
      document.querySelector('#main-app').classList.add('rtl');
    } else {
      document.querySelector('#main-app').classList.remove('rtl');
    }
  };

  const isRtlLang = (language: string) => {
    const rtlLanguages = ['he', 'ar', 'ur'];
    return rtlLanguages.includes(language);
  };

  const setTheme = (theme: number) => {
    localStorage.setItem('dark-mode', theme.toString());
    const isDark = theme === 1;
    setDarkTheme(isDark); // Sync React state
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // --- Create dynamic actions ---
  const dynamicActions = staticActions.map(action => {
    const translatedAction = { ...action, name: i18n.t(action.name) };
    switch (action.id) {
      case 'english': return { ...translatedAction, perform: () => setLang('en') };
      case 'hindi': return { ...translatedAction, perform: () => setLang('hi') };
      case 'blue': return { ...translatedAction, perform: () => setColor('blue', 210) };
      case 'pink': return { ...translatedAction, perform: () => setColor('pink', 300) };
      case 'yellow': return { ...translatedAction, perform: () => setColor('yellow', 35) };
      case 'purple': return { ...translatedAction, perform: () => setColor('purple', 250) };
      case 'red': return { ...translatedAction, perform: () => setColor('red', 0) };
      case 'green': return { ...translatedAction, perform: () => setColor('green', 140) };
      case 'light': return { ...translatedAction, perform: () => setTheme(0) };
      case 'dark': return { ...translatedAction, perform: () => setTheme(1) };
      default: return translatedAction;
    }
  });

  // --- All useEffect hooks ---
  // ✅ 3. ADD USEEFFECT TO APPLY THEMES ON INITIAL LOAD
  useEffect(() => {
    // Apply dark mode from state on first load
    if (darkTheme) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Helper map to get hue from color name
    const colorMap: { [key: string]: number } = {
      blue: 210, pink: 300, yellow: 35, purple: 250, red: 0, green: 140,
    };

    // Apply color theme from state on first load
    const hue = colorMap[colorTheme];
    if (hue !== undefined) {
      document.documentElement.style.setProperty('--theme-hue', hue.toString());
    }
  }, []); // Empty array ensures this runs only once on mount

  useEffect(() => {
    window.api.getOS();
    window.api.receive('gotOS', (data: string) => {
      setCurrentOS(data);
    });
  }, []);

  return (
    <GeneralContext.Provider
      value={{
        newWidgetRequest, setNewWidgetRequest,
        clearPageRequest, setClearPageRequest,
        selectedFile, setSelectedFile,
        saveRequest, setSaveRequest,
        currentFileTags, setCurrentFileTags,
        isMathSidebarOpen, setIsMathSidebarOpen,
        isFilesSidebarOpen, setIsFilesSidebarOpen,
        isRtl, setIsRtl,
        language, setLang,
        darkTheme, setTheme,
        colorTheme, setColor,
        actions: dynamicActions,
        currentOS,
        isShortcutsModalOpen, setIsShortcutsModalOpen,
        isChalkBoardOpen, setIsChalkBoardOpen,
        isCalculatorOpen, setIsCalculatorOpen,
        isArchiveModalOpen, setIsArchiveModalOpen, // ADD THIS LINE
        searchQuery, setSearchQuery, // <-- ADDED: Provide search state to context
      }}
    >
      <KBarProvider
        actions={dynamicActions}
        options={{ toggleShortcut: '$mod+Shift+p' }}
      >
        {children}
      </KBarProvider>
    </GeneralContext.Provider>
  );
}

function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (context === undefined) {
    throw new Error('useGeneralContext must be used within a GeneralContextProvider');
  }
  return context;
}

export { GeneralContextProvider, useGeneralContext };