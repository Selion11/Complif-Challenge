"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  getCompanyDetail, getRiskScore, updateSingleDocument,
  updateCompanyStatus, getStatusHistory 
} from '@/services/company.service';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import { 
  FileText, Clock, Users, X, Edit3, Ban, Check, ArrowUpRight, ChevronRight, Eye
} from 'lucide-react';
import Link from 'next/link';

export default function CompanyDetailPage() {
  const { cuit } = useParams();

  const [company, setCompany] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState({ url: '', title: '' });
  const [statusChange, setStatusChange] = useState({ status: '', comment: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!cuit) return;
    try {
      setLoading(true);
      const [detailsRes, riskRes, historyRes] = await Promise.all([
        getCompanyDetail(cuit as string),
        getRiskScore(cuit as string),
        getStatusHistory(cuit as string)
      ]);
      setCompany(detailsRes.data || detailsRes);
      setRisk(riskRes.data || riskRes);
      setHistoryData(historyRes.data || []);
    } catch (error) {
      console.error("Error sincronizando CUIT:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [cuit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async () => {
    if (!statusChange.status || !statusChange.comment.trim()) {
      toast.error("Seleccione un estado y escriba un comentario");
      return;
    }
    try {
      setIsProcessing(true);
      await updateCompanyStatus(cuit as string, statusChange.status, statusChange.comment);
      toast.success(`Dictamen registrado`);
      setIsEditingStatus(false);
      setStatusChange({ status: '', comment: '' });
      fetchData();
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "Fallo en la resolución"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file || !cuit) return;
    const formData = new FormData();
    formData.append(type, file); 

    try {
      setUploadingType(type);
      const response = await updateSingleDocument(String(cuit), formData);
      if (response.success) {
        toast.success(`${type} actualizado`);
        await fetchData(); 
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al subir");
    } finally {
      setUploadingType(null);
    }
  };

  const openPreview = (doc: any) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';
    setSelectedDoc({ url: `${backendUrl}/${doc.ruta_archivo}`, title: doc.tipo });
    setIsPreviewOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-[0.4em] animate-pulse">Cargando CUIT...</div>;
  if (!company) return <div className="min-h-screen flex items-center justify-center text-red-500 font-black uppercase border-4 border-red-500">Empresa no encontrada</div>;

  return (
    <div className="min-h-screen bg-white text-black px-6 pb-24 max-w-7xl mx-auto border-x-4 border-black">
      
      {/* NAVEGACIÓN */}
      <nav className="py-8 border-b-4 border-black mb-12 flex items-center gap-4 relative z-50">
        <Link href="/dashboard" className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
          ← VOLVER AL PANEL
        </Link>
        <div className="h-4 w-[2px] bg-gray-200"></div>
        <span className="text-[10px] font-black uppercase text-gray-400">EXPEDIENTE DIGITAL: {company.cuit}</span>
      </nav>

      {/* CABECERA */}
      <header className="mb-20 relative z-40">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="text-left">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-4">{company.name}</h1>
            <p className="text-2xl font-bold tracking-[0.4em] text-gray-400">CUIT: {company.cuit}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-10 py-4 border-[6px] font-black text-lg uppercase tracking-widest ${
              company.status.includes('REJECTED') ? 'border-red-600 text-red-600' : 'border-black text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
            }`}>
              {company.status}
            </div>
            <button 
              onClick={() => setIsEditingStatus(true)}
              className="p-5 border-[6px] border-black bg-black text-white hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] cursor-pointer"
            >
              <Edit3 size={32} />
            </button>
          </div>
        </div>

        {isEditingStatus && (
          <div className="mt-12 p-10 border-[10px] border-black bg-white shadow-[20px_20px_0px_0px_rgba(37,99,235,0.1)] relative z-50">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">DICTAMEN TÉCNICO</h2>
              <X className="cursor-pointer hover:rotate-90 transition-transform" size={40} onClick={() => setIsEditingStatus(false)} />
            </div>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <button onClick={() => setStatusChange({...statusChange, status: 'APPROVED'})}
                className={`py-8 border-4 font-black uppercase flex items-center justify-center gap-4 cursor-pointer transition-all ${statusChange.status === 'APPROVED' ? 'bg-black text-white' : 'bg-white border-gray-100'}`}>
                <Check size={28}/> APROBAR
              </button>
              <button onClick={() => setStatusChange({...statusChange, status: 'REJECTED'})}
                className={`py-8 border-4 font-black uppercase flex items-center justify-center gap-4 cursor-pointer transition-all ${statusChange.status === 'REJECTED' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-100'}`}>
                <Ban size={28}/> RECHAZAR
              </button>
            </div>
            <textarea className="w-full p-8 border-4 border-black font-bold text-lg bg-gray-50 mb-8 min-h-[200px] outline-none"
              placeholder="Justificación..." value={statusChange.comment} onChange={(e) => setStatusChange({...statusChange, comment: e.target.value})} />
            <div className="flex gap-4">
              <button onClick={() => setIsEditingStatus(false)} className="flex-1 py-6 border-4 border-black font-black uppercase cursor-pointer">CANCELAR</button>
              <button onClick={handleStatusUpdate} disabled={isProcessing} className="flex-[2] bg-black text-white py-6 font-black uppercase text-xl cursor-pointer hover:bg-blue-600">
                {isProcessing ? 'PROCESANDO...' : 'GUARDAR RESOLUCIÓN'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* CUERPO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8 space-y-24">
          <section className="relative z-30">
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-[12px] border-black pb-4 mb-12 flex items-center gap-4">
              <FileText size={40}/> DOCUMENTACIÓN TÉCNICA
            </h2>
            <div className="space-y-6">
              {['certificadoFiscal', 'constanciaInscripcion', 'polizaSeguro'].map((type) => {
                const doc = company.documentos?.find((d: any) => d.tipo === type);
                return (
                  <div key={type} className="relative z-30 flex items-center justify-between p-10 border-4 border-black hover:bg-gray-50 transition-all">
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] block mb-2">TIPO DE ARCHIVO</span>
                      <span className="text-2xl font-black uppercase tracking-tight">{type.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <div className="flex gap-4 items-center relative z-40">
                      {doc ? (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openPreview(doc); }} 
                          className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-white border-4 border-black text-xs font-black uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                        >
                          <Eye size={18}/> VER PDF
                        </button>
                      ) : (
                        <span className="text-xs font-black uppercase text-red-500 italic mr-4 tracking-widest">FALTA CARGAR</span>
                      )}
                      
                      <label className={`cursor-pointer border-4 border-black px-6 py-3 text-xs font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] ${
                        uploadingType === type ? 'bg-gray-200 animate-pulse' : 'bg-black text-white hover:bg-white hover:text-black'
                      }`}>
                        {uploadingType === type ? 'SUBIENDO...' : doc ? 'REEMPLAZAR' : 'CARGAR PDF'}
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleSingleUpload(e, type)} disabled={!!uploadingType} />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-[12px] border-black pb-4 mb-12 flex items-center gap-4">
              <Clock size={40}/> AUDITORÍA DE CAMBIOS
            </h2>
            <div className="space-y-8">
              {historyData.map((h: any) => (
                <div key={h.id} className="border-4 border-black p-10 relative">
                  <div className="flex justify-between items-start mb-8">
                    <span className="bg-black text-white px-6 py-2 text-xs font-black uppercase tracking-widest">{h.estado_nuevo}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">{new Date(h.createdAt).toLocaleString('es-AR')}</span>
                  </div>
                  <p className="text-2xl font-bold italic leading-tight mb-8">"{h.comentario || h.comment}"</p>
                  <div className="pt-6 border-t-4 border-gray-100 flex items-center gap-3">
                    <Users size={20}/>
                    <span className="text-xs font-black uppercase">RESPONSABLE: {h.User?.username || 'SISTEMA'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 space-y-12 relative z-20">
            <div className="bg-black p-12 text-white border-b-[24px] border-blue-600 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)]">
              <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500 mb-10">COMPLIANCE SCORE</h3>
              <div className="text-9xl font-black mb-10 leading-none tracking-tighter">
                {risk?.riskScore ?? company.riskScore}<span className="text-3xl text-gray-600">/100</span>
              </div>
              <div className="w-full bg-gray-800 h-6">
                <div className="bg-blue-500 h-full transition-all duration-1000 ease-out" style={{ width: `${risk?.riskScore ?? company.riskScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PDFPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        fileUrl={selectedDoc.url} 
        title={selectedDoc.title} 
      />
    </div>
  );
}