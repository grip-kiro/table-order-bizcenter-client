import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus, RestaurantTable, OrderHistory, ORDER_STATUS_LABEL } from '../types';
import { tablesApi, ordersApi, createSSE } from '../api';
import { useAuth } from '../hooks/useAuth';
import { fmt, dateStr } from '../utils';
import TableCard from '../components/TableCard';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PREPARING',
  PREPARING: 'COMPLETED',
};

const STATUS_BUTTON_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: '준비 시작',
  PREPARING: '완료 처리',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export default function DashboardPage() {
  const { session } = useAuth();
  const storeId = session?.storeId ?? 1;

  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [filterTableId, setFilterTableId] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [historyTableId, setHistoryTableId] = useState<number | null>(null);
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');
  const [historyOrders, setHistoryOrders] = useState<OrderHistory[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'complete'; orderId?: number; tableId?: number } | null>(null);

  useEffect(() => {
    tablesApi.list(storeId).then(setTables).catch(console.error);
  }, [storeId]);

  useEffect(() => {
    const occupied = tables.filter(t => t.status === 'OCCUPIED');
    occupied.forEach(t => {
      ordersApi.getTableOrders(t.id).then(res => {
        setOrders(prev => {
          const others = prev.filter(o => o.tableId !== t.id);
          return [...others, ...res.orders];
        });
      }).catch(console.error);
    });
  }, [tables]);

  useEffect(() => {
    const es = createSSE(storeId, (event) => {
      if (event === 'ORDER_CREATED') {
        tablesApi.list(storeId).then(setTables).catch(console.error);
      }
    });
    return () => es.close();
  }, [storeId]);

  const ordersByTable = useMemo(() => {
    const map: Record<number, Order[]> = {};
    for (const t of tables) {
      map[t.id] = orders
        .filter(o => o.tableId === t.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return map;
  }, [orders, tables]);

  const displayTables = filterTableId === 'all'
    ? tables
    : tables.filter(t => t.id === Number(filterTableId));

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedOrders = selectedTableId ? (ordersByTable[selectedTableId] || []) : [];
  const selectedTotal = selectedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  useEffect(() => {
    if (showHistory && historyTableId) {
      ordersApi.getHistory(historyTableId, historyDateFrom || undefined, historyDateTo || undefined)
        .then(setHistoryOrders)
        .catch(console.error);
    }
  }, [showHistory, historyTableId, historyDateFrom, historyDateTo]);

  const handleStatusChange = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await ordersApi.updateStatus(orderId, next);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: next, updatedAt: new Date().toISOString() } : o
      ));
      tablesApi.list(storeId).then(setTables).catch(console.error);
    } catch (e) { console.error(e); }
  };

  const handleDeleteOrder = (orderId: number) => {
    setConfirmAction({ type: 'delete', orderId });
  };

  const handleCompleteTable = (tableId: number) => {
    setConfirmAction({ type: 'complete', tableId });
  };

  const executeConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'delete' && confirmAction.orderId) {
      try {
        await ordersApi.delete(confirmAction.orderId);
        setOrders(prev => prev.filter(o => o.id !== confirmAction.orderId));
        tablesApi.list(storeId).then(setTables).catch(console.error);
      } catch (e) { console.error(e); }
    }
    if (confirmAction.type === 'complete' && confirmAction.tableId) {
      try {
        await tablesApi.complete(confirmAction.tableId);
        setOrders(prev => prev.filter(o => o.tableId !== confirmAction.tableId));
        tablesApi.list(storeId).then(setTables).catch(console.error);
        setSelectedTableId(null);
      } catch (e) { console.error(e); }
    }
    setConfirmAction(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">주문 대시보드</h2>
        <select
          value={filterTableId}
          onChange={e => setFilterTableId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 테이블</option>
          {tables.map(t => (
            <option key={t.id} value={t.id}>테이블 {t.tableNumber}</option>
          ))}
        </select>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayTables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            orders={ordersByTable[table.id] || []}
            onClick={() => setSelectedTableId(table.id)}
          />
        ))}
      </div>

      {/* Table Detail Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-16 bg-black/40 overflow-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 mb-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="text-xl font-bold">테이블 {selectedTable.tableNumber}</h3>
                <p className="text-sm text-gray-500">
                  총 주문액: <span className="font-bold text-blue-600">{fmt(selectedTotal)}</span>
                  <span className="ml-3 text-gray-400">{selectedOrders.length}건</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setHistoryTableId(selectedTable.id);
                    setHistoryDateFrom('');
                    setHistoryDateTo('');
                    setHistoryOrders([]);
                    setShowHistory(true);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  과거 내역
                </button>
                {selectedTable.status === 'OCCUPIED' && (
                  <button
                    onClick={() => handleCompleteTable(selectedTable.id)}
                    className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    이용 완료
                  </button>
                )}
                <button
                  onClick={() => setSelectedTableId(null)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>

            {/* Order List */}
            <div className="p-5 max-h-[60vh] overflow-auto">
              {selectedOrders.length === 0 ? (
                <p className="text-center text-gray-400 py-8">주문이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {selectedOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{order.id}</span>
                          <StatusBadge status={order.status} />
                          <span className="text-xs text-gray-400">{formatTime(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {STATUS_BUTTON_LABEL[order.status] && (
                            <button
                              onClick={() => handleStatusChange(order.id)}
                              className="px-2.5 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              {STATUS_BUTTON_LABEL[order.status]}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-2.5 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.menuName} x{item.quantity}</span>
                            <span className="text-gray-500">{fmt(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-end">
                        <span className="font-bold">{fmt(order.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 overflow-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 mb-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-xl font-bold">
                과거 주문 내역
                {historyTableId && <span className="text-gray-400 text-base ml-2">테이블 {tables.find(t => t.id === historyTableId)?.tableNumber}</span>}
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
            </div>

            {/* Date Filter */}
            <div className="px-5 pt-4 flex items-center gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">시작일</label>
                <input
                  type="date"
                  value={historyDateFrom}
                  onChange={e => setHistoryDateFrom(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">종료일</label>
                <input
                  type="date"
                  value={historyDateTo}
                  onChange={e => setHistoryDateTo(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {(historyDateFrom || historyDateTo) && (
                <button
                  onClick={() => { setHistoryDateFrom(''); setHistoryDateTo(''); }}
                  className="mt-5 text-xs text-blue-500 hover:text-blue-700"
                >
                  초기화
                </button>
              )}
            </div>

            <div className="p-5 max-h-[60vh] overflow-auto">
              {historyOrders.length === 0 ? (
                <p className="text-center text-gray-400 py-8">과거 주문 내역이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {[...historyOrders].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).map(h => (
                    <div key={h.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">테이블 {h.tableNumber}</span>
                          <span className="text-xs text-gray-400">
                            주문: {dateStr(new Date(h.orderedAt))} {formatTime(h.orderedAt)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          완료: {formatTime(h.completedAt)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {h.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.menuName} x{item.quantity}</span>
                            <span className="text-gray-500">{fmt(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-end">
                        <span className="font-bold">{fmt(h.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.type === 'delete' ? '주문 삭제' : '이용 완료'}
        message={
          confirmAction?.type === 'delete'
            ? '이 주문을 삭제하시겠습니까? 삭제된 주문은 복구할 수 없습니다.'
            : '테이블 이용을 완료하시겠습니까? 주문 내역이 과거 이력으로 이동됩니다.'
        }
        danger
        confirmText={confirmAction?.type === 'delete' ? '삭제' : '이용 완료'}
        onConfirm={executeConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
