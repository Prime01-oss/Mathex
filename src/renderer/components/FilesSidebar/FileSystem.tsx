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
import Fuse from 'fuse.js'; // ✅ 1. Import the search library

type receivedProps = { filesPath: string; root: SetStateAction<TreeItemsObj> };
declare global {
  interface Window {
    api: any;
  }
}
function FileSystem() {
  const { t } = useTranslation();
  // ✅ 2. Get the searchQuery from the context
  const { setSelectedFile, searchQuery } = useGeneralContext(); 

  // This state holds the ORIGINAL, complete list of all files
  const [items, setItems] = useState<TreeItemsObj>({
    root: {
      index: 'root',
      data: '',
      path: '',
    },
  });

  // ✅ 3. Add new state to hold the VISIBLE (filtered) files
  const [filteredItems, setFilteredItems] = useState<TreeItemsObj>(items);

  const [errorModalContent, setErrorModalContent] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDirectory, setSelectedDirectory] =
    useState<TreeItemIndex>('root');
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>(-1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: TreeItemIndex } | null>(null);

  useEffect(() => {
    window.api.getNotebooks();
  }, [items]);

  useEffect(() => {
    window.api.receive('gotNotebooks', (data: receivedProps) => {
      setItems(data.root);
    });
  }, []);

  // ✅ 4. Add a new useEffect to perform the search when the user types
  useEffect(() => {
    // If the search query is empty, show all original files
    if (!searchQuery) {
      setFilteredItems(items);
      return;
    }

    // Get a flat list of all file/folder items to search through
    const allFileItems = Object.values(items).filter(item => item.index !== 'root');

    // Configure Fuse.js for fuzzy searching by filename
    const fuse = new Fuse(allFileItems, {
      keys: ['data'], // The 'data' property holds the filename
      threshold: 0.4,
    });
    
    // Perform the search and get the results
    const searchResults = fuse.search(searchQuery).map(result => result.item);

    // Create a new tree structure containing only the search results
    const resultTree: TreeItemsObj = {
      root: {
        ...items.root,
        children: searchResults.map(item => item.index),
      },
    };
    searchResults.forEach(item => {
      resultTree[item.index] = item;
    });

    setFilteredItems(resultTree); // Update the visible files with the search results

  }, [searchQuery, items]); // Rerun this logic whenever the search query or the original file list changes

  const handleOnDrop = (
    draggedItems: TreeItem[],
    target: DraggingPositionItem | DraggingPositionBetweenItems,
  ) => {
    // ... (rest of the file is unchanged)
    // ...
  };

  const addFolder = () => { /* ... */ };
  const addFile = () => { /* ... */ };
  const handleRenameItem = (item: MathTreeItem, name: string): void => { /* ... */ };
  const handleClickedOutsideItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { /* ... */ };
  const handleDeleteItem = (event: React.KeyboardEvent<HTMLDivElement>) => { /* ... */ };
  const handleArchiveItem = async () => { /* ... */ };
  const handleContextMenu = (e: React.MouseEvent) => { /* ... */ };

  return (
    <div className='file-system' onKeyUp={handleDeleteItem}>
      <div className='file-system-header'>
        {/* ... (header is unchanged) ... */}
      </div>
      <div className='files-tree-container' onClick={handleClickedOutsideItem} onContextMenu={handleContextMenu}>
        {/* ✅ 5. Use the 'filteredItems' to render the tree */}
        <ControlledTreeEnvironment
          items={filteredItems} 
          canDragAndDrop={true}
          canReorderItems={true}
          canDropOnFolder={true}
          canDropOnNonFolder={true}
          getItemTitle={(item) => item.data}
          canSearch={false}
          keyboardBindings={{ renameItem: ['shift+R'] }}
          viewState={{
            ['fileSystem']: {
              focusedItem,
              expandedItems,
              selectedItems,
            },
          }}
          onDrop={handleOnDrop}
          onFocusItem={(item) => {
            const mathTreeItem = item as MathTreeItem;
            setFocusedItem(mathTreeItem.index);
            item.isFolder
              ? setSelectedDirectory(mathTreeItem.index)
              : setSelectedFile(mathTreeItem.path);
          }}
          onExpandItem={(item) =>
            setExpandedItems([...expandedItems, item.index])
          }
          onCollapseItem={(item) =>
            setExpandedItems(
              expandedItems.filter(
                (expandedItemIndex) => expandedItemIndex !== item.index,
              ),
            )
          }
          onSelectItems={setSelectedItems}
          onRenameItem={handleRenameItem}
        >
          <Tree treeId='fileSystem' rootItem='root' treeLabel='File System' />
        </ControlledTreeEnvironment>
        {/* ... (rest of the file is unchanged) ... */}
      </div>
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
      >
        {errorModalContent}
      </ErrorModal>
     {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddFile={addFile}          // Add this
          onAddFolder={addFolder}      // Add this
          onArchive={handleArchiveItem}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

export default FileSystem;