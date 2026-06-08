import { userService } from '../services/userService';
import type { User } from '../data/users';

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    return await userService.getCurrentUser();
  } catch {
    return null;
  }
};

export const applyInquiryPermissionFilter = async <T extends {
  category: string;
  department: string;
  quotes?: Array<{ supplierId: string }>;
}>(list: T[]): Promise<T[]> => {
  const user = await getCurrentUser();
  if (!user) return list;

  switch (user.role) {
    case 'ceo':
    case 'admin':
    case 'finance':
    case 'quality':
      return list;

    case 'supplier':
      if (!user.supplierId) return [];
      return list.filter(inquiry =>
        inquiry.quotes?.some(quote => quote.supplierId === user.supplierId)
      );

    case 'buyer':
      if (!user.categories || user.categories.length === 0) return [];
      return list.filter(inquiry =>
        user.categories!.includes(inquiry.category)
      );

    case 'manager':
      if (!user.department) return list;
      return list.filter(inquiry =>
        inquiry.department === user.department
      );

    case 'director':
      return list;

    default:
      return list;
  }
};

export const applyOrderPermissionFilter = async <T extends {
  category: string;
  department: string;
  supplierId: string;
}>(list: T[]): Promise<T[]> => {
  const user = await getCurrentUser();
  if (!user) return list;

  switch (user.role) {
    case 'ceo':
    case 'admin':
    case 'finance':
    case 'quality':
      return list;

    case 'supplier':
      if (!user.supplierId) return [];
      return list.filter(order => order.supplierId === user.supplierId);

    case 'buyer':
      if (!user.categories || user.categories.length === 0) return [];
      return list.filter(order =>
        user.categories!.includes(order.category)
      );

    case 'manager':
      if (!user.department) return list;
      return list.filter(order =>
        order.department === user.department
      );

    case 'director':
      return list;

    default:
      return list;
  }
};

export const applySupplierPermissionFilter = async <T extends {
  id: string;
  category: string;
  country: string;
}>(list: T[]): Promise<T[]> => {
  const user = await getCurrentUser();
  if (!user) return list;

  switch (user.role) {
    case 'ceo':
    case 'admin':
    case 'finance':
    case 'quality':
    case 'director':
    case 'manager':
    case 'buyer':
      return list;

    case 'supplier':
      if (!user.supplierId) return [];
      return list.filter(supplier => supplier.id === user.supplierId);

    default:
      return list;
  }
};
