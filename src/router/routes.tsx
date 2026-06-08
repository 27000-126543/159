import React from 'react';
import { UserRole } from '@/types';

const Login = React.lazy(() => import('@/pages/Login'));
const Forbidden = React.lazy(() => import('@/pages/Forbidden'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Home = React.lazy(() => import('@/pages/Home'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Suppliers = React.lazy(() => import('@/pages/Suppliers'));
const SupplierRegister = React.lazy(() => import('@/pages/SupplierRegister'));
const SupplierDetail = React.lazy(() => import('@/pages/SupplierDetail'));
const Inquiries = React.lazy(() => import('@/pages/Inquiries'));
const InquiryDetail = React.lazy(() => import('@/pages/InquiryDetail'));
const Orders = React.lazy(() => import('@/pages/Orders'));
const OrderDetail = React.lazy(() => import('@/pages/OrderDetail'));
const Approval = React.lazy(() => import('@/pages/Approval'));
const Customs = React.lazy(() => import('@/pages/Customs'));
const Logistics = React.lazy(() => import('@/pages/Logistics'));
const Quality = React.lazy(() => import('@/pages/Quality'));
const Settlement = React.lazy(() => import('@/pages/Settlement'));
const Settings = React.lazy(() => import('@/pages/Settings'));

export interface AppRoute {
  path: string;
  name: string;
  element: React.ReactNode;
  permission?: UserRole[];
  public?: boolean;
  children?: AppRoute[];
}

export const routes: AppRoute[] = [
  {
    path: '/login',
    name: '登录',
    element: <Login />,
    public: true,
  },
  {
    path: '/403',
    name: '无权限',
    element: <Forbidden />,
    public: true,
  },
  {
    path: '/404',
    name: '页面不存在',
    element: <NotFound />,
    public: true,
  },
  {
    path: '/',
    name: '首页',
    element: <Home />,
    permission: ['buyer', 'manager', 'director', 'ceo'],
  },
  {
    path: '/dashboard',
    name: '首页大屏',
    element: <Dashboard />,
    permission: ['buyer', 'manager', 'director', 'ceo'],
  },
  {
    path: '/suppliers',
    name: '供应商列表',
    element: <Suppliers />,
    permission: ['buyer', 'manager', 'director', 'ceo'],
  },
  {
    path: '/suppliers/register',
    name: '供应商入驻',
    element: <SupplierRegister />,
    permission: ['supplier'],
  },
  {
    path: '/suppliers/:id',
    name: '供应商详情',
    element: <SupplierDetail />,
    permission: ['buyer', 'manager', 'director', 'ceo'],
  },
  {
    path: '/inquiries',
    name: '询价单列表',
    element: <Inquiries />,
    permission: ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance'],
  },
  {
    path: '/inquiries/:id',
    name: '询价详情',
    element: <InquiryDetail />,
    permission: ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance'],
  },
  {
    path: '/orders',
    name: '订单列表',
    element: <Orders />,
    permission: ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance'],
  },
  {
    path: '/orders/:id',
    name: '订单详情',
    element: <OrderDetail />,
    permission: ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance'],
  },
  {
    path: '/approval',
    name: '审批中心',
    element: <Approval />,
    permission: ['manager', 'director', 'ceo', 'finance'],
  },
  {
    path: '/customs',
    name: '报关管理',
    element: <Customs />,
    permission: ['buyer', 'manager', 'director', 'ceo'],
  },
  {
    path: '/logistics',
    name: '物流计划',
    element: <Logistics />,
    permission: ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance'],
  },
  {
    path: '/quality',
    name: '质检管理',
    element: <Quality />,
    permission: ['supplier', 'buyer', 'manager', 'director', 'ceo', 'finance'],
  },
  {
    path: '/settlement',
    name: '结算中心',
    element: <Settlement />,
    permission: ['finance', 'manager', 'director', 'ceo', 'supplier'],
  },
  {
    path: '/settings',
    name: '系统设置',
    element: <Settings />,
    permission: ['ceo'],
  },
  {
    path: '*',
    name: '404',
    element: <NotFound />,
    public: true,
  },
];
