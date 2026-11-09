import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
  subtitle?: string;
  badge?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
  textSize = 'base',
  subtitle = 'Document Intelligence',
  badge = 'Enterprise',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex-shrink-0 rounded-lg overflow-hidden shadow-sm"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="DokumenAI Logo"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <span className={`font-bold leading-tight tracking-tight text-[#0F172A] dark:text-white flex items-center gap-1.5 ${
            textSize === 'sm' ? 'text-sm' : textSize === 'lg' ? 'text-xl' : 'text-[15px]'
          }`}>
            DokumenAI
            {badge && (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1E1B4B] dark:text-[#818CF8]">
                {badge}
              </span>
            )}
          </span>
          {subtitle && (
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

