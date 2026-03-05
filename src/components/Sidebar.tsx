import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdDashboard, MdTableBar, MdRestaurantMenu, MdCategory, MdLogout } from 'react-icons/md';

const NAV_ITEMS = [
  { to: '/', icon: MdDashboard, label: '대시보드' },
  { to: '/tables', icon: MdTableBar, label: '테이블 관리' },
  { to: '/menus', icon: MdRestaurantMenu, label: '메뉴 관리' },
  { to: '/categories', icon: MdCategory, label: '카테고리 관리' },
];

interface Props {
  storeName: string;
  onLogout: () => void;
}

export default function Sidebar({ storeName, onLogout }: Props) {
  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-lg font-bold">테이블오더</h1>
        <p className="text-sm text-gray-400 mt-1">{storeName}</p>
      </div>

      <nav className="flex-1 py-4">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {icon({ size: 20 })}
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-5 py-4 text-sm text-gray-400 hover:bg-gray-800 hover:text-white border-t border-gray-700 transition-colors"
      >
        {MdLogout({ size: 20 })}
        로그아웃
      </button>
    </aside>
  );
}
