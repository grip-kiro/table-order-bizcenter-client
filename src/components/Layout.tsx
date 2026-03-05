import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface Props {
  storeName: string;
  onLogout: () => void;
}

export default function Layout({ storeName, onLogout }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar storeName={storeName} onLogout={onLogout} />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
