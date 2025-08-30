import React from 'react'; // Removed unused 'useContext'
import {
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults,
  ActionImpl,
  useRegisterActions,
} from 'kbar';
import { useTranslation } from 'react-i18next';
// 1. Changed this import to get the correct hook
import { useGeneralContext } from '../GeneralContext'; 
import { GearIcon, SearchIcon } from '../Icons';
import './CommandBar.scss';

const CommandBar = ({ openSettingsModal }: { openSettingsModal: () => void; }) => {
  const { t } = useTranslation();
  // 2. Used the correct hook to get the context data
  const { theme, accentColor, setTheme, setAccentColor } = useGeneralContext(); 

  const themes = ['light', 'dark', 'auto'];
  const colors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow'];

  useRegisterActions([
    {
      id: 'settings',
      name: t('command_bar.settings', 'Settings'),
      keywords: 'settings preferences options',
      shortcut: ['s'],
      icon: <GearIcon />,
      perform: openSettingsModal,
    },
    ...themes.map((th) => ({
      id: th,
      name: th,
      keywords: `theme ${th}`,
      parent: 'themes',
      perform: () => setTheme(th as any),
    })),
    {
      id: 'themes',
      name: t('command_bar.themes', 'Change theme...'),
      keywords: 'background color',
    },
    ...colors.map((ac) => ({
      id: ac,
      name: ac,
      keywords: `accent ${ac}`,
      parent: 'accent-colors',
      perform: () => setAccentColor(ac as any),
    })),
    {
      id: 'accent-colors',
      name: t('command_bar.accent_colors', 'Change accent color...'),
      keywords: 'interface color',
    },
  ]);

  return (
    <KBarPortal>
      <KBarPositioner className="kbar-positioner">
        <KBarAnimator className="kbar-animator">
          <div className="kbar-header">
            <SearchIcon />
            <KBarSearch className="kbar-search" placeholder={t('command_bar.search', 'Search...')} />
          </div>
          <RenderResults />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
};

function RenderResults() {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="kbar-group-name">{item}</div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId}
          />
        )
      }
    />
  );
}

const ResultItem = React.forwardRef(
  (
    {
      action,
      active,
      currentRootActionId,
    }: {
      action: ActionImpl;
      active: boolean;
      currentRootActionId: string;
    },
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const ancestors = React.useMemo(() => {
      if (!currentRootActionId) return action.ancestors;
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId,
      );
      // Show parent events if they exist
      return action.ancestors.slice(index + 1);
    }, [action.ancestors, currentRootActionId]);

    return (
      <div
        ref={ref}
        className={`kbar-result-item ${active ? 'active' : ''}`}
      >
        <div className="kbar-item-content">
          {action.icon && <div className="kbar-item-icon">{action.icon}</div>}
          <div className="kbar-item-text">
            {ancestors.length > 0 &&
              ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <span className="kbar-ancestor-name">{ancestor.name}</span>
                  <span className="kbar-ancestor-separator">&rsaquo;</span>
                </React.Fragment>
              ))}
            <span>{action.name}</span>
          </div>
        </div>
        {action.shortcut?.length ? (
          <div aria-hidden className="kbar-shortcut-wrapper">
            {action.shortcut.map((sc) => (
              <kbd key={sc} className="kbar-shortcut">{sc}</kbd>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);

export default CommandBar;

