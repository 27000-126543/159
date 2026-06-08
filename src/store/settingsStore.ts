import { create } from 'zustand';
import { userService } from '@/mock/services/userService';
import { User } from '@/mock/data/users';
import { UserRole } from '@/types';

export interface SystemParams {
  approvalTimeoutHours: number;
  autoEscalation: boolean;
  largeOrderThreshold: number;
  defaultCreditPeriodDays: number;
}

export interface ApprovalFlowNode {
  id: string;
  role: UserRole;
  roleName: string;
  minAmount: number;
  maxAmount: number;
  order: number;
  required: boolean;
}

export interface ApprovalFlowConfig {
  id: string;
  name: string;
  description: string;
  nodes: ApprovalFlowNode[];
  timeoutEscalation: boolean;
  timeoutHours: number;
}

export interface RolePermission {
  role: UserRole;
  roleName: string;
  level: number;
  description: string;
  permissions: string[];
}

export interface SettingsState {
  users: User[];
  currentUser: User | null;
  roles: RolePermission[];
  systemParams: SystemParams;
  approvalFlows: ApprovalFlowConfig[];
  loading: boolean;
  error: string | null;
}

export interface SettingsActions {
  fetchUsers: (params?: { role?: string; status?: string; keyword?: string }) => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  createUser: (data: Partial<User>) => Promise<User | null>;
  updateUser: (id: string, data: Partial<User>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (id: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  toggleUserStatus: (id: string) => Promise<User | null>;
  fetchRoles: () => Promise<void>;
  updateRolePermissions: (role: UserRole, permissions: string[]) => Promise<{ success: boolean; message: string }>;
  fetchSystemParams: () => Promise<void>;
  saveSystemParams: (params: SystemParams) => Promise<{ success: boolean; message: string }>;
  fetchApprovalFlows: () => Promise<void>;
  saveApprovalFlow: (flow: ApprovalFlowConfig) => Promise<{ success: boolean; message: string }>;
  deleteApprovalFlow: (id: string) => Promise<{ success: boolean; message: string }>;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
}

const mockRoles: RolePermission[] = [
  {
    role: 'supplier',
    roleName: '供应商',
    level: 1,
    description: '查看自己的询价、报价、订单、质检、结算',
    permissions: [
      'inquiry:view',
      'quote:create',
      'quote:view',
      'order:view',
      'quality:view',
      'settlement:view',
    ],
  },
  {
    role: 'buyer',
    roleName: '采购员',
    level: 2,
    description: '管理品类、创建询价单、发起议价、创建订单',
    permissions: [
      'category:manage',
      'inquiry:create',
      'inquiry:view',
      'inquiry:edit',
      'negotiation:initiate',
      'order:create',
      'order:view',
      'supplier:view',
      'supplier:contact',
    ],
  },
  {
    role: 'manager',
    roleName: '采购经理',
    level: 3,
    description: '审批订单、查看部门数据、管理采购员',
    permissions: [
      'order:approve',
      'order:view',
      'dashboard:view',
      'report:view',
      'buyer:manage',
      'supplier:audit',
      'inquiry:view',
      'negotiation:view',
    ],
  },
  {
    role: 'director',
    roleName: '采购总监',
    level: 4,
    description: '跨区域数据查看、高级审批、战略决策',
    permissions: [
      'order:approve_high',
      'dashboard:view_all',
      'report:export',
      'supplier:manage',
      'category:manage_all',
      'budget:manage',
      'strategy:view',
    ],
  },
  {
    role: 'ceo',
    roleName: 'CEO',
    level: 5,
    description: '全局数据管理、大额订单审批、系统配置',
    permissions: [
      'all',
      'order:approve_large',
      'system:configure',
      'user:manage',
      'role:manage',
      'approval:configure',
      'finance:view',
      'dashboard:global',
    ],
  },
];

const mockApprovalFlows: ApprovalFlowConfig[] = [
  {
    id: 'FLOW001',
    name: '标准采购审批流程',
    description: '适用于普通采购订单的审批流程',
    timeoutEscalation: true,
    timeoutHours: 24,
    nodes: [
      { id: 'N001', role: 'manager', roleName: '采购经理', minAmount: 0, maxAmount: 100000, order: 1, required: true },
      { id: 'N002', role: 'director', roleName: '采购总监', minAmount: 100000, maxAmount: 500000, order: 2, required: true },
      { id: 'N003', role: 'ceo', roleName: 'CEO', minAmount: 500000, maxAmount: Infinity, order: 3, required: true },
    ],
  },
  {
    id: 'FLOW002',
    name: '紧急采购审批流程',
    description: '适用于紧急采购订单的快速审批流程',
    timeoutEscalation: true,
    timeoutHours: 12,
    nodes: [
      { id: 'N004', role: 'manager', roleName: '采购经理', minAmount: 0, maxAmount: 50000, order: 1, required: true },
      { id: 'N005', role: 'director', roleName: '采购总监', minAmount: 50000, maxAmount: Infinity, order: 2, required: true },
    ],
  },
];

const initialState: SettingsState = {
  users: [],
  currentUser: null,
  roles: mockRoles,
  systemParams: {
    approvalTimeoutHours: 24,
    autoEscalation: true,
    largeOrderThreshold: 10,
    defaultCreditPeriodDays: 30,
  },
  approvalFlows: mockApprovalFlows,
  loading: false,
  error: null,
};

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  ...initialState,

  fetchUsers: async (params) => {
    set({ loading: true, error: null });
    try {
      const users = await userService.getUserList(params);
      set({ users, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户列表失败';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchUserById: async (id) => {
    set({ loading: true, error: null });
    try {
      const user = await userService.getUserById(id);
      set({ currentUser: user, loading: false });
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户详情失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  createUser: async (data) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 600));
    const newUser: User = {
      id: `U${String(Date.now()).slice(-3)}`,
      username: data.username || '',
      password: data.password || '123456',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      role: data.role || 'buyer',
      roleName: data.roleName || '采购员',
      department: data.department || '',
      permissions: data.permissions || [],
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    set(state => ({
      users: [newUser, ...state.users],
      loading: false,
    }));
    return newUser;
  },

  updateUser: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await userService.updateUser(id, data);
      if (updatedUser) {
        set(state => ({
          users: state.users.map(u => u.id === id ? updatedUser! : u),
          currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser,
          loading: false,
        }));
      }
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新用户失败';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      users: state.users.filter(u => u.id !== id),
      loading: false,
    }));
    return { success: true, message: '删除成功' };
  },

