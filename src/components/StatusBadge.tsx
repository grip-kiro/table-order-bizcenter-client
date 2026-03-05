import React from 'react';
import { OrderStatus, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../types';

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLOR[status]}`}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
