import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Shield,
  Settings as SettingsIcon,
  Workflow,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Save,
  X,
  ChevronRight,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  GripVertical,
  TrendingUp,
  BarChart3,
  ShoppingCart,
  FileText,
  Package,
  CreditCard,
  UserCheck,
  Building2,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { formatDate } from '@/utils/format';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { TableColumn } from '@/components/ui/Table';
import StatusBadge from '@/components/business/StatusBadge';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FilterPanel from '@/components/business/FilterPanel';
import Timeline from '@/components/business/Timeline';
import { UserRole } from '@/types';
import { User } from '@/mock/data/users';

interface ExtendedUser extends Omit<User, 'role'> {
  role: UserRole;
}
import { RolePermission, ApprovalFlowConfig, ApprovalFlowNode, SystemParams } from '@/store/settingsStore';

const settingsTabs = [
  { key: 'users', label: '用户管理', icon: <Users className="w-5 h-5" /> },
  { key: 'roles', label: '角色权限', icon: <Shield className="w-5 h-5" /> },
  { key: 'params', label: '系统参数', icon: <SettingsIcon className="w-5 h-5" /> },
  { key: 'approval', label: '审批流程配置', icon: <Workflow className="w-5 h-5" /> },
];

const roleIcons: Record<string, React.ReactNode> = {
  supplier: <Package className="w-5 h-5" />,
  buyer: <ShoppingCart className="w-5 h-5" />,
  manager: <UserCheck className="w-5 h-5" />,
  director: <BarChart3 className="w-5 h-5" />,
  ceo: <TrendingUp className="w-5 h-5" />,
};

const permissionLabels: Record<string, string> = {
  'inquiry:view': '查看询价单',
  'inquiry:create': '创建询价单',
  'inquiry:edit': '编辑询价单',
  'quote:create': '创建报价单',
  'quote:view': '查看报价单',
  'negotiation:initiate': '发起议价',
  'negotiation:view': '查看议价',
  'order:create': '创建订单',
  'order:view': '查看订单',
  'order:approve': '审批订单',
  'order:approve_high': '高级订单审批',
  'order:approve_large': '大额订单审批',
  'supplier:view': '查看供应商',
  'supplier:contact': '联系供应商',
  'supplier:audit': '审核供应商',
  'supplier:manage': '管理供应商',
  'quality:view': '查看质检',
  'settlement:view': '查看结算',
  'category:manage': '管理品类',
  'category:manage_all': '管理所有品类',
  'dashboard:view': '查看仪表盘',
  'dashboard:view_all': '查看所有仪表盘',
  'dashboard:global': '全局数据看板',
  'report:view': '查看报表',
  'report:export': '导出报表',
  'buyer:manage': '管理采购员',
  'budget:manage': '管理预算',
  'strategy:view': '查看战略数据',
  'all': '全部权限',
  'system:configure': '系统配置',
  'user:manage': '用户管理',
  'role:manage': '角色管理',
  'approval:configure': '审批配置',
  'finance:view': '财务视图',
};

