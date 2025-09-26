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
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleRestore = async (item: MathTreeItem) => {
    if (item.path) {
      await window.api.restoreArchivedNotebook(item.path);
      fetchArchivedNotebooks();
    }
  };

  const handleDelete = async (item: MathTreeItem) => {
    if (item.path) {
      const confirmed = confirm(`Are you sure you want to permanently delete "${item.data}"?`);
      if (confirmed) {
        await window.api.deleteArchivedNotebook(item.path);
        fetchArchivedNotebooks();
      }
    }
  };

  const handleCloseContextMenu = () => {
    if (contextMenu) setContextMenu(null);
  };

  // This function decides what to render in the main content area
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
          onRestore={() => handleRestore(contextMenu.item)}
          onDelete={() => handleDelete(contextMenu.item)}
        />
      )}
    </div>
  );
}

export default ArchiveFileSystem;