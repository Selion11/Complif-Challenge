"use client";

import { useEffect, useState, useCallback } from 'react';
import { signDocument, getSignatureRequests, createSignatureRequest } from '@/services/signature.service';
import { FileText, CheckCircle2, Loader2, PenTool, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignaturesPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ accion: 'CREATE_WIRE', descripcion: '' });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSignatureRequests();
      setRequests(response.data || response || []);
    } catch (err) {
      toast.error("Error al cargar firmas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ Validamos que no viajen nulos al backend
    if (!newRequest.descripcion.trim()) {
      toast.error("La descripción es obligatoria");
      return;
    }

    try {
      await createSignatureRequest(newRequest); 
      toast.success("Solicitud creada exitosamente");
      setShowModal(false);
      setNewRequest({ accion: 'CREATE_WIRE', descripcion: '' });
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al crear la solicitud");
    }
  };

  const handleSign = async (id: string) => {
    try {
      await signDocument(id); 
      toast.success("Documento firmado correctamente");
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al procesar la firma");
    }
  };

  return (
    <div className="relative min-h-screen space-y-6 text-black">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Mis Firmas Pendientes</h1>
          <p className="text-slate-500 text-sm font-medium">Gestiona y autoriza las solicitudes de tu grupo.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase tracking-tighter"
        >
          <Plus size={18} /> Nueva Solicitud
        </button>
      </div>

      {/* ✅ MODAL CON FONDO SÓLIDO Y CENTRADO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay oscuro para enfoque */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          {/* Contenedor del Modal - Fondo Blanco Sólido */}
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8" style={{ backgroundColor: 'beige' }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Crear Solicitud</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-[0.2em]">Tipo de Facultad</label>
                  <select 
                    required
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none"
                    value={newRequest.accion}
                    onChange={(e) => setNewRequest({...newRequest, accion: e.target.value})}
                  >
                    <option value="CREATE_WIRE">Crear Transferencia</option>
                    <option value="APPROVE_WIRE">Aprobar Transferencia</option>
                    <option value="REQUEST_LOAN">Solicitar Préstamo</option>
                    <option value="MODIFY_CONTACT_INFO">Modificar Contacto</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-[0.2em]">Descripción Detallada</label>
                  <textarea 
                    required
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white min-h-[120px] resize-none transition-all placeholder:text-slate-300"
                    placeholder="Describe el motivo de esta solicitud..."
                    value={newRequest.descripcion}
                    onChange={(e) => setNewRequest({...newRequest, descripcion: e.target.value})}
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-blue-600 active:scale-[0.98] transition-all uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200"
                  >
                    Publicar Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LISTADO DE SOLICITUDES */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Sincronizando legajos...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
          <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-500" size={40} />
          </div>
          <p className="text-slate-900 font-black text-2xl mb-2 tracking-tight">¡Todo al día!</p>
          <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">
            No tienes solicitudes de firma pendientes en este momento.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:border-blue-400 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <FileText size={32} />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-xl leading-none mb-2 tracking-tight">
                    {req.descripcion}
                  </p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                      <PenTool size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{req.accion}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono font-bold tracking-tighter">
                      REF: {req.id.substring(0, 8)}
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleSign(req.id)}
                className="mt-4 md:mt-0 w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-600 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-100"
              >
                Firmar Ahora
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}