import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole, UserInfo } from '@/types';
import { userService } from '@/mock/services';

export interface UserState {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface UserActions {
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearUser: () => void;
}

const mapToUserInfo = (user: any): UserInfo => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as UserRole,
  department: user.department,
  avatar: user.avatar,
});

const initialState: UserState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

export const userStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await userService.login({ username, password });
          if (response.success && response.user && response.token) {
            const userInfo = mapToUserInfo(response.user);
            localStorage.setItem('token', response.token);
            set({
              user: userInfo,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, message: response.message };
          }
          set({ isLoading: false });
          return { success: false, message: response.message };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: '登录失败，请稍后重试' };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await userService.logout();
        } finally {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      fetchCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await userService.getCurrentUser();
          if (user) {
            const userInfo = mapToUserInfo(user);
            set({
              user: userInfo,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            localStorage.removeItem('token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearUser: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

export const useUserStore = userStore;

export const userSelectors = {
  selectUser: (state: UserState & UserActions) => state.user,
  selectToken: (state: UserState & UserActions) => state.token,
  selectIsLoading: (state: UserState & UserActions) => state.isLoading,
  selectIsAuthenticated: (state: UserState & UserActions) => state.isAuthenticated,
  selectUserRole: (state: UserState & UserActions) => state.user?.role,
  selectUserName: (state: UserState & UserActions) => state.user?.name,
};
