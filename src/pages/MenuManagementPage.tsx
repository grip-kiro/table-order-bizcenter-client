import React, { useState, useEffect } from 'react';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { Menu, Category } from '../types';
import { menusApi, categoriesApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import { fmt } from '../utils';
import ConfirmModal from '../components/ConfirmModal';

interface FormState {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  categoryIds: number[];
}

const EMPTY_FORM: FormState = {
  name: '',
  price: '',
  description: '',
  imageUrl: '',
  categoryIds: [],
};

export default function MenuManagementPage() {
  const { session } = useAuth();
  const storeId = session?.storeId ?? 1;

  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState<number | 'all'>('all');

  const refreshMenus = () => menusApi.list(storeId).then(setMenus).catch(console.error);

  useEffect(() => {
    menusApi.list(storeId).then(setMenus).catch(console.error);
    categoriesApi.list(storeId).then(setCategories).catch(console.error);
  }, [storeId]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (m: Menu) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      price: String(m.price),
      description: m.description ?? '',
      imageUrl: m.imageUrl ?? '',
      categoryIds: m.categories.map(c => c.id),
    });
    setFormError('');
    setShowForm(true);
  };

  const toggleCategory = (catId: number) => {
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter(c => c !== catId)
        : [...prev.categoryIds, catId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    const price = parseInt(form.price, 10);

    if (!trimmedName || trimmedName.length < 1 || trimmedName.length > 100) {
      setFormError('메뉴명은 1~100자로 입력하세요.');
      return;
    }
    if (isNaN(price) || price < 0 || price > 1000000) {
      setFormError('가격은 0~1,000,000 범위입니다.');
      return;
    }
    if (form.categoryIds.length === 0) {
      setFormError('카테고리를 1개 이상 선택하세요.');
      return;
    }

    try {
      if (editingId !== null) {
        await menusApi.update(editingId, {
          name: trimmedName,
          price,
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          categoryIds: form.categoryIds,
        });
      } else {
        await menusApi.create({
          name: trimmedName,
          price,
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          categoryIds: form.categoryIds,
        });
      }
      await refreshMenus();
      resetForm();
    } catch (err) {
      console.error(err);
      setFormError('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await menusApi.delete(deleteId);
        await refreshMenus();
      } catch (err) {
        console.error(err);
      }
      setDeleteId(null);
    }
  };

  const toggleSoldOut = async (menuId: number) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;
    try {
      await menusApi.toggleSoldOut(menuId, !menu.isSoldOut);
      await refreshMenus();
    } catch (err) {
      console.error(err);
    }
  };

  const moveMenu = async (menuId: number, direction: 'up' | 'down') => {
    const sorted = [...menus].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex(m => m.id === menuId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newSorted = [...sorted];
    const aOrder = newSorted[idx].displayOrder;
    const bOrder = newSorted[swapIdx].displayOrder;
    newSorted[idx] = { ...newSorted[idx], displayOrder: bOrder };
    newSorted[swapIdx] = { ...newSorted[swapIdx], displayOrder: aOrder };

    const items = newSorted.map(m => ({ id: m.id, displayOrder: m.displayOrder }));
    try {
      await menusApi.updateOrder(items);
      await refreshMenus();
    } catch (err) {
      console.error(err);
    }
  };

  const displayMenus = menus
    .filter(m => filterCat === 'all' || m.categories.some(c => c.id === filterCat))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const getCategoryNames = (cats: { id: number; name: string }[]) =>
    cats.map(c => c.name).join(', ');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">메뉴 관리</h2>
        <div className="flex gap-3">
          <select
            value={filterCat}
            onChange={e =>
              setFilterCat(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 카테고리</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            메뉴 추가
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-bold mb-4">
              {editingId !== null ? '메뉴 수정' : '메뉴 등록'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메뉴명 * (1~100자)
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="불고기 정식"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가격 (원) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="메뉴 설명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                <input
                  value={form.imageUrl}
                  onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 * (복수 선택)
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.id)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        form.categoryIds.includes(c.id)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  {editingId !== null ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">순서</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">메뉴명</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">카테고리</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">가격</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">품절</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {displayMenus.map((m, idx) => (
              <tr
                key={m.id}
                className={`${m.isDeleted ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50'} ${
                  m.isSoldOut && !m.isDeleted ? 'opacity-60' : ''
                }`}
              >
                {/* 순서 + 화살표 */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 w-5">{m.displayOrder}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveMenu(m.id, 'up')}
                        disabled={idx === 0 || m.isDeleted}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                        title="위로"
                      >
                        {MdArrowUpward({ size: 18 })}
                      </button>
                      <button
                        onClick={() => moveMenu(m.id, 'down')}
                        disabled={idx === displayMenus.length - 1 || m.isDeleted}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                        title="아래로"
                      >
                        {MdArrowDownward({ size: 18 })}
                      </button>
                    </div>
                  </div>
                </td>

                {/* 메뉴명 + 삭제됨 뱃지 */}
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span className={m.isDeleted ? 'line-through text-gray-400' : ''}>
                      {m.name}
                    </span>
                    {m.isDeleted && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded">
                        삭제됨
                      </span>
                    )}
                  </div>
                </td>

                {/* 카테고리 */}
                <td className="px-4 py-3 text-gray-500">{getCategoryNames(m.categories)}</td>

                {/* 가격 */}
                <td className="px-4 py-3 text-right">{fmt(m.price)}</td>

                {/* 품절 토글 */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => !m.isDeleted && toggleSoldOut(m.id)}
                    disabled={m.isDeleted}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      m.isDeleted
                        ? 'bg-gray-200 cursor-not-allowed'
                        : m.isSoldOut
                        ? 'bg-red-500 cursor-pointer'
                        : 'bg-gray-300 cursor-pointer'
                    }`}
                    title={m.isDeleted ? '삭제된 메뉴' : m.isSoldOut ? '품절' : '판매중'}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        m.isSoldOut ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </td>

                {/* 관리 버튼 */}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {!m.isDeleted ? (
                    <>
                      <button
                        onClick={() => openEdit(m)}
                        className="text-blue-500 hover:text-blue-700 mr-3 text-xs"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayMenus.length === 0 && (
          <p className="text-center text-gray-400 py-8">메뉴가 없습니다.</p>
        )}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="메뉴 삭제"
        message="이 메뉴를 삭제하시겠습니까? 삭제된 메뉴는 목록에 회색으로 표시됩니다."
        danger
        confirmText="삭제"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
