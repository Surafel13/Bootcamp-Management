import { Bell } from 'lucide-react';
import { useNotifications } from '../../features/notifications/notificationsApi';

interface NotificationBellProps {
    onClick?: () => void;
}

export default function NotificationBell({ onClick }: NotificationBellProps) {
    const { data } = useNotifications();
    const count = data?.unreadCount || 0;

    return (
        <button
            className="w-9.5 h-9.5 rounded-radius-sm border border-border bg-bg-input flex items-center justify-center cursor-pointer text-text-secondary hover:text-primary hover:border-primary transition-all duration-300 relative"
            title="Notifications"
            onClick={onClick}
        >
            <Bell size={18} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-white text-[0.7rem] font-bold flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </button>
    );
}