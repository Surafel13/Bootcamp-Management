import DarkModeToggle from '../shared/DarkModeToggle';
import NotificationBell from '../shared/NotificationBell';
import UserDropdown from '../shared/UserDropdown';
import MembershipSwitcher from '../shared/MembershipSwitcher';

interface TopbarProps {
    title: string;
    subtitle: string;
    onNotificationClick?: () => void;
}

export default function Topbar({ title, subtitle, onNotificationClick }: TopbarProps) {
    return (
        <header className="h-header-height bg-bg-sidebar border-b border-border flex items-center justify-between px-6 sticky top-0 z-90 transition-all duration-300">
            <div className="flex-1">
                <h1 className="text-2xl font-black text-text-primary tracking-tight">
                    {title}
                </h1>
                <p className="text-sm text-text-secondary font-medium">
                    {subtitle}
                </p>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 mr-4">
                    <MembershipSwitcher />
                    <DarkModeToggle />
                    <NotificationBell onClick={onNotificationClick} />
                </div>
                <UserDropdown />
            </div>
        </header>
    );
}