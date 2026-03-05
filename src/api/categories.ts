import { api } from './client';
import { Category } from '../types';

interface CategoryResponseDTO {
  id: number;
  name: string;
  displayOrder: number;
}

function mapCategory(dto: CategoryResponseDTO): Category {
  return { id: dto.id, name: dto.name, displayOrder: dto.displayOrder };
}

export const categoriesApi = {
  list: async (storeId: number): Promise<Category[]> => {
    const dtos = await api.get<CategoryResponseDTO[]>(`/api/stores/${storeId}/categories`);
    return dtos.map(mapCategory);
  },

  create: (name: string) =>
    api.post<CategoryResponseDTO>('/api/categories', { name }),

  update: (categoryId: number, name: string) =>
    api.put<CategoryResponseDTO>(`/api/categories/${categoryId}`, { name }),

  delete: (categoryId: number) =>
    api.delete<void>(`/api/categories/${categoryId}`),

  updateOrder: (items: { id: number; displayOrder: number }[]) =>
    api.patch<void>('/api/categories/order', { items }),
};
