import type { JSX } from 'react';
//import { useSelector } from 'react-redux';
//import { selectSidebarOpen } from '../../features/ui/uiSlice';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
    activePage: string;
    onNavigate: (page: string) => void;
    title: string;
    subtitle: string;
    onNotificationClick?: () => void;
    children: JSX.Element;
}

export default function DashboardLayout({
    activePage,
    onNavigate,
    title,
    subtitle,
    onNotificationClick,
    children,
}: DashboardLayoutProps) {
    const sidebarOpen = useSelector(selectSidebarOpen);

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <Sidebar activePage={activePage} onNavigate={onNavigate} />

            <div
                className={`
          flex flex-col flex-1 h-screen overflow-hidden
          transition-all duration-300 ease-in-out
        `}
            >
                <Topbar
                    title={title}
                    subtitle={subtitle}
                    onNotificationClick={onNotificationClick}
                />
                <main className="flex-1 overflow-y-auto p-7 pb-10">
                    {children}
                </main>
            </div>
        </div>
    );
}