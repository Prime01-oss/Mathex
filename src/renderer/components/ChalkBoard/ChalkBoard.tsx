import React from 'react';
import './ChalkBoard.scss';
import { useGeneralContext } from '../GeneralContext';
import DrawBlockContent from '../Page/Grid/Blocks/DrawBlock';

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
        <DrawBlockContent content={null} blockStateFunction={() => {}} />
      </div>
    </div>
  );
};

export default ChalkBoard;
