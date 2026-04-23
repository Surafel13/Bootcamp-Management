import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { toggleTheme, selectIsDark } from '../../features/ui/uiSlice';

interface DarkModeToggleProps {
    showLabel?: boolean;
}

export default function DarkModeToggle({ showLabel = true }: DarkModeToggleProps) {
    const dispatch = useDispatch();
    const isDark = useSelector(selectIsDark);

    return (
        <div className="flex items-center gap-2">
            {showLabel && (
                <span className="text-[0.72rem] font-bold text-text-muted uppercase">
                    {isDark ? 'Dark' : 'Light'}
                </span>
            )}
            <button
                className={`w-10.5 h-6 rounded-full transition-all duration-300 cursor-pointer border-none ${isDark ? 'bg-primary' : 'bg-border'
                    }`}
                onClick={() => dispatch(toggleTheme())}
                title="Toggle dark mode"
            >
                <span
                    className={`absolute top-8 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300 flex items-center justify-center ${isDark ? 'translate-x-4.5' : 'translate-x-0.75'
                        }`}
                >
                    {isDark ? <Moon size={11} className="text-primary" /> : <Sun size={11} className="text-primary" />}
                </span>
            </button>
        </div>
    );
}