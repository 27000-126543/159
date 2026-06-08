import { usersData, User } from '../data/users';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export const userService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    await delay(800);
    
    const user = usersData.find(
      u => u.username === request.username && u.password === request.password
    );
    
    if (!user) {
      return {
        success: false,
        message: '用户名或密码错误'
      };
    }
    
    if (user.status !== 'active') {
      return {
        success: false,
        message: '账户已被禁用，请联系管理员'
      };
    }
    
    const token = `mock-token-${Date.now()}-${user.id}`;
    
    return {
      success: true,
      message: '登录成功',
      token,
      user
    };
  },
  
  async getCurrentUser(): Promise<User | null> {
    await delay(500);
    
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    const userId = token.split('-').pop();
    const user = usersData.find(u => u.id === userId);
    
    return user || null;
  },
  
  async getUserById(id: string): Promise<User | null> {
    await delay(300);
    const user = usersData.find(u => u.id === id);
    return user || null;
  },
  
  async getUserList(params?: {
    role?: string;
    status?: string;
    keyword?: string;
  }): Promise<User[]> {
    await delay(500);
    
    let result = [...usersData];
    
    if (params?.role) {
      result = result.filter(u => u.role === params.role);
    }
    
    if (params?.status) {
      result = result.filter(u => u.status === params.status);
    }
    
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase();
      result = result.filter(
        u => u.name.toLowerCase().includes(keyword) ||
             u.username.toLowerCase().includes(keyword) ||
             u.email.toLowerCase().includes(keyword)
      );
    }
    
    return result;
  },
  
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await delay(600);
    
    const index = usersData.findIndex(u => u.id === id);
    if (index === -1) {
      return null;
    }
    
    usersData[index] = { ...usersData[index], ...data, lastLoginAt: new Date().toISOString() };
    return usersData[index];
  },
  
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    const user = usersData.find(u => u.id === id);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    if (user.password !== oldPassword) {
      return { success: false, message: '原密码错误' };
    }
    
    user.password = newPassword;
    return { success: true, message: '密码修改成功' };
  },
  
  async logout(): Promise<{ success: boolean; message: string }> {
    await delay(300);
    localStorage.removeItem('token');
    return { success: true, message: '退出登录成功' };
  }
};
