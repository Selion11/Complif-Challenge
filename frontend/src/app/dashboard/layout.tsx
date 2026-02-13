"use client";

import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth.service';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast'; // Importamos el sistema de notificaciones
import { LayoutDashboard, PlusCircle, LogOut, Building2, PenTool } from 'lucide-react';

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
    <div className="flex h-screen bg-gray-50 text-black">
      {/* Sistema de Notificaciones Global */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black flex items-center gap-2 tracking-tighter uppercase">
            <Building2 className="text-blue-400" />
            Compliance
          </h2>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-semibold text-sm group"
          >
            <LayoutDashboard size={20} className="text-slate-400 group-hover:text-blue-400" />
            <span>Panel de Empresas</span>
          </Link>
          
          <Link 
            href="/dashboard/register" 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-semibold text-sm group"
          >
            <PlusCircle size={20} className="text-slate-400 group-hover:text-blue-400" />
            <span>Registrar Legajo</span>
          </Link>

          {/* Nuevo acceso al Centro de Firmas */}
          <Link 
            href="/dashboard/signatures" 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-semibold text-sm group"
          >
            <PenTool size={20} className="text-slate-400 group-hover:text-orange-400" />
            <span>Firmas Pendientes</span>
          </Link>
        </nav>

        {/* User Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}