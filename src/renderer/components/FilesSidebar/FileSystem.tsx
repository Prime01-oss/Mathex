/* eslint-disable import/named */
import ErrorModal from '@components/common/Modals/ErrorModal';
import { useGeneralContext } from '@components/GeneralContext';
import React, { SetStateAction, useEffect, useState } from 'react';
import {
  Tree,
  ControlledTreeEnvironment,
  DraggingPositionItem,
  TreeItem,
  DraggingPositionBetweenItems,
  TreeItemIndex,
} from 'react-complex-tree';
import './FileSystem.scss';
import {
  draggedToTheSameParent,
  updateItemsPosition,
  changeItemPath,
  generateStateWithNewFolder,
  newFolderName,
  generateStateWithNewFile,
  newFileName,
  itemExistsInParent,
  getFileNameFromPath,
  deleteItemFromItsPreviousParent,
  getParent,
} from './FileSystemHelpers';
import { MathTreeItem, TreeItemsObj } from './types';
import { useTranslation } from 'react-i18next';
import ContextMenu from './ContextMenu';
import Fuse from 'fuse.js';
// ✅ 1. We now import the new, small popup
import { ArchiveActionsPopup } from './ArchiveActionsPopup';

type receivedProps = { filesPath: string; root: SetStateAction<TreeItemsObj> };
declare global {
  interface Window {
    api: any;
  }
}
function FileSystem() {
  const { t } = useTranslation();
  const { setSelectedFile, searchQuery } = useGeneralContext();

  const [items, setItems] = useState<TreeItemsObj>({
    root: { index: 'root', data: '', path: '' },
  });

  const [filteredItems, setFilteredItems] = useState<TreeItemsObj>(items);
  const [errorModalContent, setErrorModalContent] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItemsForArchive, setSelectedItemsForArchive] = useState<TreeItemIndex[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<TreeItemIndex>('root');
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>(-1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: TreeItemIndex } | null>(null);
  const [isSelectionModeActive, setSelectionModeActive] = useState(false);

  useEffect(() => {
    window.api.getNotebooks();
  }, []);

  useEffect(() => {
    const removeListener = window.api.receive('gotNotebooks', (data: receivedProps) => {
      setItems(data.root);
    });
    return () => removeListener();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredItems(items);
      return;
    }
    const allFileItems = Object.values(items).filter(item => item.index !== 'root');
    const fuse = new Fuse(allFileItems, { keys: ['data'], threshold: 0.4 });
    const searchResults = fuse.search(searchQuery).map(result => result.item);
    const resultTree: TreeItemsObj = {
      root: { ...items.root, children: searchResults.map(item => item.index) },
    };
    searchResults.forEach(item => { resultTree[item.index] = item; });
    setFilteredItems(resultTree);
  }, [searchQuery, items]);

  const handleArchive = async (pathsToArchive: string[]) => {
    if (pathsToArchive.length > 0) {
      await window.api.archiveNotebooks(pathsToArchive);
      window.api.getNotebooks();
    }
    setSelectionModeActive(false);
    setSelectedItemsForArchive([]);
  };
  
  const toggleItemSelection = (itemId: TreeItemIndex) => {
    setSelectedItemsForArchive(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const handleArchiveButtonClick = () => {
    setSelectionModeActive(!isSelectionModeActive);
    if (isSelectionModeActive) {
      setSelectedItemsForArchive([]);
    }
  };

  // ✅ 2. Logic for the "Select All" button in the popup
  const handleSelectAllForArchive = () => {
    const allIds = Object.keys(items).filter(id => id !== 'root');
    setSelectedItemsForArchive(allIds);
  };

  // ✅ 3. Logic for the "Archive" button in the popup
  const handleConfirmArchive = () => {
    const paths = selectedItemsForArchive.map(id => items[id]?.path).filter(Boolean);
    handleArchive(paths);
  };

  const addFolder = () => {
    if (itemExistsInParent(newFolderName, selectedDirectory, items, true)) {
      setErrorModalContent(t('A folder with that name already exists.'));
      setErrorModalOpen(true);
      return;
    }
    setItems((prev) => generateStateWithNewFolder(prev, selectedDirectory));
  };

  const addFile = () => {
    if (itemExistsInParent(newFileName, selectedDirectory, items, false)) {
      setErrorModalContent(t('A file with that name already exists.'));
      setErrorModalOpen(true);
      return;
    }
    setItems((prev) => generateStateWithNewFile(prev, selectedDirectory));
  };

  const handleOnDrop = (draggedItems: TreeItem[], target: DraggingPositionItem | DraggingPositionBetweenItems) => { /* ... */ };
  const handleRenameItem = (item: MathTreeItem, name: string): void => { /* ... */ };
  const handleClickedOutsideItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { /* ... */ };
  const handleDeleteItem = (event: React.KeyboardEvent<HTMLDivElement>) => { /* ... */ };
  const handleContextMenu = (e: React.MouseEvent) => { /* ... */ };

  return (
    <div className='file-system' onKeyUp={handleDeleteItem}>
      <div className='file-system-header'>
        <span
          data-tooltip={t('Notebooks Tooltip')}
          className='file-system-header-title'
          onDoubleClick={() => window.api.openFiles()}
        >
          {t('My Notebooks')}
        </span>
        <div className='file-system-header-buttons'>
          <button onClick={handleArchiveButtonClick} data-tooltip={t('Select Items to Archive')}>
            <i className='fi fi-rr-archive' />
          </button>
          <div className="button-group">
            <button onClick={addFolder} data-tooltip={t('New Folder')}>
              <i className='fi fi-rr-add-folder' />
            </button>
            <button onClick={addFile} data-tooltip={t('New File')}>
              <i className='fi-rr-add-document' />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ 4. Conditionally render the new popup when in selection mode */}
      {isSelectionModeActive && (
        <ArchiveActionsPopup
          selectionCount={selectedItemsForArchive.length}
          onSelectAll={handleSelectAllForArchive}
          onArchive={handleConfirmArchive}
          onCancel={handleArchiveButtonClick}
        />
      )}

      <div className='files-tree-container' onClick={handleClickedOutsideItem} onContextMenu={handleContextMenu}>
        <ControlledTreeEnvironment
          items={filteredItems}
          getItemTitle={(item) => item.data}
          viewState={{ ['fileSystem']: { focusedItem, expandedItems, selectedItems: [] } }}
          onFocusItem={(item) => {
            if (isSelectionModeActive && item.index !== 'root') {
              toggleItemSelection(item.index);
            } else {
              const mathTreeItem = item as MathTreeItem;
              setFocusedItem(mathTreeItem.index);
              item.isFolder
                ? setSelectedDirectory(mathTreeItem.index)
                : setSelectedFile(mathTreeItem.path);
            }
          }}
          onExpandItem={(item) => setExpandedItems([...expandedItems, item.index])}
          onCollapseItem={(item) => setExpandedItems(expandedItems.filter((i) => i !== item.index))}
          canDragAndDrop={!isSelectionModeActive}
          canReorderItems={!isSelectionModeActive}
          renderItemTitle={({ title, item }) => (
            <div className="rct-custom-item-title">
              {isSelectionModeActive && item.index !== 'root' && (
                <input
                  type="checkbox"
                  className="item-checkbox"
                  checked={selectedItemsForArchive.includes(item.index)}
                  onChange={() => toggleItemSelection(item.index)}
                  onClick={(e) => e.stopPropagation()} 
                />
              )}
              {title}
            </div>
          )}
        >
          <Tree treeId='fileSystem' rootItem='root' treeLabel='File System' />
        </ControlledTreeEnvironment>
      </div>

      <ErrorModal open={errorModalOpen} onClose={() => setErrorModalOpen(false)}>
        {errorModalContent}
      </ErrorModal>

      {contextMenu && ( <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddFile={addFile}
          onAddFolder={addFolder}
          onArchive={() => {
            if (focusedItem !== -1) {
              handleArchive([items[focusedItem].path]);
            }
          }}
          onClose={() => setContextMenu(null)}
        />)}
    </div>
  );
}

export default FileSystem;