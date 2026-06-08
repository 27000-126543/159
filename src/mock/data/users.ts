export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'admin' | 'buyer' | 'manager' | 'finance' | 'quality';
  roleName: string;
  department: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt: string;
}

export const users: User[] = [
  {
    id: 'U001',
    username: 'admin',
    password: 'admin123',
    name: '张建国',
    email: 'zhangjg@company.com',
    phone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
    roleName: '系统管理员',
    department: '信息技术部',
    permissions: ['all'],
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T09:30:00Z',
  },
  {
    id: 'U002',
    username: 'buyer1',
    password: 'buyer123',
    name: '李明华',
    email: 'limh@company.com',
    phone: '13800138002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer1',
    role: 'buyer',
    roleName: '采购员',
    department: '采购部',
    permissions: ['inquiry:create', 'inquiry:view', 'order:create', 'order:view', 'supplier:view'],
    status: 'active',
    createdAt: '2023-02-15T00:00:00Z',
    lastLoginAt: '2024-01-15T08:45:00Z',
  },
  {
    id: 'U003',
    username: 'manager1',
    password: 'manager123',
    name: '王芳',
    email: 'wangf@company.com',
    phone: '13800138003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager1',
    role: 'manager',
    roleName: '采购经理',
    department: '采购部',
    permissions: ['inquiry:approve', 'order:approve', 'supplier:audit', 'dashboard:view', 'report:export'],
    status: 'active',
    createdAt: '2023-01-20T00:00:00Z',
    lastLoginAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'U004',
    username: 'finance1',
    password: 'finance123',
    name: '陈静',
    email: 'chenj@company.com',
    phone: '13800138004',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=finance1',
    role: 'finance',
    roleName: '财务专员',
    department: '财务部',
    permissions: ['settlement:view', 'settlement:approve', 'payment:process', 'invoice:manage'],
    status: 'active',
    createdAt: '2023-03-10T00:00:00Z',
    lastLoginAt: '2024-01-14T16:30:00Z',
  },
  {
    id: 'U005',
    username: 'quality1',
    password: 'quality123',
    name: '赵伟',
    email: 'zhaow@company.com',
    phone: '13800138005',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=quality1',
    role: 'quality',
    roleName: '质检专员',
    department: '质量部',
    permissions: ['quality:create', 'quality:view', 'quality:approve', 'return:process'],
    status: 'active',
    createdAt: '2023-04-05T00:00:00Z',
    lastLoginAt: '2024-01-15T11:20:00Z',
  },
];

export const usersData = users;
export default users;
