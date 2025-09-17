import React from 'react';
import '../Application.scss';
import './FilesSidebar.scss';

type SidebarButtonProps = {
  title: string;
  state?: boolean;
  buttonType: string;
  icon?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const ICON_MAP: Record<string, string> = {
  notebook: 'fi fi-rr-notebook',
  terminal: 'fi fi-rr-terminal',
  question: 'fi fi-rr-question',
  pen: 'fi fi-rr-pencil',
  calculator: 'fi fi-rr-calculator',
  archive: 'fi fi-rr-archive',
  page: 'fi fi-rr-document',
};

const SidebarButton: React.FC<SidebarButtonProps> = ({ buttonType, state, title, icon, onClick }) => {
  const iconClass = icon && ICON_MAP[icon] ? ICON_MAP[icon] : ICON_MAP['question'];
  return (
    <div>
      <button
        data-tooltip={title}
        className={'sidebar-button' + (state ? ' open' : '')}
        id={buttonType}
        onClick={onClick}
      >
        <i className={iconClass}></i>
      </button>
    </div>
  );
};

export default SidebarButton;
