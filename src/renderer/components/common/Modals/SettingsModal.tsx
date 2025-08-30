import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon, TrashIcon, PlusIcon } from '../../Icons';
import './SettingsModal.scss';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});
  const [newShortcut, setNewShortcut] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      window.api.getCustomShortcuts().then((sc: Record<string, string>) => setShortcuts(sc || {}));
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleAddShortcut = () => {
    if (newShortcut && newValue && !shortcuts[newShortcut]) {
      const updatedShortcuts = { ...shortcuts, [newShortcut]: newValue };
      setShortcuts(updatedShortcuts);
      window.api.setCustomShortcuts(updatedShortcuts);
      setNewShortcut('');
      setNewValue('');
    }
  };

  const handleDeleteShortcut = (shortcut: string) => {
    const { [shortcut]: _, ...rest } = shortcuts;
    setShortcuts(rest);
    window.api.setCustomShortcuts(rest);
  };

  return (
    <div className="settings-modal-container" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('modals.settings.title', 'Customize Shortcuts')}</h2>
          <button onClick={onClose} className="close-button">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-content">
          <div className="shortcut-list">
            {Object.keys(shortcuts).length > 0 ? (
              Object.entries(shortcuts).map(([shortcut, value]) => (
                <div key={shortcut} className="shortcut-item">
                  <span className="shortcut-key">{shortcut}</span>
                  <span className="shortcut-value">{value}</span>
                  <button onClick={() => handleDeleteShortcut(shortcut)} className="delete-shortcut-button">
                    <TrashIcon />
                  </button>
                </div>
              ))
            ) : (
              <p className="no-shortcuts">{t('modals.settings.no_shortcuts', 'No custom shortcuts yet.')}</p>
            )}
          </div>
          <div className="add-shortcut-form">
            <h3>{t('modals.settings.add_new', 'Add New Shortcut')}</h3>
            <div className="form-inputs">
              <input
                type="text"
                placeholder={t('modals.settings.shortcut_placeholder', 'e.g. sqr')}
                value={newShortcut}
                onChange={(e) => setNewShortcut(e.target.value)}
              />
              <input
                type="text"
                placeholder={t('modals.settings.value_placeholder', 'e.g. ^2')}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <button onClick={handleAddShortcut} className="add-button">
                <PlusIcon /> {t('modals.settings.add_button', 'Add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

