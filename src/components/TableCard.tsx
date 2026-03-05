import React from 'react';
import { Order, RestaurantTable, ORDER_STATUS_LABEL, TABLE_STATUS_LABEL } from '../types';
import { fmt } from '../utils';
import StatusBadge from './StatusBadge';

interface Props {
  table: RestaurantTable;
  orders: Order[];
  isHighlighted?: boolean;
  onClick: () => void;
}

export default function TableCard({ table, orders, isHighlighted, onClick }: Props) {
  const hasNewOrder = orders.some(o => o.status === 'PENDING');
  const isOccupied = table.status === 'OCCUPIED';
  const latestOrders = orders.slice(0, 3);

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${
        isHighlighted
          ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-300 animate-pulse'
          : hasNewOrder
          ? 'border-yellow-400 bg-yellow-50'
          : isOccupied
          ? 'border-gray-200 bg-white'
          : 'border-gray-100 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">테이블 {table.tableNumber}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            isOccupied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {TABLE_STATUS_LABEL[table.status]}
          </span>
        </div>
        <span className="text-lg font-bold text-blue-600">{fmt(table.totalAmount)}</span>
      </div>

      {latestOrders.length > 0 ? (
        <div className="space-y-2">
          {latestOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <StatusBadge status={order.status} />
                <span className="text-gray-600 truncate max-w-[160px]">
                  {order.items.map(i => i.menuName).join(', ')}
                </span>
              </div>
              <span className="text-gray-400 text-xs whitespace-nowrap ml-2">{fmt(order.totalAmount)}</span>
            </div>
          ))}
          {orders.length > 3 && (
            <p className="text-xs text-gray-400 text-center">+{orders.length - 3}건 더보기</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">주문 없음</p>
      )}
    </div>
  );
}
