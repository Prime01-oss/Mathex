import React, { useState, useMemo, useTransition } from 'react';
import './ShortcutsModal.scss';
import { useGeneralContext } from '@components/GeneralContext';
import { useTranslation } from 'react-i18next';
import Shortcut from '../Shortcut';
import ML_KEYBINDINGS from '@common/keybindings';
import ML_SHORTCUTS from '@common/shortcuts';
import MathView from 'react-math-view';
import { Keybinding, InlineShortcutDefinition } from 'mathlive';

// --- Type Definitions ---
type ShortcutCategory = {
  title: string;
  items: Keybinding[] | Record<string, InlineShortcutDefinition>;
};
type Categories = {
  [key: string]: ShortcutCategory;
};

// --- Data ---
const shortcutCategories: Categories = {
  general: {
    title: 'General',
    items: ML_KEYBINDINGS.filter(b => !b.ifMode),
  },
  mathEditor: {
    title: 'Math Editor',
    items: ML_SHORTCUTS,
  },
  navigation: {
    title: 'Navigation',
    items: ML_KEYBINDINGS.filter(b => b.command.toString().includes('move') || b.command.toString().includes('extend')),
  },
  editing: {
    title: 'Editing',
    items: ML_KEYBINDINGS.filter(b => b.command.toString().includes('delete') || b.command.toString().includes('undo') || b.command.toString().includes('redo')),
  },
};

const ShortcutsModal: React.FC = () => {
  const { t } = useTranslation();
  const { setIsShortcutsModalOpen } = useGeneralContext();
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    setIsShortcutsModalOpen(false);
  };
  
  const filteredItems = useMemo(() => {
    if (!searchTerm) return shortcutCategories[activeCategory].items;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const currentItems = shortcutCategories[activeCategory].items;
    if (activeCategory === 'mathEditor') {
      return Object.entries(currentItems as Record<string, InlineShortcutDefinition>).reduce((acc, [shortcut, definition]) => {
        const latexValue = typeof definition === 'string' ? definition : definition.value;
        if (shortcut.toLowerCase().includes(lowerCaseSearchTerm) || latexValue.toLowerCase().includes(lowerCaseSearchTerm)) {
          acc[shortcut] = definition;
        }
        return acc;
      }, {} as Record<string, InlineShortcutDefinition>);
    }
    return (currentItems as Keybinding[]).filter(binding =>
      binding.command.toString().toLowerCase().includes(lowerCaseSearchTerm) ||
      binding.key.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, activeCategory]);

  const handleCategoryClick = (key: string) => {
    startTransition(() => {
      setActiveCategory(key);
    });
  };

  const renderShortcutItem = (key: string, command: string, shortcutKeys: string[]): JSX.Element => ( <div className="shortcut-item" key={key}><span className="shortcut-description">{command}</span><Shortcut shortcut={shortcutKeys} /></div> );
  const renderMathShortcutItem = (shortcut: string, definition: InlineShortcutDefinition): JSX.Element | null => {
    const latexValue = typeof definition === 'string' ? definition : definition.value;
    if (latexValue.includes('begin{')) return null;
    return ( <div className="shortcut-item" key={shortcut}><span className="shortcut-description">{latexValue.replace(/\\/g, '')}</span><div className="shortcut-keys-math"><kbd className='kbc-button'>{shortcut}</kbd><div className="math-symbol"><MathView value={latexValue} /></div></div></div> );
  };

  const isFilterResultEmpty = (Array.isArray(filteredItems) && filteredItems.length === 0) || (!Array.isArray(filteredItems) && Object.keys(filteredItems).length === 0);

  return (
    <div className='modal-overlay shortcuts-pro-view'>
      <div className='shortcuts-modal'>
        <div className='modal-header'>
          <h2>{t('Keyboard Shortcuts')}</h2>
          <div className="shortcuts-search-bar"><i className="fi fi-rr-search"></i><input type="text" placeholder={t('Search shortcuts...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <button onClick={handleClose} className='close-button'>&times;</button>
        </div>
        <div className='modal-body'>
          <main className='shortcuts-content'>
            <div className='shortcut-toggle-bar'>
              {Object.entries(shortcutCategories).map(([key, { title }]) => (
                <button
                  key={key}
                  className={activeCategory === key ? 'active' : ''}
                  onClick={() => handleCategoryClick(key)}
                >
                  {t(title)}
                </button>
              ))}
            </div>
            <div className={`shortcuts-list ${isPending ? 'loading' : ''}`}>
              {isFilterResultEmpty ? (
                <div className="no-results-message"><p>No shortcuts found for "{searchTerm}"</p></div>
              ) : (
                <>
                  {activeCategory === 'mathEditor'
                    ? Object.entries(filteredItems as Record<string, InlineShortcutDefinition>).map(([shortcut, def]) => renderMathShortcutItem(shortcut, def))
                    : (filteredItems as Keybinding[]).map((binding: Keybinding, index: number) => renderShortcutItem(`${activeCategory}-${index}`, binding.command.toString(), [binding.key]))
                  }
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;