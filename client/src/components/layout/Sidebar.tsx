import { useDispatch, useSelector } from 'react-redux';
import {
    BarChart2, Users, LayoutGrid, MessageSquare, Bell,
    User, Settings, CalendarDays, Shield, Menu, LogOut, BookOpen, QrCode, ClipboardList
} from 'lucide-react';
import { clearCredentials, selectActiveRole } from '../../features/auth/authSlice';
import { toggleSidebar, selectSidebarOpen } from '../../features/ui/uiSlice';

const NAV_CONFIG = {
    super_admin: [
        { key: 'overview', label: 'Overview', icon: BarChart2 },
        { key: 'users', label: 'User Management', icon: Users },
        { key: 'divisions', label: 'Division Management', icon: LayoutGrid },
        { key: 'master-schedule', label: 'Master Schedule', icon: CalendarDays },
        { key: 'feedback', label: 'All Feedback', icon: MessageSquare },
        { key: 'audit', label: 'Audit Logs', icon: Shield },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'settings', label: 'Settings', icon: Settings },
    ],
    division_admin: [
        { key: 'overview', label: 'Overview', icon: BarChart2 },
        { key: 'bootcamps', label: 'Bootcamps', icon: BookOpen },
        { key: 'sessions', label: 'Sessions', icon: BookOpen },
        { key: 'attendance', label: 'Attendance', icon: CalendarDays },
        { key: 'tasks', label: 'Tasks', icon: ClipboardList },
        { key: 'students', label: 'Students', icon: Users },
        { key: 'feedback', label: 'Feedback', icon: MessageSquare },
        { key: 'qrcode', label: 'QR Code', icon: QrCode },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'settings', label: 'Settings', icon: Settings },
    ],
    instructor: [
        { key: 'sessions', label: 'My Sessions', icon: BookOpen },
        { key: 'attendance', label: 'Attendance', icon: CalendarDays },
        { key: 'bootcamps', label: 'My Bootcamps', icon: LayoutGrid },
        { key: 'students', label: 'Students', icon: Users },
        { key: 'resources', label: 'Resources', icon: BookOpen },
        { key: 'feedback', label: 'Feedback', icon: MessageSquare },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'settings', label: 'Settings', icon: Settings },
    ],
    student: [
        { key: 'bootcamps', label: 'Browse Bootcamps', icon: BookOpen },
        { key: 'my-bootcamps', label: 'My Bootcamps', icon: LayoutGrid },
        { key: 'tasks', label: 'My Tasks', icon: ClipboardList },
        { key: 'attendance', label: 'Attendance', icon: CalendarDays },
        { key: 'scanner', label: 'QR Scanner', icon: QrCode },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'settings', label: 'Settings', icon: Settings },
    ],
};

const ROLE_LABEL: Record<string, string> = {
    super_admin: 'Super Admin',
    division_admin: 'Division Admin',
    instructor: 'Instructor',
    student: 'Student',
};

interface SidebarProps {
    activePage: string;
    onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
    const dispatch = useDispatch();
    const activeRole = useSelector(selectActiveRole);
    const isCollapsed = !useSelector(selectSidebarOpen);
    const items = NAV_CONFIG[activeRole as keyof typeof NAV_CONFIG] ?? [];

    const user = useSelector((state: any) => state.auth.user);
    const activeDivisionId = useSelector((state: any) => state.auth.activeDivisionId);

    // Find active division name
    const activeDivision = user?.memberships?.find(
        (m: any) => (m.division?._id ?? m.division) === activeDivisionId
    )?.division;

    const divisionName = typeof activeDivision === 'string' ? null : activeDivision?.name;

    return (
        <aside className={`
       z-100 flex flex-col overflow-hidden
      transition-all duration-300 bg-bg-sidebar border-r border-border
      ${isCollapsed ? 'w-sidebar-mini-width' : 'w-sidebar-width'}
    `}>
            {/* Logo */}
            <div className={`
        flex items-center gap-3 py-[18.5px] px-5 border-b border-border
        ${isCollapsed ? 'justify-center py-5 px-0' : ''}
      `}>
                <button
                    className="w-9.5 h-9.5 rounded-radius-sm border border-border bg-bg-input flex items-center justify-center cursor-pointer text-text-secondary hover:text-primary hover:border-primary transition-all duration-300"
                    onClick={() => dispatch(toggleSidebar())}
                    title="Toggle sidebar"
                >
                    <Menu size={20} />
                </button>
                {!isCollapsed && (
                    <div className="ml-3 leading-tight">
                        <h2 className="text-[0.95rem] font-bold text-text-primary">Club Sessions</h2>
                        <span className="text-[0.72rem] text-text-secondary font-normal">
                            {ROLE_LABEL[activeRole] ?? 'BMS'}
                            {divisionName && activeRole !== 'super_admin' && (
                                <span className="text-text-muted"> • {divisionName}</span>
                            )}
                        </span>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2.5 overflow-y-auto flex flex-col gap-0.5">
                {items.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        className={`
              flex items-center gap-3 px-3 py-2.5 rounded-radius-sm cursor-pointer
              text-text-secondary text-sm font-medium transition-all duration-300
              border-none w-full text-left
              ${isCollapsed ? 'justify-center px-3 py-3' : ''}
              ${activePage === key
                                ? 'bg-bg-hover font-semibold [&_svg]:text-primary-light'
                                : 'hover:bg-bg-hover hover:text-text-primary'
                            }
            `}
                        onClick={() => onNavigate(key)}
                        title={isCollapsed ? label : ''}
                    >
                        <Icon size={18} className="shrink-0" />
                        {!isCollapsed && <span className={`nav-item-text ${activePage === key ? 'text-primary' : 'text-text-secondary'}`}>{label}</span>}
                    </button>
                ))}

                <div className="flex-1" />

                <button
                    className={`
            flex items-center gap-3 px-3 py-2.5 rounded-radius-sm cursor-pointer
            text-text-secondary text-sm font-medium transition-all duration-300
            border-none bg-transparent w-full text-left mt-2
            ${isCollapsed ? 'justify-center px-3 py-3' : ''}
            hover:bg-bg-hover hover:text-text-primary
          `}
                    onClick={() => dispatch(clearCredentials())}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!isCollapsed && <span className="nav-item-text">Logout</span>}
                </button>
            </nav>

            {/* Status Indicator */}
            {!isCollapsed && (
                <div className="px-5 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs font-semibold text-text-secondary">
                            Systems Live
                        </span>
                    </div>
                </div>
            )}
        </aside>
    );
}