'use client';

import { useState, useCallback, useRef } from 'react';
import { ActiveMenuState, DataTableMenuPosition } from './types';

export function useDataTableInteractions<T>() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenuState<T> | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearTimers();
    setActiveMenu(null);
  }, [clearTimers]);

  const scheduleCloseMenu = useCallback((delay = 250) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, delay);
  }, []);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openDropdownMenu = useCallback((row: T, e: React.MouseEvent<HTMLElement>, title?: string) => {
    e.preventDefault();
    e.stopPropagation();
    clearTimers();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveMenu({
      row,
      position: { x: rect.right - 210, y: rect.bottom + 6 },
      triggerType: 'dropdown',
      title,
    });
  }, [clearTimers]);

  const handleButtonMouseEnter = useCallback((row: T, e: React.MouseEvent<HTMLElement>, title?: string, delay = 180) => {
    clearTimers();
    const rect = e.currentTarget.getBoundingClientRect();
    const targetPos = { x: rect.right - 210, y: rect.bottom + 6 };

    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu({
        row,
        position: targetPos,
        triggerType: 'dropdown',
        title,
      });
    }, delay);
  }, [clearTimers]);

  const handleButtonMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    scheduleCloseMenu(250);
  }, [scheduleCloseMenu]);

  const openContextMenu = useCallback((row: T, e: React.MouseEvent<HTMLElement>, title?: string) => {
    e.preventDefault();
    e.stopPropagation();
    clearTimers();
    setActiveMenu({
      row,
      position: { x: e.clientX, y: e.clientY },
      triggerType: 'context_menu',
      title,
    });
  }, [clearTimers]);

  return {
    activeMenu,
    setActiveMenu,
    closeMenu,
    openDropdownMenu,
    handleButtonMouseEnter,
    handleButtonMouseLeave,
    scheduleCloseMenu,
    cancelScheduledClose,
    openContextMenu,
  };
}
