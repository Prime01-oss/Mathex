import React from 'react';
import './chalkBoard.scss';
import { useGeneralContext } from '../GeneralContext';
import { Tldraw } from '@tldraw/tldraw';

const ChalkBoard: React.FC = () => {
  const { isChalkBoardOpen, setIsChalkBoardOpen } = useGeneralContext();

  if (!isChalkBoardOpen) return null;

  return (
    <div className='chalk-board-overlay'>
      <button
        className='close-button'
        onClick={() => setIsChalkBoardOpen(false)}
      >
        ✕
      </button>
      <div className='draw-container'>
        {/* This is the drawing canvas. By setting showUI to true, 
          we are telling it to display its own professional, 
          built-in UI with all the tools you need.
        */}
        <Tldraw showUI={true} />
      </div>
    </div>
  );
};

export default ChalkBoard;