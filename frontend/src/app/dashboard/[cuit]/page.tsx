"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  getCompanyDetail, 
  updateCompanyStatus, 
  getRiskScore 
} from '@/services/company.service';
import { 
  createGroup, 
  createRule, 
  getRulesByCompany,
  createSignatureRequest 
} from '@/services/signature.service';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import { 
  ShieldCheck, FileText, Clock, CheckCircle, 
  XCircle, Building2, Eye, Users, Settings, Plus, Info, Send
} from 'lucide-react';

export default function CompanyDetailPage() {
  const { cuit } = useParams();

  // --- ESTADOS ---
  const [company, setCompany] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'legajo' | 'gobernanza'>('legajo');
  const [groupData, setGroupData] = useState({ name: '', description: '' });
  const [ruleConfig, setRuleConfig] = useState({ type: 'SIMPLE', minSignatures: 1 });
  const [existingRules, setExistingRules] = useState<any[]>([]);
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
      toast.error("Error al cargar datos del legajo");
    } finally {
      setLoading(false);
    }
  }, [cuit]);

  const fetchRules = useCallback(async () => {
    try {
      const rules = await getRulesByCompany(cuit as string);
      setExistingRules(rules);
    } catch (error) {
      console.error("Error al cargar reglas");
    }
  }, [cuit]);

  useEffect(() => { if (cuit) fetchData(); }, [cuit, fetchData]);
  useEffect(() => { if (activeTab === 'gobernanza') fetchRules(); }, [activeTab, fetchRules]);

  // --- MANEJADORES ---
  const handleRequestSignature = async (docName: string) => {
    try {
      const docId = docName === 'Certificado Fiscal' ? 1 : 2; 
      await createSignatureRequest({
        companyCuit: cuit as string,
        documentId: docId,
        title: `Firma requerida: ${docName}`
      });
      toast.success(`Solicitud de firma enviada para ${docName}`);
    } catch (error) {
      toast.error("Error al iniciar proceso de firma");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupData.name) return toast.error("Nombre de grupo requerido");
    try {
      await createGroup(groupData.name, groupData.description);
      toast.success("Grupo creado con éxito");
      setGroupData({ name: '', description: '' });
    } catch (error) { toast.error("Error al crear grupo"); }
  };

  const handleSaveRule = async () => {
    try {
      const config = { min_signatures: ruleConfig.minSignatures };
      await createRule(cuit as string, ruleConfig.type, config);
      toast.success("Regla de firma guardada");
      fetchRules();
    } catch (error) { toast.error("Error al guardar regla"); }
  };

  const handleStatusUpdate = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (!comment.trim()) return toast.error("El comentario es obligatorio");
    try {
      setIsUpdating(true);
      await updateCompanyStatus(cuit as string, newStatus, comment);
      setComment('');
      toast.success(`Estado actualizado a ${newStatus}`);
      await fetchData();
    } catch (error) { toast.error("Error al actualizar estado"); }
    finally { setIsUpdating(false); }
  };

  const openPreview = (docType: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const fileName = `${company.cuit}-${docType.toLowerCase().replace(/ /g, '_')}.pdf`;
    const url = `${backendUrl}/uploads/${fileName}`;
    setSelectedDoc({ url, title: docType });
    setIsPreviewOpen(true);
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Cargando legajo operacional...</div>;
  if (!company) return <div className="p-10 text-center text-red-500 font-bold">Empresa no encontrada.</div>;

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{company.name}</h1>
            <p className="text-slate-500 font-medium italic text-sm">CUIT: {company.cuit} • {company.country}</p>
          </div>
          <div className={`px-6 py-2 rounded-full border-2 font-black text-xs ${
            company.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
            company.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}>{company.status}</div>
        </div>
        <div className="flex gap-8 mt-6 border-t pt-4">
          <button onClick={() => setActiveTab('legajo')} className={`flex items-center gap-2 pb-2 font-bold text-sm transition-all ${activeTab === 'legajo' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}><FileText size={18} /> Legajo</button>
          <button onClick={() => setActiveTab('gobernanza')} className={`flex items-center gap-2 pb-2 font-bold text-sm transition-all ${activeTab === 'gobernanza' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}><Users size={18} /> Gobernanza</button>
        </div>
      </div>

      {activeTab === 'legajo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="text-blue-400" /> Compliance Risk</h3>
              <div className="text-5xl font-black text-blue-400 mt-2">{risk?.score ?? '00'}<span className="text-lg text-white/30">/100</span></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><FileText size={20} className="text-slate-400" /> Documentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Certificado Fiscal', 'Poliza Seguro'].map((doc) => (
                  <div key={doc} className="flex flex-col gap-3 p-4 border-2 border-slate-50 rounded-xl hover:border-blue-100 transition-all">
                    <span className="font-semibold text-slate-700 text-sm">{doc}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openPreview(doc)} className="flex-1 bg-white border px-3 py-1.5 rounded-lg text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors">Preview</button>
                      <button onClick={() => handleRequestSignature(doc)} className="flex-1 bg-orange-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-orange-700 transition-colors flex items-center justify-center gap-1"><Send size={12}/> Firmar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border-2 border-slate-900/5 shadow-sm h-fit">
            <h3 className="text-lg font-bold mb-4">Auditoría</h3>
            <textarea className="w-full bg-slate-50 border rounded-xl p-4 text-sm outline-none mb-4 focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Motivo..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button disabled={isUpdating} onClick={() => handleStatusUpdate('APPROVED')} className="w-full bg-green-600 text-white py-3 rounded-xl font-black mb-2 shadow-lg shadow-green-100">APROBAR</button>
            <button disabled={isUpdating} onClick={() => handleStatusUpdate('REJECTED')} className="w-full border-2 border-red-600 text-red-600 py-3 rounded-xl font-black">RECHAZAR</button>
          </div>
        </div>
      )}

      {activeTab === 'gobernanza' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={20} className="text-blue-500" /> Grupos</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre..." className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={groupData.name} onChange={(e) => setGroupData({...groupData, name: e.target.value})} />
              <textarea placeholder="Descripción..." className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" rows={2} value={groupData.description} onChange={(e) => setGroupData({...groupData, description: e.target.value})} />
              <button onClick={handleCreateGroup} className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 transition-colors"><Plus size={18}/> CREAR GRUPO</button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings size={20} className="text-orange-500" /> Reglas</h3>
            <div className="space-y-4">
              <select className="w-full p-2.5 border rounded-lg text-sm bg-slate-50 outline-none" value={ruleConfig.type} onChange={(e) => setRuleConfig({...ruleConfig, type: e.target.value as any})}>
                <option value="SIMPLE">Firma Simple</option>
                <option value="COMBINED">Combinada</option>
              </select>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <label className="text-[10px] font-black text-orange-700 uppercase flex items-center gap-1 mb-1"><Info size={12} /> Min. Firmas</label>
                <input type="number" min={1} className="w-full p-2 border rounded bg-white text-sm font-bold" value={ruleConfig.minSignatures} onChange={(e) => setRuleConfig({...ruleConfig, minSignatures: parseInt(e.target.value)})} />
              </div>
              <button onClick={handleSaveRule} className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-bold shadow-md hover:bg-orange-700 transition-colors">GUARDAR REGLA</button>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Activas</p>
              {existingRules.map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border rounded-lg text-xs font-semibold text-slate-600 flex justify-between mb-2">
                  <span>{rule.requirementType}</span>
                  <span className="text-blue-600">Min: {rule.config.min_signatures}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <PDFPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} fileUrl={selectedDoc.url} title={selectedDoc.title} />
    </div>
  );
}