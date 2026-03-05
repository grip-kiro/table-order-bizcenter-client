import { api } from './client';
import { Menu } from '../types';

interface CategoryDTO {
  id: number;
  name: string;
  displayOrder: number;
}

interface MenuResponseDTO {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  soldOut: boolean;
  deleted: boolean;
  displayOrder: number;
  categories: CategoryDTO[];
}

function mapMenu(dto: MenuResponseDTO): Menu {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price,
    description: dto.description,
    imageUrl: dto.imageUrl,
    isSoldOut: dto.soldOut,
    isDeleted: dto.deleted,
    displayOrder: dto.displayOrder,
    categories: dto.categories.map(c => ({ id: c.id, name: c.name })),
  };
}

export const menusApi = {
  list: async (storeId: number): Promise<Menu[]> => {
    const dtos = await api.get<MenuResponseDTO[]>(`/api/stores/${storeId}/menus`);
    return dtos.map(mapMenu);
  },

  create: (data: {
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    categoryIds: number[];
  }) => api.post<MenuResponseDTO>('/api/menus', data),

  update: (menuId: number, data: {
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    categoryIds: number[];
  }) => api.put<MenuResponseDTO>(`/api/menus/${menuId}`, data),

  delete: (menuId: number) =>
    api.delete<void>(`/api/menus/${menuId}`),

  toggleSoldOut: (menuId: number, soldOut: boolean) =>
    api.patch<void>(`/api/menus/${menuId}/sold-out`, { soldOut }),

  updateOrder: (items: { id: number; displayOrder: number }[]) =>
    api.patch<void>('/api/menus/order', { items }),
};
