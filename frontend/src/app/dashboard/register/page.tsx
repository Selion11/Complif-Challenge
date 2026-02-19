"use client";

import { useState } from 'react';
import { createCompany } from '@/services/company.service';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterCompanyPage() {
  const [form, setForm] = useState({ name: '', cuit: '', country: '', industry: '' });
  
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    certificadoFiscal: null,
    constanciaInscripcion: null,
    polizaSeguro: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type !== 'application/pdf') {
        return toast.error("Solo se permiten archivos PDF");
      }
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    
    formData.append('name', form.name);
    formData.append('cuit', form.cuit);
    formData.append('country', form.country);
    formData.append('industry', form.industry);
    
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file); 
    });

    try {
      const response = await createCompany(formData);
      if (response.success) {
        toast.success("Empresa registrada con éxito");
        router.push('/dashboard');
      }
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        validationErrors.forEach((error: any) => toast.error(`${error.field}: ${error.message}`));
      } else {
        toast.error(err.response?.data?.message || "Error al registrar la empresa");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 text-black">
      <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm">
        <ArrowLeft size={16} /> Volver al Panel
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registro de Empresa</h1>
            <p className="text-slate-400 font-medium">Complete los campos de auditoría requeridos.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 ml-1">Nombre (name)</label>
              <input 
                type="text" 
                placeholder="Nombre de la empresa" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 ml-1">Identificador (cuit)</label>
              <input 
                type="text" 
                placeholder="CUIT" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                value={form.cuit}
                onChange={e => setForm({...form, cuit: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 ml-1">País (pais)</label>
              <input 
                type="text" 
                placeholder="Ej: Argentina" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                value={form.country}
                onChange={e => setForm({...form, country: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 ml-1">Industria (industria)</label>
              <input 
                type="text" 
                placeholder="Ej: Finanzas" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                value={form.industry}
                onChange={e => setForm({...form, industry: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
              <UploadCloud size={18} className="text-blue-500" /> Documentos del Legajo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'certificadoFiscal', label: 'Certificado Fiscal' },
                { key: 'constanciaInscripcion', label: 'Constancia AFIP' },
                { key: 'polizaSeguro', label: 'Póliza Seguros' }
              ].map((doc) => (
                <div key={doc.key} className="relative p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 transition-colors">
                  <label className="cursor-pointer block text-center">
                    <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">{doc.label}</span>
                    <span className="text-xs font-bold text-slate-600 truncate block">
                      {files[doc.key] ? files[doc.key]?.name : "Adjuntar PDF"}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={e => handleFileChange(e, doc.key)} />
                  </label>
                  {files[doc.key] && (
                    <div className="mt-2 text-[10px] text-green-600 font-bold uppercase text-center">
                      Archivo cargado ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:bg-slate-300 shadow-xl shadow-blue-200 active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} /> PROCESANDO ALTA...
              </span>
            ) : "FINALIZAR REGISTRO"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}