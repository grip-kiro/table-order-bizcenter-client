import { api } from './client';
import { RestaurantTable } from '../types';

// Server DTO types
interface TableResponseDTO {
  id: number;
  tableNumber: number;
  status: 'AVAILABLE' | 'OCCUPIED';
  currentSessionId: string | null;
  totalOrderAmount: number;
  orderCount: number;
}

function mapTable(dto: TableResponseDTO): RestaurantTable {
  return {
    id: dto.id,
    tableNumber: dto.tableNumber,
    pin: '', // server doesn't return pin
    status: dto.status,
    currentSessionId: dto.currentSessionId,
    totalAmount: dto.totalOrderAmount,
    orderCount: dto.orderCount,
    createdAt: '',
  };
}

export const tablesApi = {
  list: async (storeId: number): Promise<RestaurantTable[]> => {
    const dtos = await api.get<TableResponseDTO[]>(`/api/stores/${storeId}/tables`);
    return dtos.map(mapTable);
  },

  create: (tableNumber: number, pin: string) =>
    api.post<TableResponseDTO>('/api/tables', { tableNumber, pin }),

  update: (tableId: number, tableNumber: number, pin: string) =>
    api.put<TableResponseDTO>(`/api/tables/${tableId}`, { tableNumber, pin }),

  delete: (tableId: number) =>
    api.delete<void>(`/api/tables/${tableId}`),

  complete: (tableId: number) =>
    api.post<void>(`/api/tables/${tableId}/complete`),
};
