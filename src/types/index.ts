// OrderStatus: 서버는 영문, 화면 표시는 한글 매핑
export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '대기중',
  PREPARING: '준비중',
  COMPLETED: '완료',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export const TABLE_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: '비어있음',
  OCCUPIED: '이용중',
};

export type TableStatus = 'AVAILABLE' | 'OCCUPIED';

export interface Store {
  id: number;
  name: string;
  address: string;
}

export interface AdminUser {
  id: number;
  storeId: number;
  username: string;
}

export interface AdminSession {
  storeId: number;
  adminId: number;
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RestaurantTable {
  id: number;
  tableNumber: number;
  pin: string;
  status: TableStatus;
  currentSessionId: string | null;
  totalAmount: number;
  orderCount: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  isSoldOut: boolean;
  isDeleted: boolean;
  displayOrder: number;
  categories: { id: number; name: string }[];
}

export interface OrderItem {
  id: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  storeId: number;
  tableId: number;
  tableNumber: number;
  sessionId: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistory {
  id: number;
  originalOrderId: number;
  tableId: number;
  tableNumber: number;
  sessionId: string;
  totalAmount: number;
  status: OrderStatus;
  orderedAt: string;
  completedAt: string;
  items: OrderHistoryItem[];
}

export interface OrderHistoryItem {
  id: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface OrderCreatedEvent {
  orderId: number;
  tableId: number;
  tableNumber: number;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}
