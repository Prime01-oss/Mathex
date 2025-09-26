// File: src/renderer/components/ArchiveModal/ArchiveFileSystem.tsx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Tree,
  ControlledTreeEnvironment,
  TreeItemIndex,
} from 'react-complex-tree';
import './ArchiveFileSystem.scss';
import { MathTreeItem, TreeItemsObj } from '../FilesSidebar/types';
import { useTranslation } from 'react-i18next';
import ContextMenu from './ContextMenu';
import Fuse from 'fuse.js';

function ArchiveFileSystem() {
  const { t } = useTranslation();
  const [originalItems, setOriginalItems] = useState<TreeItemsObj>({
    root: { index: 'root', data: 'Archived', path: '', children: [], isFolder: true },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>(undefined);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: MathTreeItem } | null>(null);

  const fetchArchivedNotebooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await window.api.getArchivedNotebooks();
      if (data && data.root) {
        setOriginalItems(data.root);
      }
    } catch (err) {
      console.error("Failed to fetch archived notebooks:", err);
      setError('Could not load archived notebooks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedNotebooks();
  }, [fetchArchivedNotebooks]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return originalItems;
    const allFileItems = Object.values(originalItems).filter(item => item.index !== 'root');
    const fuse = new Fuse(allFileItems, { keys: ['data'], threshold: 0.4 });
    const searchResults = fuse.search(searchQuery).map(result => result.item);

    const resultTree: TreeItemsObj = {
      root: { ...originalItems.root, children: searchResults.map(item => item.index) },
    };
    searchResults.forEach(item => { resultTree[item.index] = item; });
    return resultTree;
  }, [searchQuery, originalItems]);

  const handleContextMenu = (e: React.MouseEvent, item: MathTreeItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.index === 'root') return;
    // If the right-clicked item is not already in the selection,
    // clear the previous selection and select only the clicked item.
    if (!selectedItems.includes(item.index)) {
        setSelectedItems([item.index]);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleRestore = async () => {
    if (selectedItems.length === 0) return;
    
    const pathsToRestore = selectedItems
      .map(id => originalItems[id]?.path)
      .filter(Boolean);

    if (pathsToRestore.length > 0) {
      const result = await window.api.restoreArchivedNotebooks(pathsToRestore);
      // You can add a user-facing notification here about the result
      console.log(`Restored ${result.successful} notebooks, ${result.failed} failed.`);
      fetchArchivedNotebooks();
    }
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0) return;

    const pathsToDelete = selectedItems
      .map(id => originalItems[id]?.path)
      .filter(Boolean);
    
    if (pathsToDelete.length > 0) {
        const itemText = pathsToDelete.length > 1 ? `${pathsToDelete.length} notebooks` : `"${originalItems[selectedItems[0]].data}"`;
        const confirmed = confirm(`Are you sure you want to permanently delete ${itemText}?`);
        if (confirmed) {
            const result = await window.api.deleteArchivedNotebooks(pathsToDelete);
            console.log(`Deleted ${result.successful} notebooks, ${result.failed} failed.`);
            fetchArchivedNotebooks();
        }
    }
  };

  const handleCloseContextMenu = () => {
    if (contextMenu) setContextMenu(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="archive-feedback-message">Loading...</div>;
    }
    if (error) {
      return (
        <div className="archive-feedback-message error">
          <p>{error}</p>
          <button onClick={fetchArchivedNotebooks} className="retry-button">Retry</button>
        </div>
      );
    }
    if (!originalItems.root?.children?.length) {
        return <div className="archive-feedback-message">No archived notebooks.</div>;
    }
    if (searchQuery && !filteredItems.root?.children?.length) {
        return <div className="archive-feedback-message">No results found for "{searchQuery}".</div>;
    }
    return (
      <ControlledTreeEnvironment
        items={filteredItems}
        getItemTitle={(item) => item.data}
        viewState={{ ['archiveFileSystem']: { focusedItem, expandedItems, selectedItems } }}
        onFocusItem={(item) => setFocusedItem(item.index)}
        onExpandItem={(item) => setExpandedItems([...expandedItems, item.index])}
        onCollapseItem={(item) => setExpandedItems(expandedItems.filter(idx => idx !== item.index))}
        onSelectItems={setSelectedItems}
        renderItemTitle={({ title, item }) => (
          <div className="rct-tree-item-title" onContextMenu={(e) => handleContextMenu(e, item as MathTreeItem)}>
            {title}
          </div>
        )}
      >
        <Tree treeId='archiveFileSystem' rootItem='root' treeLabel='Archive File System' />
      </ControlledTreeEnvironment>
    );
  };

  return (
    <div className='archive-file-system' onClick={handleCloseContextMenu}>
      <div className='archive-file-system-header'>
        <span className='archive-file-system-header-title'>{t('Archived Notebooks')}</span>
        <input
          type="text"
          placeholder="Search archive..."
          className="archive-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className='archive-files-tree-container'>
        {renderContent()}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRestore={handleRestore}
          onDelete={handleDelete}
          selectionCount={selectedItems.length}
        />
      )}
    </div>
  );
}

export default ArchiveFileSystem;