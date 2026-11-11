import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';
import { ModeProvider } from '@/context/ModeContext';
import { RouteProvider } from '@/context/RouteContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModeProvider defaultMode="production">
      <RouteProvider isDemo={false}>
        <SidebarProvider>
          <div className="min-h-screen bg-[#FAFAFF] flex relative w-full overflow-x-hidden">
            {/* Responsive Drawer Sidebar */}
            <Sidebar />

            {/* Main Content Area: Padding-left 288px on lg (>=1024px) for solid boundary, full width on mobile/tablet */}
            <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0 w-full overflow-x-clip">
              {children}
            </div>
          </div>
        </SidebarProvider>
      </RouteProvider>
    </ModeProvider>
  );
}
