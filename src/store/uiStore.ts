import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ModalState {
  [key: string]: {
    isOpen: boolean;
    data?: any;
  };
}

export interface UIState {
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  toasts: ToastMessage[];
  modals: ModalState;
  activeModalKey: string | null;
  isFullscreen: boolean;
  pageLoading: boolean;
  language: 'zh-CN' | 'en-US';
}

export interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  hideToast: (id: string) => void;
  clearToasts: () => void;
  openModal: (key: string, data?: any) => void;
  closeModal: (key: string) => void;
  closeAllModals: () => void;
  updateModal: (key: string, data: any) => void;
  setFullscreen: (fullscreen: boolean) => void;
  toggleFullscreen: () => void;
  setPageLoading: (loading: boolean) => void;
  setLanguage: (language: 'zh-CN' | 'en-US') => void;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  toasts: [],
  modals: {},
  activeModalKey: null,
  isFullscreen: false,
  pageLoading: false,
  language: 'zh-CN',
};

const generateToastId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          }
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const themes: ThemeMode[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        get().setTheme(nextTheme);
      },

      showToast: (message, type = 'info', duration = 3000) => {
        const id = generateToastId();
        const toast: ToastMessage = { id, type, message, duration };
        set((state) => ({ toasts: [...state.toasts, toast] }));
        if (duration > 0) {
          setTimeout(() => {
            get().hideToast(id);
          }, duration);
        }
        return id;
      },

      hideToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      openModal: (key, data) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [key]: { isOpen: true, data },
          },
          activeModalKey: key,
        }));
      },

      closeModal: (key) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [key]: { ...state.modals[key], isOpen: false },
          },
          activeModalKey: state.activeModalKey === key ? null : state.activeModalKey,
        }));
      },

      closeAllModals: () => {
        const modals = { ...get().modals };
        Object.keys(modals).forEach((key) => {
          modals[key] = { ...modals[key], isOpen: false };
        });
        set({ modals, activeModalKey: null });
      },

      updateModal: (key, data) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [key]: { ...state.modals[key], data },
          },
        }));
      },

      setFullscreen: (fullscreen) => {
        set({ isFullscreen: fullscreen });
        if (typeof document !== 'undefined') {
          if (fullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
          } else if (!fullscreen && document.fullscreenElement) {
            document.exitFullscreen?.();
          }
        }
      },

      toggleFullscreen: () => {
        get().setFullscreen(!get().isFullscreen);
      },

      setPageLoading: (loading) => {
        set({ pageLoading: loading });
      },

      setLanguage: (language) => {
        set({ language });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
      }),
    },
  ),
);

export const uiSelectors = {
  selectSidebarCollapsed: (state: UIState & UIActions) => state.sidebarCollapsed,
  selectTheme: (state: UIState & UIActions) => state.theme,
  selectToasts: (state: UIState & UIActions) => state.toasts,
  selectModals: (state: UIState & UIActions) => state.modals,
  selectActiveModalKey: (state: UIState & UIActions) => state.activeModalKey,
  selectIsFullscreen: (state: UIState & UIActions) => state.isFullscreen,
  selectPageLoading: (state: UIState & UIActions) => state.pageLoading,
  selectLanguage: (state: UIState & UIActions) => state.language,
  selectModalState: (key: string) => (state: UIState & UIActions) => state.modals[key],
  selectIsModalOpen: (key: string) => (state: UIState & UIActions) => state.modals[key]?.isOpen || false,
  selectModalData: (key: string) => (state: UIState & UIActions) => state.modals[key]?.data,
};
