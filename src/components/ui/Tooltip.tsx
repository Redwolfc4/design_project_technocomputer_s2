'use client';

import React, { useState, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 150,
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Position classes
  const positionClasses: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow classes
  const arrowClasses: Record<TooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent border-t-4 border-x-4 border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent border-b-4 border-x-4 border-t-0',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent border-l-4 border-y-4 border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent border-r-4 border-y-4 border-l-0',
  };

  return (
    <div
      className={`relative inline-flex max-w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-normal transition-all duration-150 animate-in ${positionClasses[position]}`}
          style={{ maxWidth: '280px', width: 'max-content' }}
        >
          <div className="relative px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-md shadow-lg border border-slate-700/50 leading-relaxed text-left break-words">
            {content}
            <div className={`absolute w-0 h-0 pointer-events-none ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
};

interface TruncatedTextWithTooltipProps {
  text: string;
  className?: string;
  position?: TooltipPosition;
  delay?: number;
}

export const TruncatedTextWithTooltip: React.FC<TruncatedTextWithTooltipProps> = ({
  text,
  className = '',
  position = 'top',
  delay = 100,
}) => {
  return (
    <Tooltip content={text} position={position} delay={delay} className="min-w-0 max-w-full block">
      <span className={`block truncate ${className}`}>{text}</span>
    </Tooltip>
  );
};

