"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  getCompanyDetail, 
  updateCompanyStatus, 
  getRiskScore 
} from '@/services/company.service';
import { 
  createGroup, 
  createRule, 
  getRulesByCompany 
} from '@/services/signature.service';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import { 
  ShieldCheck, FileText, Clock, CheckCircle, 
  XCircle, Building2, Eye, Users, Settings, Plus, Info
} from 'lucide-react';

export default function CompanyDetailPage() {
  const { cuit } = useParams();

  // --- ESTADOS DE DATOS ---
  const [company, setCompany] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'legajo' | 'gobernanza'>('legajo');
  
  // --- ESTADOS DE GOBERNANZA ---
  const [groupData, setGroupData] = useState({ name: '', description: '' });
  const [ruleConfig, setRuleConfig] = useState({ type: 'SIMPLE', minSignatures: 1 });
  const [existingRules, setExistingRules] = useState<any[]>([]);

  // --- ESTADOS DE MODALES Y AUDITORÍA ---
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState({ url: '', title: '' });
  const [comment, setComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- CARGA DE DATOS ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [details, riskData] = await Promise.all([
        getCompanyDetail(cuit as string),
        getRiskScore(cuit as string)
      ]);
      setCompany(details);
      setRisk(riskData);
    } catch (error) {
      console.error("Error cargando legajo:", error);
    } finally {
      setLoading(false);
    }
  }, [cuit]);

  const fetchRules = useCallback(async () => {
    try {
      const rules = await getRulesByCompany(cuit as string); //
      setExistingRules(rules);
    } catch (error) {
      console.error("Error al cargar reglas");
    }
  }, [cuit]);

  useEffect(() => {
    if (cuit) fetchData();
  }, [cuit, fetchData]);

  useEffect(() => {
    if (activeTab === 'gobernanza') fetchRules();
  }, [activeTab, fetchRules]);

  // --- MANEJADORES DE GOBERNANZA ---
  const handleCreateGroup = async () => {
    if (!groupData.name) return alert("El nombre del grupo es obligatorio");
    try {
      await createGroup(groupData.name, groupData.description); //
      alert("Grupo creado con éxito");
      setGroupData({ name: '', description: '' });
    } catch (error) {
      alert("Error al crear el grupo");
    }
  };

  const handleSaveRule = async () => {
    try {
      const config = { min_signatures: ruleConfig.minSignatures };
      await createRule(cuit as string, ruleConfig.type, config); //
      alert("Regla de firma guardada correctamente");
      fetchRules();
    } catch (error) {
      alert("Error al guardar la regla");
    }
  };

  // --- MANEJADORES DE LEGAJO ---
  const openPreview = (docType: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const fileName = `${company.cuit}-${docType.toLowerCase().replace(/ /g, '_')}.pdf`;
    const url = `${backendUrl}/uploads/${fileName}`;
    setSelectedDoc({ url, title: docType });
    setIsPreviewOpen(true);
  };

  const handleStatusUpdate = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (!comment.trim()) return alert("El comentario es obligatorio para la trazabilidad.");
    try {
      setIsUpdating(true);
      await updateCompanyStatus(cuit as string, newStatus, comment);
      setComment('');
      await fetchData();
    } catch (error) {
      alert("Error al actualizar el estado.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-black font-medium">Cargando legajo operacional...</div>;
  if (!company) return <div className="p-10 text-center text-red-500 font-bold">Error: Empresa no encontrada.</div>;

  return (
    <div className="space-y-6 text-black">
      {/* Header Estático con Información de la Empresa */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="text-blue-500" size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Panel de Control</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">{company.name}</h1>
            <p className="text-slate-500 font-medium italic text-sm">CUIT: {company.cuit} • {company.country}</p>
          </div>
          <div className={`px-6 py-2 rounded-full border-2 font-black text-xs ${
            company.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
            company.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}>
            {company.status}
          </div>
        </div>

        {/* Sistema de Navegación por Tabs */}
        <div className="flex gap-8 mt-6 border-t pt-4">
          <button 
            onClick={() => setActiveTab('legajo')}
            className={`flex items-center gap-2 pb-2 font-bold text-sm transition-all ${activeTab === 'legajo' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
          >
            <FileText size={18} /> Legajo y Documentos
          </button>
          <button 
            onClick={() => setActiveTab('gobernanza')}
            className={`flex items-center gap-2 pb-2 font-bold text-sm transition-all ${activeTab === 'gobernanza' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
          >
            <Users size={18} /> Gobernanza y Firmas
          </button>
        </div>
      </div>

      {/* VISTA: LEGAJO (CORE) */}
      {activeTab === 'legajo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
              <h3 className="text-lg font-bold flex items-center gap-2 relative z-10">
                <ShieldCheck className="text-blue-400" /> Risk Score Automatizado
              </h3>
              <div className="text-5xl font-black text-blue-400 mt-2 relative z-10">
                {risk?.score ?? '00'}<span className="text-lg text-white/30 font-normal">/100</span>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <FileText size={20} className="text-slate-400" /> Documentación de Auditoría
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Certificado Fiscal', 'Poliza Seguro'].map((doc) => (
                  <div key={doc} className="group flex justify-between items-center p-4 border-2 border-slate-50 rounded-xl hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                    <span className="font-semibold text-slate-700">{doc}</span>
                    <button 
                      onClick={() => openPreview(doc)} 
                      className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border shadow-sm text-blue-600 font-bold text-xs hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Eye size={14}/> Preview
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border-2 border-slate-900/5 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-slate-900">Resolución de Auditoría</h3>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none mb-4 focus:ring-2 focus:ring-blue-500 transition-all" 
                rows={3} 
                placeholder="Escriba el motivo de la resolución..." 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
              />
              <button 
                disabled={isUpdating} 
                onClick={() => handleStatusUpdate('APPROVED')} 
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-black mb-2 transition-colors shadow-lg shadow-green-100"
              >
                APROBAR LEGAJO
              </button>
              <button 
                disabled={isUpdating} 
                onClick={() => handleStatusUpdate('REJECTED')} 
                className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50 py-3 rounded-xl font-black transition-colors"
              >
                RECHAZAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISTA: GOBERNANZA (LOGICA DE NEGOCIO) */}
      {activeTab === 'gobernanza' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Gestión de Grupos */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Users size={20} className="text-blue-500" /> Grupos de Firmantes
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Nombre del grupo (ej: Directores)..." 
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={groupData.name}
                onChange={(e) => setGroupData({...groupData, name: e.target.value})}
              />
              <textarea 
                placeholder="Descripción de facultades de firma..." 
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                rows={2}
                value={groupData.description}
                onChange={(e) => setGroupData({...groupData, description: e.target.value})}
              />
              <button 
                onClick={handleCreateGroup}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md"
              >
                <Plus size={18}/> CREAR GRUPO
              </button>
            </div>
          </div>

          {/* Gestión de Reglas */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Settings size={20} className="text-orange-500" /> Reglas de Firma
            </h3>
            <div className="space-y-4">
              <select 
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={ruleConfig.type}
                onChange={(e) => setRuleConfig({...ruleConfig, type: e.target.value as any})}
              >
                <option value="SIMPLE">Firma Simple (Cualquier firmante)</option>
                <option value="COMBINED">Combinada (Múltiples grupos)</option>
              </select>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <label className="text-[10px] font-black text-orange-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Info size={12} /> Mínimo de firmas requeridas
                </label>
                <input 
                  type="number" 
                  min={1}
                  className="w-full p-2 border border-orange-200 rounded bg-white text-sm font-bold text-orange-900 outline-none"
                  value={ruleConfig.minSignatures}
                  onChange={(e) => setRuleConfig({...ruleConfig, minSignatures: parseInt(e.target.value)})}
                />
              </div>
              <button 
                onClick={handleSaveRule}
                className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-100"
              >
                GUARDAR CONFIGURACIÓN
              </button>
            </div>

            {/* Listado de Reglas Existentes */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Reglas Activas</p>
              {existingRules.length > 0 ? (
                existingRules.map((rule, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-600 flex justify-between">
                    <span>{rule.requirementType}</span>
                    <span className="text-blue-600">Min: {rule.config.min_signatures}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No hay reglas configuradas aún.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bonus (UI): Preview de PDF */}
      <PDFPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        fileUrl={selectedDoc.url} 
        title={selectedDoc.title} 
      />
    </div>
  );
}