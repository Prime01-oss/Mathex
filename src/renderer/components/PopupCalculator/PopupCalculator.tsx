import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PopupCalculator.scss';
import { useGeneralContext } from '@components/GeneralContext';
import { evaluate } from 'mathjs';

const PopupCalculator: React.FC = () => {
  const { setIsCalculatorOpen } = useGeneralContext();
  const [display, setDisplay] = useState('0');
  const calcRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // --- HANDLER FUNCTIONS ---
  const handleInput = useCallback((value: string) => {
    setDisplay(prev => {
      // Prevent multiple operators or decimals in a row
      const lastChar = prev.slice(-1);
      if (['+', '-', '*', '/', '.'].includes(lastChar) && ['+', '-', '*', '/', '.'].includes(value)) {
        return prev;
      }
      if (prev === '0' || prev === 'Error') {
        return value;
      }
      return prev + value;
    });
  }, []);

  const handleFunction = useCallback((func: string) => {
    setDisplay(prev => `${func}(${prev})`);
  }, []);

  const handleCalculate = useCallback(() => {
    setDisplay(prev => {
      if (prev === 'Error' || !prev) return prev;
      try {
        const result = evaluate(prev.replace('^', '^'));
        return String(result);
      } catch (error) {
        return 'Error';
      }
    });
  }, []);
  
  const handleClear = useCallback(() => setDisplay('0'), []);
  
  const handleBackspace = useCallback(() => {
    setDisplay(prev => prev.slice(0, -1) || '0');
  }, []);

  // --- KEYBOARD SUPPORT ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key >= '0' && key <= '9') handleInput(key);
      else if (['+', '-', '*', '/', '.', '(', ')', '^'].includes(key)) handleInput(key);
      else if (key === 'Enter' || key === '=') handleCalculate();
      else if (key === 'Backspace') handleBackspace();
      else if (key === 'Escape') setIsCalculatorOpen(false);
      else if (key.toLowerCase() === 'c') handleClear();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleBackspace, handleClear, setIsCalculatorOpen]);

  // --- DRAGGABLE LOGIC (UNCHANGED) ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (calcRef.current) {
      isDragging.current = true;
      offset.current = {
        x: e.clientX - calcRef.current.getBoundingClientRect().left,
        y: e.clientY - calcRef.current.getBoundingClientRect().top,
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && calcRef.current) {
      calcRef.current.style.left = `${e.clientX - offset.current.x}px`;
      calcRef.current.style.top = `${e.clientY - offset.current.y}px`;
      calcRef.current.style.bottom = 'auto';
      calcRef.current.style.right = 'auto';
    }
  };
  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // --- SCIENTIFIC BUTTON LAYOUT ---
  const buttons = [
    { value: 'sin', type: 'func' }, { value: 'cos', type: 'func' }, { value: 'tan', type: 'func' }, { value: 'C', type: 'clear' }, { value: '←', type: 'clear', action: handleBackspace },
    { value: 'log', type: 'func' }, { value: 'ln', type: 'func' }, { value: '(', type: 'op' }, { value: ')', type: 'op' }, { value: '^', type: 'op' },
    { value: '7', type: 'num' }, { value: '8', type: 'num' }, { value: '9', type: 'num' }, { value: '/', type: 'op' }, { value: 'sqrt', type: 'func', label: '√' },
    { value: '4', type: 'num' }, { value: '5', type: 'num' }, { value: '6', type: 'num' }, { value: '*', type: 'op' }, { value: 'pi', type: 'const' },
    { value: '1', type: 'num' }, { value: '2', type: 'num' }, { value: '3', type: 'num' }, { value: '-', type: 'op' }, { value: 'e', type: 'const' },
    { value: '0', type: 'num', wide: true }, { value: '.', type: 'num' }, { value: '+', type: 'op' }, { value: '=', type: 'eq' }
  ];

  const onButtonClick = (btn: typeof buttons[0]) => {
    if (btn.action) {
      btn.action();
      return;
    }
    switch (btn.type) {
      case 'num':
      case 'op':
      case 'const':
        handleInput(btn.value);
        break;
      case 'func':
        handleFunction(btn.value);
        break;
      case 'clear':
        handleClear();
        break;
      case 'eq':
        handleCalculate();
        break;
    }
  };

  return (
    <div className="popup-calculator" ref={calcRef}>
      <div className="popup-header" onMouseDown={handleMouseDown}>
        <span>Scientific Calculator</span>
        <button className="close-button" onClick={() => setIsCalculatorOpen(false)}>×</button>
      </div>
      <div className="popup-body">
        <div className="calculator-display">{display}</div>
        <div className="calculator-buttons scientific">
          {buttons.map((btn) => (
            <button
              key={btn.value}
              className={`calc-button ${btn.type} ${btn.wide ? 'wide' : ''}`}
              onClick={() => onButtonClick(btn)}
            >
              {btn.label || btn.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopupCalculator;