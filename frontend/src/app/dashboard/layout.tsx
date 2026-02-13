"use client";

import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth.service';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, LogOut, Building2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    logout(); // Limpia localStorage y Cookies
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="text-blue-400" />
            Compliance
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard size={20} />
            <span>Empresas</span>
          </Link>
          <Link 
            href="/dashboard/register" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusCircle size={20} />
            <span>Registrar</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}