import React, { useState } from 'react';
import './ShortcutsModal.scss';
import { useGeneralContext } from '@components/GeneralContext';
import { useTranslation } from 'react-i18next';
import Shortcut from '../Shortcut';
import ML_KEYBINDINGS from '@common/keybindings';
import ML_SHORTCUTS from '@common/shortcuts';
import MathView from 'react-math-view';
import { Keybinding, InlineShortcutDefinition } from 'mathlive'; // ADD THIS IMPORT

// --- NEW: Define types for our categories ---
type ShortcutCategory = {
  title: string;
  items: Keybinding[] | Record<string, InlineShortcutDefinition>;
};

type Categories = {
  [key: string]: ShortcutCategory;
};
// --- END NEW ---

// --- NEW: Apply the type to our object ---
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
// --- END NEW ---

const ShortcutsModal = () => {
  const { t } = useTranslation();
  const { setIsShortcutsModalOpen } = useGeneralContext();
  const [activeCategory, setActiveCategory] = useState('general');

  const handleClose = () => {
    setIsShortcutsModalOpen(false);
  };

  const renderShortcutItem = (key: string, command: any, shortcutKeys: string[]) => (
    <div className="shortcut-item" key={key}>
      <span className="shortcut-description">{command}</span>
      <Shortcut shortcut={shortcutKeys} />
    </div>
  );

  const renderMathShortcutItem = (shortcut: string, definition: any) => {
    const latexValue = typeof definition === 'string' ? definition : definition.value;
    if (latexValue.includes('begin{')) return null;
    return (
      <div className="shortcut-item" key={shortcut}>
        <span className="shortcut-description">{latexValue.replace(/\\/g, '')}</span>
        <div className="shortcut-keys-math">
          <kbd className='kbc-button'>{shortcut}</kbd>
          <div className="math-symbol">
            <MathView value={latexValue} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='modal-overlay shortcuts-pro-view'>
      <div className='shortcuts-modal'>
        <div className='modal-header'>
          <h2>{t('Keyboard Shortcuts')}</h2>
          <button onClick={handleClose} className='close-button'>
            &times;
          </button>
        </div>
        <div className='modal-body'>
          <aside className='shortcuts-sidebar'>
            <ul>
              {Object.entries(shortcutCategories).map(([key, { title }]) => (
                <li key={key}>
                  <button
                    className={activeCategory === key ? 'active' : ''}
                    onClick={() => setActiveCategory(key)}
                  >
                    {t(title)}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <main className='shortcuts-content'>
            {activeCategory === 'mathEditor'
              ? Object.entries(shortcutCategories.mathEditor.items).map(([shortcut, def]) =>
                  renderMathShortcutItem(shortcut, def)
                )
              // --- FIX: Add explicit types to the map function ---
              : (shortcutCategories[activeCategory].items as Keybinding[]).map((binding: Keybinding, index: number) =>
                  renderShortcutItem(`${activeCategory}-${index}`, binding.command.toString(), [binding.key])
                )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;