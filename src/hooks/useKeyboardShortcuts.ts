import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutHandlers {
  onSearch?: () => void;
  onNew?: () => void;
  onEdit?: () => void;
  onRefresh?: () => void;
  onPayment?: () => void;
  onPrint?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onClose?: () => void;
  onHelp?: () => void;
  onHome?: () => void;
  onLogout?: () => void;
  onAddRow?: () => void;
  enabled?: boolean;
}

export function isInputFocused(): boolean {
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  const tagName = activeEl.tagName;
  const isEditable = (activeEl as HTMLElement).isContentEditable;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    isEditable
  );
}

export function focusSearchInput(): boolean {
  const searchInputs = document.querySelectorAll<HTMLInputElement>(
    'input[type="text"][placeholder*="Search"], input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]'
  );
  if (searchInputs.length > 0) {
    const target = searchInputs[0];
    target.focus();
    target.select();
    return true;
  }
  
  // Fallback to first text input if available
  const anyInput = document.querySelector<HTMLInputElement>('input[type="text"]');
  if (anyInput) {
    anyInput.focus();
    anyInput.select();
    return true;
  }
  return false;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const {
    onSearch,
    onNew,
    onEdit,
    onRefresh,
    onPayment,
    onPrint,
    onDelete,
    onSave,
    onClose,
    onHelp,
    onHome,
    onLogout,
    onAddRow,
    enabled = true
  } = handlers;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const alt = e.altKey;
      const shift = e.shiftKey;
      const typing = isInputFocused();

      // 1. ESCAPE - Always allowed (Closes modals, cancels, clears selection)
      if (key === 'Escape') {
        if (onClose) {
          e.preventDefault();
          onClose();
        } else {
          // Fallback: Dispatch custom event for top open modal
          const closeBtn = document.querySelector<HTMLButtonElement>('[title*="Close"], [aria-label*="Close"]');
          if (closeBtn) {
            closeBtn.click();
          }
        }
        return;
      }

      // 2. CTRL + / (Help Modal)
      if (ctrl && key === '/') {
        e.preventDefault();
        if (onHelp) onHelp();
        else {
          window.dispatchEvent(new CustomEvent('erp-open-shortcut-help'));
        }
        return;
      }

      // 3. CTRL + S or F9 (Save Form)
      if ((ctrl && (key === 's' || key === 'S')) || key === 'F9') {
        e.preventDefault();
        if (onSave) {
          onSave();
        } else {
          // Attempt to find active form submit button
          const submitBtn = document.querySelector<HTMLButtonElement>(
            'form button[type="submit"], button[data-action="save"], button:has(.save-icon)'
          );
          if (submitBtn) {
            submitBtn.click();
          }
        }
        return;
      }

      // 4. CTRL + F or F2 (Focus Search)
      if ((ctrl && (key === 'f' || key === 'F')) || key === 'F2') {
        e.preventDefault();
        if (onSearch) {
          onSearch();
        } else {
          focusSearchInput();
        }
        return;
      }

      // 5. CTRL + P or F7 (Print)
      if ((ctrl && (key === 'p' || key === 'P')) || key === 'F7') {
        e.preventDefault();
        if (onPrint) {
          onPrint();
        } else {
          window.print();
        }
        return;
      }

      // 6. CTRL + ENTER (Add Size Row inside form if onAddRow provided)
      if (ctrl && key === 'Enter') {
        if (onAddRow) {
          e.preventDefault();
          onAddRow();
          return;
        }
      }

      // --- IF TYPING IN INPUT, DO NOT TRIGGER GLOBAL NON-TYPING SHORTCUTS BELOW ---
      if (typing) {
        return;
      }

      // 7. ALT + H (Home / Dashboard)
      if (alt && (key === 'h' || key === 'H')) {
        e.preventDefault();
        if (onHome) onHome();
        else window.location.hash = 'dashboard';
        return;
      }

      // 8. ALT + L (Logout)
      if (alt && (key === 'l' || key === 'L')) {
        e.preventDefault();
        if (onLogout) onLogout();
        return;
      }

      // 9. F3 (New / Add)
      if (key === 'F3') {
        e.preventDefault();
        if (onNew) {
          onNew();
        }
        return;
      }

      // 10. F4 (Edit selected record)
      if (key === 'F4') {
        e.preventDefault();
        if (onEdit) {
          onEdit();
        }
        return;
      }

      // 11. F5 or CTRL + R (Refresh)
      if (key === 'F5' || (ctrl && (key === 'r' || key === 'R'))) {
        e.preventDefault();
        if (onRefresh) {
          onRefresh();
        } else {
          window.location.reload();
        }
        return;
      }

      // 12. F6 (Payment / Settlement)
      if (key === 'F6') {
        e.preventDefault();
        if (onPayment) {
          onPayment();
        }
        return;
      }

      // 13. F8 (Delete)
      if (key === 'F8') {
        e.preventDefault();
        if (onDelete) {
          onDelete();
        }
        return;
      }
    },
    [
      enabled,
      onSearch,
      onNew,
      onEdit,
      onRefresh,
      onPayment,
      onPrint,
      onDelete,
      onSave,
      onClose,
      onHelp,
      onHome,
      onLogout,
      onAddRow
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
