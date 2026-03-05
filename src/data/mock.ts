import { Store, AdminUser, RestaurantTable, Category, Menu, Order, OrderHistory } from '../types';

export const MOCK_STORE: Store = {
  id: 1,
  name: '맛있는 식당',
  address: '서울시 강남구 테헤란로 123',
};

export const MOCK_ADMIN: AdminUser = {
  id: 1,
  storeId: 1,
  username: 'admin',
};

export const MOCK_TABLES: RestaurantTable[] = [
  { id: 1, tableNumber: 1, pin: '1234', status: 'OCCUPIED', currentSessionId: 'session-1', totalAmount: 43000, orderCount: 3, createdAt: '2026-03-05T10:00:00' },
  { id: 2, tableNumber: 2, pin: '1234', status: 'OCCUPIED', currentSessionId: 'session-2', totalAmount: 40000, orderCount: 3, createdAt: '2026-03-05T10:00:00' },
  { id: 3, tableNumber: 3, pin: '5678', status: 'OCCUPIED', currentSessionId: 'session-3', totalAmount: 37000, orderCount: 2, createdAt: '2026-03-05T10:00:00' },
  { id: 4, tableNumber: 4, pin: '5678', status: 'AVAILABLE', currentSessionId: null, totalAmount: 0, orderCount: 0, createdAt: '2026-03-05T10:00:00' },
  { id: 5, tableNumber: 5, pin: '9012', status: 'AVAILABLE', currentSessionId: null, totalAmount: 0, orderCount: 0, createdAt: '2026-03-05T10:00:00' },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: '메인', displayOrder: 1 },
  { id: 2, name: '사이드', displayOrder: 2 },
  { id: 3, name: '음료', displayOrder: 3 },
  { id: 4, name: '디저트', displayOrder: 4 },
  { id: 5, name: '주류', displayOrder: 5 },
];

export const MOCK_MENUS: Menu[] = [
  { id: 1, name: '불고기 정식', price: 12000, description: '소고기 불고기와 밑반찬 세트', imageUrl: null, categories: [{ id: 1, name: '메인' }], isSoldOut: false, isDeleted: false, displayOrder: 1 },
  { id: 2, name: '김치찌개', price: 9000, description: '돼지고기 김치찌개', imageUrl: null, categories: [{ id: 1, name: '메인' }], isSoldOut: false, isDeleted: false, displayOrder: 2 },
  { id: 3, name: '된장찌개', price: 8000, description: '두부 된장찌개', imageUrl: null, categories: [{ id: 1, name: '메인' }], isSoldOut: false, isDeleted: false, displayOrder: 3 },
  { id: 4, name: '비빔밥', price: 10000, description: '야채 비빔밥', imageUrl: null, categories: [{ id: 1, name: '메인' }], isSoldOut: true, isDeleted: false, displayOrder: 4 },
  { id: 5, name: '계란말이', price: 5000, description: '부드러운 계란말이', imageUrl: null, categories: [{ id: 2, name: '사이드' }], isSoldOut: false, isDeleted: false, displayOrder: 5 },
  { id: 6, name: '김치전', price: 7000, description: '바삭한 김치전', imageUrl: null, categories: [{ id: 2, name: '사이드' }], isSoldOut: false, isDeleted: false, displayOrder: 6 },
  { id: 7, name: '콜라', price: 2000, description: '코카콜라 355ml', imageUrl: null, categories: [{ id: 3, name: '음료' }], isSoldOut: false, isDeleted: false, displayOrder: 7 },
  { id: 8, name: '사이다', price: 2000, description: '칠성사이다 355ml', imageUrl: null, categories: [{ id: 3, name: '음료' }], isSoldOut: false, isDeleted: false, displayOrder: 8 },
  { id: 9, name: '아이스크림', price: 3000, description: '바닐라 아이스크림', imageUrl: null, categories: [{ id: 4, name: '디저트' }], isSoldOut: false, isDeleted: false, displayOrder: 9 },
  { id: 10, name: '소주', price: 5000, description: '참이슬 후레쉬', imageUrl: null, categories: [{ id: 5, name: '주류' }], isSoldOut: false, isDeleted: false, displayOrder: 10 },
  { id: 11, name: '탕수육', price: 15000, description: '바삭한 탕수육 (삭제됨)', imageUrl: null, categories: [{ id: 1, name: '메인' }], isSoldOut: false, isDeleted: true, displayOrder: 11 },
];

const now = new Date();
const ago = (min: number) => new Date(now.getTime() - min * 60000).toISOString();

