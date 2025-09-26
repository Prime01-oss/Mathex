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
  
  const [isSelectionModeActive, setSelectionModeActive] = useState(false);

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

  const handleRestore = async () => {
    if (selectedItems.length === 0) return;
    const pathsToRestore = selectedItems.map(id => originalItems[id]?.path).filter(Boolean);
    if (pathsToRestore.length > 0) {
      const result = await window.api.restoreArchivedNotebooks(pathsToRestore);
      console.log(`Restored ${result.successful}, Failed ${result.failed}`);
      
      // --- THIS IS THE NEW LINE ---
      window.api.requestNotebooksRefresh(); // Signal the main process to refresh the other panel

      fetchArchivedNotebooks();
      setSelectionModeActive(false);
      setSelectedItems([]);
    }
  };
  
  const toggleSelectItem = (itemId: TreeItemIndex) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const allItemIds = filteredItems.root.children || [];
    setSelectedItems(allItemIds);
  };

  const handleCancelSelection = () => {
    setSelectionModeActive(false);
    setSelectedItems([]);
  };

  const renderHeaderButtons = () => {
    if (isSelectionModeActive) {
      return (
        <div className="archive-header-actions">
          <button onClick={handleRestore} disabled={selectedItems.length === 0} className="header-button restore">
            Restore ({selectedItems.length})
          </button>
          <button onClick={handleSelectAll} className="header-button secondary">Select All</button>
          <button onClick={handleCancelSelection} className="header-button secondary">Cancel</button>
        </div>
      );
    }
    return (
      <div className="archive-header-actions">
          <button onClick={() => setSelectionModeActive(true)} className="header-button">
            Select
          </button>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) return <div className="archive-feedback-message">Loading...</div>;
    if (error) return (
      <div className="archive-feedback-message error">
        <p>{error}</p>
        <button onClick={fetchArchivedNotebooks} className="retry-button">Retry</button>
      </div>
    );
    if (!originalItems.root?.children?.length) return <div className="archive-feedback-message">No archived notebooks.</div>;
    if (searchQuery && !filteredItems.root?.children?.length) return <div className="archive-feedback-message">No results found for "{searchQuery}".</div>;

    return (
      <ControlledTreeEnvironment
        items={filteredItems}
        getItemTitle={(item) => item.data}
        viewState={{ ['archiveFileSystem']: { focusedItem, expandedItems, selectedItems: [] } }}
        onFocusItem={(item) => setFocusedItem(item.index)}
        onExpandItem={(item) => setExpandedItems([...expandedItems, item.index])}
        onCollapseItem={(item) => setExpandedItems(expandedItems.filter(idx => idx !== item.index))}
        renderItemTitle={({ title, item }) => (
          <div className="rct-tree-item-title">
            {isSelectionModeActive && item.index !== 'root' && (
              <input
                type="checkbox"
                className="item-checkbox"
                checked={selectedItems.includes(item.index)}
                onChange={() => toggleSelectItem(item.index)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {title}
          </div>
        )}
      >
        <Tree treeId='archiveFileSystem' rootItem='root' treeLabel='Archive File System' />
      </ControlledTreeEnvironment>
    );
  };

  return (
    <div className='archive-file-system'>
      <div className='archive-file-system-header'>
        <div className="header-top-row">
            <span className='archive-file-system-header-title'>{t('Archived Notebooks')}</span>
            {renderHeaderButtons()}
        </div>
        <input
          type="text"
          placeholder="Search archive..."
          className="archive-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className='archive-files-tree-container'>
        {renderContent()}
      </div>
    </div>
  );
}

export default ArchiveFileSystem;