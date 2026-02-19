"use client";

import { useEffect, useState, useCallback } from 'react';
import { getCompanies } from '@/services/company.service';
import { Company } from '@/types/company';
import { Eye, ChevronLeft, ChevronRight, Search, Filter, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ FILTROS: Sincronizados con las nuevas llaves del Backend
  const [filters, setFilters] = useState({ 
    name: '',
    country: '',    
    industry: '',   
    page: 1 
  });

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1
  });

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      // Se envían name, country e industry al servicio de API
      const response = await getCompanies(filters); 
      
      const companiesArray = response.data || []; 
      const paginationInfo = response.pagination || { totalPages: 1, currentPage: 1 };

      setCompanies(companiesArray);
      setPagination(paginationInfo);
    } catch (error) {
      console.error("Error al cargar empresas:", error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      country: '',
      industry: '',
      page: 1
    });
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-slate-100 text-slate-700';
    const s = status.toUpperCase();
    if (s.includes('APPROVED')) return 'bg-green-50 text-green-700 border-green-100';
    if (s.includes('REJECTED')) return 'bg-red-50 text-red-700 border-red-100';
    if (s.includes('PENDING')) return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* CABECERA Y FILTROS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Panel de Control</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Gestión de Cumplimiento Corporativo</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          {/* Búsqueda */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="BUSCAR EMPRESA..."
              className="pl-12 p-4 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase bg-white text-black w-full md:w-64 outline-none focus:border-black transition-all"
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value, page: 1 }))}
            />
          </div>

          {/* País */}
          <select 
            className="p-4 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase bg-white text-black outline-none focus:border-black cursor-pointer min-w-[140px]"
            value={filters.country}
            onChange={(e) => setFilters({...filters, country: e.target.value, page: 1})}
          >
            <option value="">PAÍSES</option>
            <option value="Argentina">Argentina</option>
            <option value="España">España</option>
            <option value="México">México</option>
            <option value="Islas Caimán">Islas Caimán</option>
          </select>
          
          {/* Industria */}
          <select 
            className="p-4 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase bg-white text-black outline-none focus:border-black cursor-pointer min-w-[140px]"
            value={filters.industry}
            onChange={(e) => setFilters({...filters, industry: e.target.value, page: 1})}
          >
            <option value="">INDUSTRIAS</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Servicios">Servicios</option>
            <option value="Finanzas">Finanzas</option>
            <option value="Construcción">Construcción</option>
            <option value="Minería">Minería</option>
          </select>

          {/* Reset */}
          <button 
            onClick={resetFilters}
            className="p-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-slate-400"
            title="Limpiar filtros"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-[3rem] shadow-sm border-2 border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Entidad Legal</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identificación</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Jurisdicción</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estado Auditoría</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-slate-400 animate-pulse font-black uppercase tracking-[0.5em]">
                    Sincronizando Base de Datos...
                  </td>
                </tr>
              ) : (!companies || companies.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-slate-400 font-black uppercase tracking-widest italic">
                    No se encontraron registros para la búsqueda.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.cuit} className="hover:bg-slate-50/80 transition-colors text-black group">
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 uppercase text-sm tracking-tighter">
                          {company.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{company.industry || 'General'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-slate-500 font-mono text-xs font-bold">{company.cuit}</td>
                    <td className="px-8 py-8">
                      <span className="text-xs font-black uppercase text-slate-600 border-b-2 border-slate-100 pb-1">
                        {company.country}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black border-2 uppercase tracking-widest ${getStatusColor(company.status)}`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <Link 
                        href={`/dashboard/companies/${company.cuit}`}
                        className="bg-white border-2 border-black text-black hover:bg-black hover:text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black transition-all w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 uppercase tracking-widest"
                      >
                        <Eye size={14} /> LEGAJO TÉCNICO
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {!loading && companies.length > 0 && (
          <div className="px-10 py-8 bg-slate-50/30 border-t-2 border-slate-50 flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Mostrando página {pagination.currentPage} de {pagination.totalPages}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-4 border-2 border-slate-200 rounded-3xl bg-white disabled:opacity-20 hover:border-black transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-4 border-2 border-slate-200 rounded-3xl bg-white disabled:opacity-20 hover:border-black transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}