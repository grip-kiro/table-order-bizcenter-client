import { api } from './client';
import { Order, OrderItem, OrderStatus, OrderHistory } from '../types';

interface OrderItemDTO {
  id: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderDTO {
  id: number;
  tableId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemDTO[];
}

interface TableOrdersDTO {
  tableId: number;
  tableNumber: number;
  totalAmount: number;
  orders: OrderDTO[];
}

interface OrderHistoryItemDTO {
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderHistoryDTO {
  id: number;
  originalOrderId: number;
  totalAmount: number;
  status: OrderStatus;
  orderedAt: string;
  completedAt: string;
  items: OrderHistoryItemDTO[];
}

function mapOrder(dto: OrderDTO, tableNumber: number): Order {
  return {
    id: dto.id,
    storeId: 0,
    tableId: dto.tableId,
    tableNumber,
    sessionId: '',
    totalAmount: dto.totalAmount,
    status: dto.status,
    items: dto.items.map(mapOrderItem),
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
  };
}

function mapOrderItem(dto: OrderItemDTO): OrderItem {
  return {
    id: dto.id,
    menuId: dto.menuId,
    menuName: dto.menuName,
    quantity: dto.quantity,
    unitPrice: dto.unitPrice,
    subtotal: dto.subtotal,
  };
}

function mapHistory(dto: OrderHistoryDTO): OrderHistory {
  return {
    id: dto.id,
    originalOrderId: dto.originalOrderId,
    tableId: 0,
    tableNumber: 0,
    sessionId: '',
    totalAmount: dto.totalAmount,
    status: dto.status,
    orderedAt: dto.orderedAt,
    completedAt: dto.completedAt,
    items: dto.items.map(i => ({
      id: 0,
      menuId: i.menuId,
      menuName: i.menuName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
  };
}

export const ordersApi = {
  getTableOrders: async (tableId: number): Promise<{ tableNumber: number; totalAmount: number; orders: Order[] }> => {
    const dto = await api.get<TableOrdersDTO>(`/api/admin/tables/${tableId}/orders`);
    return {
      tableNumber: dto.tableNumber,
      totalAmount: dto.totalAmount,
      orders: dto.orders.map(o => mapOrder(o, dto.tableNumber)),
    };
  },

  updateStatus: (orderId: number, status: OrderStatus) =>
    api.patch<void>(`/api/admin/orders/${orderId}/status`, { status }),

  delete: (orderId: number) =>
    api.delete<void>(`/api/admin/orders/${orderId}`),

  getHistory: async (tableId: number, dateFrom?: string, dateTo?: string): Promise<OrderHistory[]> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    const query = params.toString();
    const url = `/api/admin/tables/${tableId}/history${query ? `?${query}` : ''}`;
    const dtos = await api.get<OrderHistoryDTO[]>(url);
    return dtos.map(mapHistory);
  },
};
