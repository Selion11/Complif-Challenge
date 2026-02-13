"use client";

import { useEffect, useState } from 'react';
import { signDocument } from '@/services/signature.service';
import { CheckCircle, Clock, FileText } from 'lucide-react';

export default function SignaturesPage() {
  const [requests, setRequests] = useState<any[]>([]); 

  const handleSign = async (id: number) => {
    try {
      await signDocument(id); //
      alert("Documento firmado con éxito"); //
    } catch (err) {
      alert("Error al procesar la firma");
    }
  };

  return (
    <div className="space-y-6 text-black">
      <h1 className="text-2xl font-bold">Mis Firmas Pendientes</h1>
      <div className="grid gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><FileText /></div>
            <div>
              <p className="font-bold text-slate-800">Firma de Contrato de Servicios</p>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> Pendiente de tu grupo</p>
            </div>
          </div>
          <button 
            onClick={() => handleSign(123)}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all"
          >
            Firmar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}