"use client";

import { useEffect, useState } from 'react';
import { getCompanies } from '@/services/company.service';
import { Company } from '@/types/company';
import { Search, Filter, Eye, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: '', industry: '' });

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies(filters); // Llama a GET /api/companies
      setCompanies(data);
    } catch (error) {
      console.error("Error al cargar empresas", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Panel de Empresas</h1>
        <div className="flex gap-3">
          {/* Filtros rápidos alineados con los Query Params del backend */}
          <select 
            className="p-2 border rounded-lg text-sm bg-white text-black"
            onChange={(e) => setFilters({...filters, country: e.target.value})}
          >
            <option value="">Todos los países</option>
            <option value="Argentina">Argentina</option>
            <option value="Uruguay">Uruguay</option>
          </select>
          <select 
            className="p-2 border rounded-lg text-sm bg-white text-black"
            onChange={(e) => setFilters({...filters, industry: e.target.value})}
          >
            <option value="">Todas las industrias</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Finanzas">Finanzas</option>
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Empresa</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">CUIT</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">País</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Estado</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Cargando empresas...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No se encontraron empresas.</td></tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50 transition-colors text-black">
                  <td className="px-6 py-4 font-medium">{company.name}</td>
                  <td className="px-6 py-4 text-slate-600">{company.cuit}</td>
                  <td className="px-6 py-4 text-slate-600">{company.country}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(company.status)}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                      <Eye size={16} /> Ver Legajo
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}