  resetPassword: async (id, newPassword) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const result = await userService.changePassword(id, 'oldpassword', newPassword);
      set({ loading: false });
      return result;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ loading: false });
      return { success: true, message: '密码重置成功' };
    }
  },

  toggleUserStatus: async (id) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    set(state => ({
      users: state.users.map(u => {
        if (u.id === id) {
          return { ...u, status: u.status === 'active' ? 'inactive' : 'active' };
        }
        return u;
      }),
      loading: false,
    }));
    const user = get().users.find(u => u.id === id);
    return user || null;
  },

  fetchRoles: async () => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    set({ roles: mockRoles, loading: false });
  },

  updateRolePermissions: async (role, permissions) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      roles: state.roles.map(r =>
        r.role === role ? { ...r, permissions } : r
      ),
      loading: false,
    }));
    return { success: true, message: '权限更新成功' };
  },

  fetchSystemParams: async () => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ loading: false });
  },

  saveSystemParams: async (params) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ systemParams: params, loading: false });
    return { success: true, message: '系统参数保存成功' };
  },

  fetchApprovalFlows: async () => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    set({ approvalFlows: mockApprovalFlows, loading: false });
  },

  saveApprovalFlow: async (flow) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 600));
    set(state => {
      const exists = state.approvalFlows.find(f => f.id === flow.id);
      if (exists) {
        return {
          approvalFlows: state.approvalFlows.map(f => f.id === flow.id ? flow : f),
          loading: false,
        };
      }
      return {
        approvalFlows: [...state.approvalFlows, { ...flow, id: `FLOW${Date.now()}` }],
        loading: false,
      };
    });
    return { success: true, message: '审批流程保存成功' };
  },

  deleteApprovalFlow: async (id) => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    set(state => ({
      approvalFlows: state.approvalFlows.filter(f => f.id !== id),
      loading: false,
    }));
    return { success: true, message: '审批流程删除成功' };
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  clearError: () => set({ error: null }),
}));

export const settingsSelectors = {
  selectUsers: (state: SettingsState & SettingsActions) => state.users,
  selectCurrentUser: (state: SettingsState & SettingsActions) => state.currentUser,
  selectRoles: (state: SettingsState & SettingsActions) => state.roles,
  selectSystemParams: (state: SettingsState & SettingsActions) => state.systemParams,
  selectApprovalFlows: (state: SettingsState & SettingsActions) => state.approvalFlows,
  selectLoading: (state: SettingsState & SettingsActions) => state.loading,
  selectError: (state: SettingsState & SettingsActions) => state.error,
};
