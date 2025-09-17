import { BlockElement } from '@renderer/common/types';
import { useEffect } from 'react';
import { useGeneralContext } from '@components/GeneralContext';

// This function is for the "Clear Page" confirmation dialog
export function useConfirmDialog(
  setStateFunction: (...args: unknown[]) => unknown,
  setAllBlockValues: (...args: unknown[]) => unknown,
  setClearModalOpen: (args: boolean) => void,
) {
  const { clearPageRequest } = useGeneralContext();
  const emptyArray: BlockElement[] = [];

  useEffect(() => {
    if (clearPageRequest.cmd === 'clear') setClearModalOpen(true);
  }, [clearPageRequest]);

  const handleDialogConfirm = () => {
    setClearModalOpen(false);
    setStateFunction((prev: { items: BlockElement[] }) => ({
      ...prev,
      items: emptyArray,
    }));
    setAllBlockValues([]);
  };

  const handleDialogCancel = () => setClearModalOpen(false);

  return { handleDialogCancel, handleDialogConfirm };
}

// --- START: NEW, CORRECTED HOOK FOR DIALOG ACTIONS ---
// We create a new, simpler hook for actions that don't need confirmation.
export function useDialogActions() {
  const handleOpenFolder = () => {
    window.api.send('open-folder');
  };

  return { handleOpenFolder };
}
// --- END: NEW, CORRECTED HOOK ---