import React, { useEffect, useState } from 'react';
import '../Application.scss';
import FilePath from './FilePath';
import { Tag, TagProps } from './Tag';
import AddTag from './AddTag';
import { useGeneralContext } from '../GeneralContext';
import './Header.scss';

const Header = () => {
  const { page, updatePage } = useGeneralContext();
  // The 'TagProps' type from your project seems to use 'text' not 'name', based on the errors.
  const [tags, setTags] = useState<TagProps[]>([]);

  useEffect(() => {
    if (!page?.tags) {
      setTags([]);
      return;
    }
    // Fix: Using 'text' instead of 'name' and adding a type for the 'tag' parameter.
    setTags(page.tags.map((tag: string) => ({ text: tag, color: 'blue' })));
  }, [page]);

  // Fix: Adding the 'string' type to the 'tag' parameter.
  const onAddTag = (tag: string) => {
    if (!page) return;

    const newTags = [...(page.tags || []), tag];
    updatePage({ ...page, tags: newTags });
  };

  // Fix: Adding the 'string' type to the 'tag' parameter.
  const onRemoveTag = (tag: string) => {
    if (!page) return;

    // Fix: Adding the 'string' type to the 't' parameter in the filter function.
    const newTags = page.tags.filter((t: string) => t !== tag);
    updatePage({ ...page, tags: newTags });
  };

  return (
    <div className='header'>
        {/* Fix: The FilePath component requires the 'filePath' prop. */}
        <FilePath filePath={page?.filePath || ''} />
        <div className='tags'>
            {/* Fix: Using 'tag.text' for the key and passing props explicitly to avoid type errors. */}
            {tags.map((tag) => <Tag key={tag.text} text={tag.text} color={tag.color} onRemoveTag={onRemoveTag} />)}
            <AddTag onAddTag={onAddTag} />
        </div>
    </div>
  );
};

export default Header;

