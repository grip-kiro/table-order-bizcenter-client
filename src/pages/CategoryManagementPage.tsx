import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoriesApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from '../components/ConfirmModal';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

export default function CategoryManagementPage() {
  const { session } = useAuth();
  const storeId = session?.storeId ?? 1;

  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const refreshCategories = () => categoriesApi.list(storeId).then(setCategories).catch(console.error);

  useEffect(() => {
    categoriesApi.list(storeId).then(setCategories).catch(console.error);
  }, [storeId]);

  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormName('');
    setFormError('');
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setFormName(c.name);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formName.trim();
    if (!trimmed) { setFormError('카테고리명을 입력하세요.'); return; }
    if (trimmed.length > 50) { setFormError('카테고리명은 50자 이하로 입력하세요.'); return; }

    const duplicate = categories.find(c => c.name === trimmed && c.id !== editingId);
    if (duplicate) { setFormError('이미 존재하는 카테고리명입니다.'); return; }

    try {
      if (editingId !== null) {
        await categoriesApi.update(editingId, trimmed);
      } else {
        await categoriesApi.create(trimmed);
      }
      await refreshCategories();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await categoriesApi.delete(deleteId);
        await refreshCategories();
      } catch (err) {
        console.error(err);
      }
      setDeleteId(null);
    }
  };

  const moveOrder = async (id: number, direction: 'up' | 'down') => {
    const idx = sorted.findIndex(c => c.id === id);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= sorted.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const orderA = sorted[idx].displayOrder;
    const orderB = sorted[swapIdx].displayOrder;

    try {
      await categoriesApi.updateOrder([
        { id: sorted[idx].id, displayOrder: orderB },
        { id: sorted[swapIdx].id, displayOrder: orderA },
      ]);
      await refreshCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">카테고리 관리</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          카테고리 추가
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-bold mb-4">{editingId !== null ? '카테고리 수정' : '카테고리 추가'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리명</label>
              <input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                maxLength={50}
                className="px-3 py-2 border border-gray-300 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="카테고리명 (1~50자)"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                {editingId !== null ? '수정' : '추가'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                취소
              </button>
            </div>
            {formError && <p className="text-red-500 text-sm w-full">{formError}</p>}
          </form>
        </div>
      )}

      {/* Category List */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">순서</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">카테고리명</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">순서 변경</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((c, idx) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-400">{c.displayOrder}</td>
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => moveOrder(c.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    {MdArrowUpward({ size: 18 })}
                  </button>
                  <button
                    onClick={() => moveOrder(c.id, 'down')}
                    disabled={idx === sorted.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    {MdArrowDownward({ size: 18 })}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-blue-500 hover:text-blue-700 mr-3 text-xs">수정</button>
                  <button onClick={() => setDeleteId(c.id)} className="text-red-500 hover:text-red-700 text-xs">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="text-center text-gray-400 py-8">등록된 카테고리가 없습니다.</p>
        )}
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="카테고리 삭제"
        message="이 카테고리를 삭제하시겠습니까? 해당 카테고리에 메뉴가 있으면 삭제할 수 없습니다."
        danger
        confirmText="삭제"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
