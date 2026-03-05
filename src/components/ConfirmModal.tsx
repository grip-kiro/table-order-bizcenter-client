import React from 'react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({ open, title, message, confirmText = '확인', cancelText = '취소', onConfirm, onCancel, danger }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
