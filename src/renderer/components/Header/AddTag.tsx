import React, { useState } from 'react';
import { PlusIcon } from '../Icons';
import './Header.scss';

// This is the new interface that tells the component to expect the onAddTag function
interface AddTagProps {
    onAddTag: (tag: string) => void;
}

const AddTag = ({ onAddTag }: AddTagProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [tag, setTag] = useState('');

    const handleAdd = () => {
        if (tag.trim() !== '') {
            onAddTag(tag);
            setTag('');
            setIsAdding(false);
        }
    }

    if (isAdding) {
        return (
            <div className='add-tag'>
                <input
                    type='text'
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    autoFocus
                />
                <button onClick={handleAdd}>
                    <PlusIcon />
                </button>
            </div>
        )
    }

    return (
        <button className='add-tag-button' onClick={() => setIsAdding(true)}>
            <PlusIcon />
        </button>
    )
};

export default AddTag;
