import React, { useEffect, useState } from 'react';
import {
  Tree,
  ControlledTreeEnvironment,
  TreeItemIndex,
} from 'react-complex-tree';
import './ArchiveFileSystem.scss';
import { TreeItemsObj } from '../FilesSidebar/types';
import { useTranslation } from 'react-i18next';

function ArchiveFileSystem() {
  const { t } = useTranslation();
  const [items, setItems] = useState<TreeItemsObj>({
    root: {
      index: 'root',
      data: '',
      path: '',
    },
  });

  const [expandedItems, setExpandedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex>(-1);


  useEffect(() => {
    // A new API call to get archived notebooks
    window.api.getArchivedNotebooks();
  }, [items]);

  useEffect(() => {
    window.api.receive('gotArchivedNotebooks', (data: { root: TreeItemsObj }) => {
      setItems(data.root);
    });
  }, []);

  return (
    <div className='archive-file-system'>
      <div className='archive-file-system-header'>
        <span className='archive-file-system-header-title'>
          {t('Archived Notebooks')}
        </span>
      </div>
      <div className='archive-files-tree-container'>
        <ControlledTreeEnvironment
          items={items}
          getItemTitle={(item) => item.data}
          viewState={{
            ['archiveFileSystem']: {
              focusedItem,
              expandedItems,
              selectedItems,
            },
          }}
          onFocusItem={(item) => setFocusedItem(item.index)}
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
        >
          <Tree treeId='archiveFileSystem' rootItem='root' treeLabel='Archive File System' />
        </ControlledTreeEnvironment>
      </div>
    </div>
  );
}

export default ArchiveFileSystem;