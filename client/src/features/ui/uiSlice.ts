import { createSlice, } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

interface Toast {
    id: number;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

interface UiState {
    isDark: boolean;
    sidebarOpen: boolean;
    toasts: Toast[];
}

const applyTheme = (isDark: boolean) => {
    const htmlElement = document.documentElement;

    if (isDark) {
        htmlElement.setAttribute('data-theme', 'dark');
        htmlElement.classList.add('dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        htmlElement.classList.remove('dark');
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#13131f' : '#ffffff');
    }
};

const getInitialTheme = (): boolean => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialSidebar = (): boolean => {
    const savedSidebar = localStorage.getItem('sidebar');

    if (savedSidebar === 'open') return true;
    if (savedSidebar === 'closed') return false;

    return true;
};

const initialState: UiState = {
    isDark: getInitialTheme(),
    sidebarOpen: getInitialSidebar(),
    toasts: [],
};

if (typeof window !== 'undefined') {
    applyTheme(initialState.isDark);
}

if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches;
            applyTheme(newTheme);
        }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.isDark = !state.isDark;
            localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
            applyTheme(state.isDark);
        },

        setTheme: (state, action: PayloadAction<boolean>) => {
            state.isDark = action.payload;
            localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
            applyTheme(state.isDark);
        },

        setSystemTheme: (state) => {
            localStorage.removeItem('theme');
            const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            state.isDark = systemIsDark;
            applyTheme(systemIsDark);
        },

        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
            localStorage.setItem('sidebar', state.sidebarOpen ? 'open' : 'closed');
        },

        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
            localStorage.setItem('sidebar', state.sidebarOpen ? 'open' : 'closed');
        },

        addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
            const toast: Toast = {
                id: Date.now(),
                duration: 2000,
                type: 'info',
                ...action.payload,
            };
            state.toasts.push(toast);
        },

        removeToast: (state, action: PayloadAction<number>) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },

        clearToasts: (state) => {
            state.toasts = [];
        },
    },
});

export const {
    toggleTheme,
    setTheme,
    setSystemTheme,
    setSidebarOpen,
    toggleSidebar,
    addToast,
    removeToast,
    clearToasts,
} = uiSlice.actions;

export const selectIsDark = (state: RootState): boolean => state.ui.isDark;
export const selectSidebarOpen = (state: RootState): boolean => state.ui.sidebarOpen;
export const selectToasts = (state: RootState): Toast[] => state.ui.toasts;

export const selectLatestToast = (state: RootState): Toast | undefined => {
    const toasts = selectToasts(state);
    return toasts[toasts.length - 1];
};

export const selectHasActiveToasts = (state: RootState): boolean => {
    return selectToasts(state).length > 0;
};

export default uiSlice.reducer;