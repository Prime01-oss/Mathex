import React from 'react';
import { TrashIcon } from '../Icons';
import './Header.scss';

export interface TagProps {
    text: string;
    color: string;
    // This is the new line that tells the component to expect the onRemoveTag function
    onRemoveTag?: (tag: string) => void;
}

export const Tag = ({ text, color, onRemoveTag }: TagProps) => {

    const handleRemove = () => {
        if (onRemoveTag) {
            onRemoveTag(text);
        }
    }

    return (
        <div className={`tag ${color}`}>
            <span>{text}</span>
            <button onClick={handleRemove}>
                <TrashIcon />
            </button>
        </div>
    )
}