export const MOCK_ORDERS: Order[] = [
  {
    id: 1, storeId: 1, tableId: 1, tableNumber: 1, sessionId: 'session-1',
    items: [{ id: 1, menuId: 1, menuName: '불고기 정식', quantity: 2, unitPrice: 12000, subtotal: 24000 }, { id: 2, menuId: 7, menuName: '콜라', quantity: 2, unitPrice: 2000, subtotal: 4000 }],
    totalAmount: 28000, status: 'PENDING', createdAt: ago(3), updatedAt: ago(3),
  },
  {
    id: 2, storeId: 1, tableId: 1, tableNumber: 1, sessionId: 'session-1',
    items: [{ id: 3, menuId: 5, menuName: '계란말이', quantity: 1, unitPrice: 5000, subtotal: 5000 }],
    totalAmount: 5000, status: 'PREPARING', createdAt: ago(10), updatedAt: ago(8),
  },
  {
    id: 3, storeId: 1, tableId: 2, tableNumber: 2, sessionId: 'session-2',
    items: [{ id: 4, menuId: 2, menuName: '김치찌개', quantity: 1, unitPrice: 9000, subtotal: 9000 }, { id: 5, menuId: 8, menuName: '사이다', quantity: 1, unitPrice: 2000, subtotal: 2000 }],
    totalAmount: 11000, status: 'PENDING', createdAt: ago(1), updatedAt: ago(1),
  },
  {
    id: 4, storeId: 1, tableId: 2, tableNumber: 2, sessionId: 'session-2',
    items: [{ id: 6, menuId: 6, menuName: '김치전', quantity: 1, unitPrice: 7000, subtotal: 7000 }],
    totalAmount: 7000, status: 'COMPLETED', createdAt: ago(25), updatedAt: ago(20),
  },
  {
    id: 5, storeId: 1, tableId: 3, tableNumber: 3, sessionId: 'session-3',
    items: [{ id: 7, menuId: 3, menuName: '된장찌개', quantity: 2, unitPrice: 8000, subtotal: 16000 }, { id: 8, menuId: 10, menuName: '소주', quantity: 3, unitPrice: 5000, subtotal: 15000 }],
    totalAmount: 31000, status: 'PREPARING', createdAt: ago(8), updatedAt: ago(5),
  },
  {
    id: 6, storeId: 1, tableId: 3, tableNumber: 3, sessionId: 'session-3',
    items: [{ id: 9, menuId: 9, menuName: '아이스크림', quantity: 2, unitPrice: 3000, subtotal: 6000 }],
    totalAmount: 6000, status: 'PENDING', createdAt: ago(2), updatedAt: ago(2),
  },
  {
    id: 7, storeId: 1, tableId: 1, tableNumber: 1, sessionId: 'session-1',
    items: [{ id: 10, menuId: 10, menuName: '소주', quantity: 2, unitPrice: 5000, subtotal: 10000 }],
    totalAmount: 10000, status: 'COMPLETED', createdAt: ago(30), updatedAt: ago(25),
  },
  {
    id: 8, storeId: 1, tableId: 2, tableNumber: 2, sessionId: 'session-2',
    items: [{ id: 11, menuId: 1, menuName: '불고기 정식', quantity: 1, unitPrice: 12000, subtotal: 12000 }, { id: 12, menuId: 5, menuName: '계란말이', quantity: 2, unitPrice: 5000, subtotal: 10000 }],
    totalAmount: 22000, status: 'PREPARING', createdAt: ago(15), updatedAt: ago(12),
  },
];

export const MOCK_ORDER_HISTORY: OrderHistory[] = [
  {
    id: 1, originalOrderId: 100, tableId: 1, tableNumber: 1, sessionId: 'session-old-1',
    items: [{ id: 1, menuId: 1, menuName: '불고기 정식', quantity: 3, unitPrice: 12000, subtotal: 36000 }, { id: 2, menuId: 7, menuName: '콜라', quantity: 3, unitPrice: 2000, subtotal: 6000 }],
    totalAmount: 42000, status: 'COMPLETED', completedAt: '2026-03-04T20:30:00', orderedAt: '2026-03-04T19:00:00',
  },
  {
    id: 2, originalOrderId: 101, tableId: 2, tableNumber: 2, sessionId: 'session-old-2',
    items: [{ id: 3, menuId: 3, menuName: '된장찌개', quantity: 2, unitPrice: 8000, subtotal: 16000 }],
    totalAmount: 16000, status: 'COMPLETED', completedAt: '2026-03-04T21:00:00', orderedAt: '2026-03-04T20:00:00',
  },
  {
    id: 3, originalOrderId: 102, tableId: 1, tableNumber: 1, sessionId: 'session-old-3',
    items: [{ id: 4, menuId: 2, menuName: '김치찌개', quantity: 2, unitPrice: 9000, subtotal: 18000 }, { id: 5, menuId: 10, menuName: '소주', quantity: 4, unitPrice: 5000, subtotal: 20000 }],
    totalAmount: 38000, status: 'COMPLETED', completedAt: '2026-03-03T21:30:00', orderedAt: '2026-03-03T19:30:00',
  },
];