export default function SettingsPage() {
  const {
    users,
    roles,
    systemParams,
    approvalFlows,
    loading,
    fetchUsers,
    fetchRoles,
    fetchApprovalFlows,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    toggleUserStatus,
    updateRolePermissions,
    saveSystemParams,
    saveApprovalFlow,
    deleteApprovalFlow,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [currentRole, setCurrentRole] = useState<RolePermission | null>(null);
  const [currentFlow, setCurrentFlow] = useState<ApprovalFlowConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userForm, setUserForm] = useState<Partial<ExtendedUser>>({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'buyer',
    roleName: '采购员',
    department: '',
    status: 'active',
  });
  const [newPassword, setNewPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [paramsForm, setParamsForm] = useState<SystemParams>(systemParams);
  const [flowForm, setFlowForm] = useState<Partial<ApprovalFlowConfig>>({
    name: '',
    description: '',
    timeoutEscalation: true,
    timeoutHours: 24,
    nodes: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchApprovalFlows();
  }, []);

  useEffect(() => {
    setParamsForm(systemParams);
  }, [systemParams]);

  const handleAddUser = () => {
    setIsEditing(false);
    setUserForm({
      username: '',
      name: '',
      email: '',
      phone: '',
      role: 'buyer',
      roleName: '采购员',
      department: '',
      status: 'active',
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: ExtendedUser) => {
    setIsEditing(true);
    setCurrentUser(user);
    setUserForm({ ...user });
    setShowUserModal(true);
  };

  const handleSubmitUser = async () => {
    if (isEditing && currentUser) {
      await updateUser(currentUser.id, userForm as Partial<User>);
    } else {
      await createUser(userForm as Partial<User>);
    }
    setShowUserModal(false);
    fetchUsers();
  };

  const handleDeleteUser = (user: ExtendedUser) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (currentUser) {
      await deleteUser(currentUser.id);
      setShowDeleteModal(false);
      fetchUsers();
    }
  };

  const handleResetPassword = (user: ExtendedUser) => {
    setCurrentUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const confirmResetPassword = async () => {
    if (currentUser && newPassword) {
      await resetPassword(currentUser.id, newPassword);
      setShowPasswordModal(false);
    }
  };

  const handleToggleStatus = async (user: ExtendedUser) => {
    await toggleUserStatus(user.id);
    fetchUsers();
  };

  const handleEditRole = (role: RolePermission) => {
    setCurrentRole(role);
    setSelectedPermissions([...role.permissions]);
    setShowRoleModal(true);
  };

  const handleSaveRolePermissions = async () => {
    if (currentRole) {
      await updateRolePermissions(currentRole.role, selectedPermissions);
      setShowRoleModal(false);
      fetchRoles();
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  const handleSaveParams = async () => {
    await saveSystemParams(paramsForm);
  };

  const handleAddFlow = () => {
    setIsEditing(false);
    setCurrentFlow(null);
    setFlowForm({
      name: '',
      description: '',
      timeoutEscalation: true,
      timeoutHours: 24,
      nodes: [
        { id: 'n1', role: 'manager', roleName: '采购经理', minAmount: 0, maxAmount: 100000, order: 1, required: true },
      ],
    });
    setShowFlowModal(true);
  };

  const handleEditFlow = (flow: ApprovalFlowConfig) => {
    setIsEditing(true);
    setCurrentFlow(flow);
    setFlowForm({ ...flow });
    setShowFlowModal(true);
  };

  const handleAddFlowNode = () => {
    const newNode: ApprovalFlowNode = {
      id: `n${Date.now()}`,
      role: 'manager',
      roleName: '采购经理',
      minAmount: 0,
      maxAmount: 100000,
      order: (flowForm.nodes?.length || 0) + 1,
      required: true,
    };
    setFlowForm(prev => ({
      ...prev,
      nodes: [...(prev.nodes || []), newNode],
    }));
  };

  const handleRemoveFlowNode = (nodeId: string) => {
    setFlowForm(prev => ({
      ...prev,
      nodes: prev.nodes?.filter(n => n.id !== nodeId),
    }));
  };

  const handleUpdateFlowNode = (nodeId: string, updates: Partial<ApprovalFlowNode>) => {
    setFlowForm(prev => ({
      ...prev,
      nodes: prev.nodes?.map(n =>
        n.id === nodeId ? { ...n, ...updates } : n
      ),
    }));
  };

  const handleSaveFlow = async () => {
    if (flowForm.name && flowForm.nodes && flowForm.nodes.length > 0) {
      const flowToSave: ApprovalFlowConfig = {
        id: currentFlow?.id || `FLOW${Date.now()}`,
        name: flowForm.name,
        description: flowForm.description || '',
        timeoutEscalation: flowForm.timeoutEscalation ?? true,
        timeoutHours: flowForm.timeoutHours ?? 24,
        nodes: flowForm.nodes,
      };
      await saveApprovalFlow(flowToSave);
      setShowFlowModal(false);
      fetchApprovalFlows();
    }
  };

  const handleDeleteFlow = async (id: string) => {
    if (confirm('确定要删除此审批流程吗？')) {
      await deleteApprovalFlow(id);
      fetchApprovalFlows();
    }
  };

  const handleFilter = (values: Record<string, unknown>) => {
    fetchUsers(values as { role?: string; status?: string; keyword?: string });
  };

  const handleSearch = (keyword: string) => {
    fetchUsers({ keyword });
  };

  const filterFields = useMemo(() => [
    {
      key: 'role',
      label: '角色',
      type: 'select' as const,
      options: [
        { label: '采购员', value: 'buyer' },
        { label: '采购经理', value: 'manager' },
        { label: '采购总监', value: 'director' },
        { label: '财务', value: 'finance' },
        { label: '质检', value: 'quality' },
        { label: '供应商', value: 'supplier' },
        { label: 'CEO', value: 'ceo' },
      ],
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ],
    },
  ], []);

  const userColumns: TableColumn<ExtendedUser>[] = [
    {
      key: 'avatar',
      title: '头像',
      width: 60,
      render: (_, record) => (
        <img
          src={record.avatar}
          alt={record.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    {
      key: 'username',
      title: '用户名',
      dataIndex: 'username',
      sortable: true,
      render: (value) => <span className="font-medium text-primary-600">{value as string}</span>,
    },
    {
      key: 'name',
      title: '姓名',
      dataIndex: 'name',
    },
    {
      key: 'email',
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      key: 'roleName',
      title: '角色',
      dataIndex: 'roleName',
      render: (value) => (
        <Badge variant="primary" className="bg-primary-100 text-primary-700">
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'department',
      title: '部门',
      dataIndex: 'department',
      render: (value) => <span>{String(value || '-')}</span>,
    },
    {
      key: 'region',
      title: '区域',
      render: () => '-',
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'default'} dot>
          {value === 'active' ? '启用' : '禁用'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: '创建时间',
      dataIndex: 'createdAt',
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: 'actions',
      title: '操作',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Key className="w-4 h-4 text-primary-500" />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={record.status === 'active' ? <EyeOff className="w-4 h-4 text-warning-500" /> : <Eye className="w-4 h-4 text-success-500" />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4 text-danger-500" />}
            onClick={() => handleDeleteUser(record)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const allPermissions = useMemo(() => {
    const perms = new Set<string>();
    roles.forEach(r => r.permissions.forEach(p => perms.add(p)));
    return Array.from(perms);
  }, [roles]);

  const getRoleLevelColor = (level: number) => {
    const colors = [
      'from-slate-400 to-slate-500',
      'from-blue-400 to-blue-500',
      'from-green-400 to-green-500',
      'from-purple-400 to-purple-500',
      'from-amber-400 to-amber-500',
    ];
    return colors[level - 1] || colors[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">系统设置</h1>
        {activeTab === 'users' && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddUser}
          >
            新增用户
          </Button>
        )}
        {activeTab === 'approval' && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddFlow}
          >
            新增流程
          </Button>
        )}
      </div>

      <div className="flex gap-6">
        <Card padding="none" className="w-64 flex-shrink-0">
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">设置菜单</h3>
            <nav className="space-y-1">
              {settingsTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.key
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.key && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </Card>

        <div className="flex-1">
          {activeTab === 'users' && (
            <Card padding="none">
              <div className="p-4">
                <FilterPanel
                  fields={filterFields}
                  onFilter={handleFilter}
                  onReset={() => fetchUsers()}
                  onSearch={handleSearch}
                  searchPlaceholder="搜索用户名、姓名、邮箱..."
                />
              </div>
              <div className="px-4 pb-4">
                <Table
                  columns={userColumns}
                  dataSource={users as ExtendedUser[]}
                  loading={loading}
                  rowKey="id"
                  size="small"
                />
              </div>
            </Card>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              {roles.map(role => (
                <Card key={role.role} className="overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0',
                      getRoleLevelColor(role.level)
                    )}>
                      {roleIcons[role.role] || <Shield className="w-8 h-8" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">{role.roleName}</h3>
                        <Badge variant="outline">等级 {role.level}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{role.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {role.permissions.slice(0, 8).map(perm => (
                          <Badge key={perm} variant="secondary" size="sm">
                            {permissionLabels[perm] || perm}
                          </Badge>
                        ))}
                        {role.permissions.length > 8 && (
                          <Badge variant="default" size="sm">
                            +{role.permissions.length - 8} 更多
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => handleEditRole(role)}
                    >
                      配置权限
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'params' && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">系统参数配置</h3>
              <div className="max-w-2xl space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    审批超时时间（小时）
                  </label>
                  <Input
                    type="number"
                    value={paramsForm.approvalTimeoutHours}
                    onChange={(e) => setParamsForm(prev => ({ ...prev, approvalTimeoutHours: parseInt(e.target.value) || 0 }))}
                    placeholder="默认24小时"
                  />
                  <p className="text-xs text-slate-500 mt-1">审批节点超时后，系统将自动提醒或越级审批</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    自动越级开关
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setParamsForm(prev => ({ ...prev, autoEscalation: !prev.autoEscalation }))}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        paramsForm.autoEscalation ? 'bg-primary-500' : 'bg-slate-300'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          paramsForm.autoEscalation ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                    <span className="text-sm text-slate-600">
                      {paramsForm.autoEscalation ? '已开启' : '已关闭'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">开启后，审批超时将自动提交给上一级审批人</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    大额订单阈值（万元）
                  </label>
                  <Input
                    type="number"
                    value={paramsForm.largeOrderThreshold}
                    onChange={(e) => setParamsForm(prev => ({ ...prev, largeOrderThreshold: parseInt(e.target.value) || 0 }))}
                    placeholder="默认10万元"
                  />
                  <p className="text-xs text-slate-500 mt-1">超过此金额的订单将标记为大额订单，需要更高级别审批</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    信用期默认天数
                  </label>
                  <Input
                    type="number"
                    value={paramsForm.defaultCreditPeriodDays}
                    onChange={(e) => setParamsForm(prev => ({ ...prev, defaultCreditPeriodDays: parseInt(e.target.value) || 0 }))}
                    placeholder="默认30天"
                  />
                  <p className="text-xs text-slate-500 mt-1">新建供应商时的默认信用期天数</p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button
                    variant="primary"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveParams}
                  >
                    保存设置
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'approval' && (
            <div className="space-y-4">
              {approvalFlows.map(flow => (
                <Card key={flow.id} className="overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">{flow.name}</h3>
                        {flow.timeoutEscalation && (
                          <Badge variant="warning" size="sm">
                            <Clock className="w-3 h-3 mr-1" />
                            超时越级 ({flow.timeoutHours}h)
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{flow.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => handleEditFlow(flow)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4 text-danger-500" />}
                        onClick={() => handleDeleteFlow(flow.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                      {flow.nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center gap-4">
                          <div className="text-center min-w-[140px]">
                            <div className="w-14 h-14 rounded-full bg-white border-2 border-primary-200 flex items-center justify-center mx-auto mb-2 shadow-sm">
                              {roleIcons[node.role] || <UserCheck className="w-6 h-6 text-primary-500" />}
                            </div>
                            <p className="font-medium text-slate-900 text-sm">{node.roleName}</p>
                            <p className="text-xs text-slate-500">
                              {node.minAmount > 0 ? `${node.minAmount.toLocaleString()}元` : '0元'} - {node.maxAmount === Infinity ? '无限' : `${node.maxAmount.toLocaleString()}元`}
                            </p>
                            {index > 0 && (
                              <Badge variant="outline" size="sm" className="mt-1">
                                ≥{flow.nodes[index - 1].maxAmount?.toLocaleString()}元
                              </Badge>
                            )}
                          </div>
                          {index < flow.nodes.length - 1 && (
                            <div className="flex items-center gap-1 text-slate-300">
                              <div className="w-8 h-0.5 bg-slate-300" />
                              <ChevronRight className="w-5 h-5" />
                              <div className="w-8 h-0.5 bg-slate-300" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={isEditing ? '编辑用户' : '新增用户'}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmitUser}>
              {isEditing ? '保存修改' : '创建用户'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="用户名"
            value={userForm.username || ''}
            onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
            placeholder="请输入用户名"
          />
          <Input
            label="姓名"
            value={userForm.name || ''}
            onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="请输入姓名"
          />
          <Input
            label="邮箱"
            type="email"
            value={userForm.email || ''}
            onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="请输入邮箱"
          />
          <Input
            label="手机号"
            value={userForm.phone || ''}
            onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="请输入手机号"
          />
          <Select
            label="角色"
            value={userForm.role || 'buyer'}
            onChange={(e) => {
              const roleValue = e.target.value as UserRole;
              const roleMap: Record<string, string> = {
                buyer: '采购员',
                manager: '采购经理',
                director: '采购总监',
                ceo: 'CEO',
                finance: '财务专员',
                quality: '质检专员',
                supplier: '供应商',
              };
              setUserForm(prev => ({
                ...prev,
                role: roleValue,
                roleName: roleMap[roleValue] || '采购员',
              }));
            }}
            options={[
              { label: '采购员', value: 'buyer' },
              { label: '采购经理', value: 'manager' },
              { label: '采购总监', value: 'director' },
              { label: 'CEO', value: 'ceo' },
              { label: '财务专员', value: 'finance' },
              { label: '质检专员', value: 'quality' },
              { label: '供应商', value: 'supplier' },
            ]}
          />
          <Input
            label="部门"
            value={userForm.department || ''}
            onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
            placeholder="请输入部门"
          />
          {!isEditing && (
            <Input
              label="初始密码"
              type="password"
              value={userForm.password || ''}
              onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="请输入初始密码"
            />
          )}
        </div>
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除用户"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmDeleteUser}>
              确认删除
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-danger-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-danger-800">确认删除此用户？</p>
              <p className="text-sm text-danger-600 mt-1">
                用户：{currentUser?.name}（{currentUser?.username}）
              </p>
              <p className="text-sm text-danger-600">
                删除后将无法恢复，请谨慎操作。
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="重置密码"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={confirmResetPassword}>
              确认重置
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              为用户 <span className="font-medium text-slate-900">{currentUser?.name}</span> 重置密码
            </p>
          </div>
          <Input
            label="新密码"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="请输入新密码"
          />
        </div>
      </Modal>

      <Modal
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={`配置权限 - ${currentRole?.roleName}`}
        width="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSaveRolePermissions}>
              保存权限
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-600">
              <Shield className="w-4 h-4 inline mr-1" />
              角色等级：{currentRole?.level} | 描述：{currentRole?.description}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3">权限列表</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allPermissions.map(perm => (
                <label
                  key={perm}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                    selectedPermissions.includes(perm)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">
                    {permissionLabels[perm] || perm}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              已选择 <span className="font-medium text-primary-600">{selectedPermissions.length}</span> 项权限
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPermissions(allPermissions)}
              >
                全选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPermissions([])}
              >
                清空
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showFlowModal}
        onClose={() => setShowFlowModal(false)}
        title={isEditing ? '编辑审批流程' : '新增审批流程'}
        width="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowFlowModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSaveFlow}>
              保存流程
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="流程名称"
              value={flowForm.name || ''}
              onChange={(e) => setFlowForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入流程名称"
            />
            <Input
              label="超时时间（小时）"
              type="number"
              value={flowForm.timeoutHours || 24}
              onChange={(e) => setFlowForm(prev => ({ ...prev, timeoutHours: parseInt(e.target.value) || 24 }))}
              placeholder="24"
            />
          </div>

          <Input
            label="流程描述"
            value={flowForm.description || ''}
            onChange={(e) => setFlowForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="请输入流程描述"
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flowForm.timeoutEscalation ?? true}
                onChange={(e) => setFlowForm(prev => ({ ...prev, timeoutEscalation: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">启用超时越级</span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-900">审批节点配置</h4>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddFlowNode}
              >
                添加节点
              </Button>
            </div>

            <div className="space-y-3">
              {flowForm.nodes?.map((node, index) => (
                <div
                  key={node.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <GripVertical className="w-5 h-5 text-slate-400 cursor-move" />
                  <Badge variant="primary" className="w-8 h-8 flex items-center justify-center rounded-full p-0">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <Select
                      label="审批角色"
                      value={node.role}
                      onChange={(e) => {
                        const roleValue = e.target.value as UserRole;
                        const roleMap: Record<string, string> = {
                          manager: '采购经理',
                          director: '采购总监',
                          ceo: 'CEO',
                          finance: '财务专员',
                        };
                        handleUpdateFlowNode(node.id, {
                          role: roleValue,
                          roleName: roleMap[roleValue] || '采购经理',
                        });
                      }}
                      options={[
                        { label: '采购经理', value: 'manager' },
                        { label: '采购总监', value: 'director' },
                        { label: 'CEO', value: 'ceo' },
                        { label: '财务专员', value: 'finance' },
                      ]}
                      wrapperClassName="flex-1"
                    />
                    <Input
                      label="最低金额（元）"
                      type="number"
                      value={node.minAmount}
                      onChange={(e) => handleUpdateFlowNode(node.id, { minAmount: parseFloat(e.target.value) || 0 })}
                      wrapperClassName="flex-1"
                    />
                    <Input
                      label="最高金额（元）"
                      type="number"
                      value={node.maxAmount === Infinity ? '' : node.maxAmount}
                      onChange={(e) => handleUpdateFlowNode(node.id, {
                        maxAmount: e.target.value === '' ? Infinity : parseFloat(e.target.value) || 0
                      })}
                      placeholder="无限"
                      wrapperClassName="flex-1"
                    />
                  </div>
                  {flowForm.nodes && flowForm.nodes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<X className="w-4 h-4 text-danger-500" />}
                      onClick={() => handleRemoveFlowNode(node.id)}
                    />
                  )}
                </div>
              ))}
            </div>

            {flowForm.nodes && flowForm.nodes.length === 0 && (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                <Workflow className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无审批节点，请点击上方"添加节点"按钮</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
