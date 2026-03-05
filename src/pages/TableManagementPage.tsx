import React, { useState, useEffect } from 'react';
import { RestaurantTable, TABLE_STATUS_LABEL } from '../types';
import { tablesApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from '../components/ConfirmModal';

export default function TableManagementPage() {
  const { session } = useAuth();
  const storeId = session?.storeId ?? 1;

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNumber, setFormNumber] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const refreshTables = () => tablesApi.list(storeId).then(setTables).catch(console.error);

  useEffect(() => {
    tablesApi.list(storeId).then(setTables).catch(console.error);
  }, [storeId]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormNumber('');
    setFormPin('');
    setFormError('');
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (t: RestaurantTable) => {
    setEditingId(t.id);
    setFormNumber(String(t.tableNumber));
    setFormPin(t.pin);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(formNumber);
    if (!num || num < 1) { setFormError('테이블 번호를 입력해주세요'); return; }
    if (!/^\d{4,6}$/.test(formPin)) { setFormError('PIN은 4~6자리 숫자입니다'); return; }

    const duplicate = tables.find(t => t.tableNumber === num && t.id !== editingId);
    if (duplicate) { setFormError('이미 존재하는 테이블 번호입니다'); return; }

    try {
      if (editingId) {
        await tablesApi.update(editingId, num, formPin);
      } else {
        await tablesApi.create(num, formPin);
      }
      await refreshTables();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await tablesApi.delete(deleteId);
        await refreshTables();
      } catch (err) {
        console.error(err);
      }
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">테이블 관리</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          테이블 추가
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-bold mb-4">{editingId ? '테이블 수정' : '테이블 추가'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">테이블 번호</label>
              <input
                type="number"
                min={1}
                value={formNumber}
                onChange={e => setFormNumber(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="번호"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4~6자리)</label>
              <input
                type="text"
                maxLength={6}
                value={formPin}
                onChange={e => setFormPin(e.target.value.replace(/\D/g, ''))}
                className="px-3 py-2 border border-gray-300 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                {editingId ? '수정' : '추가'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                취소
              </button>
            </div>
            {formError && <p className="text-red-500 text-sm w-full">{formError}</p>}
          </form>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">테이블 번호</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">PIN</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">상태</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">세션</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tables.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{t.tableNumber}</td>
                <td className="px-5 py-3 text-gray-500">{t.pin}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.status === 'OCCUPIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {TABLE_STATUS_LABEL[t.status]}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {t.currentSessionId || '-'}
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(t)} className="text-blue-500 hover:text-blue-700 mr-3 text-xs">수정</button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    disabled={t.status === 'OCCUPIED'}
                    className={`text-xs ${t.status === 'OCCUPIED' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tables.length === 0 && (
          <p className="text-center text-gray-400 py-8">등록된 테이블이 없습니다.</p>
        )}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="테이블 삭제"
        message="이 테이블을 삭제하시겠습니까?"
        danger
        confirmText="삭제"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
