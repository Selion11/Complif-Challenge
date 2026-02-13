"use client";

import { useState } from 'react';
import { createCompany } from '@/services/company.service';
import { useRouter } from 'next/navigation';

export default function RegisterCompanyPage() {
  const [form, setForm] = useState({ name: '', cuit: '', country: '', industry: '' });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    certificado: null,
    constancia: null,
    poliza: null
  });
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files) setFiles({ ...files, [field]: e.target.files[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Agregamos datos básicos
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    
    // Agregamos los archivos (alineado con tu backend)
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append('files', file); 
    });

    try {
      await createCompany(formData);
      router.push('/dashboard');
    } catch (err) {
      alert("Error al registrar la empresa");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md text-black">
      <h1 className="text-2xl font-bold mb-6">Registrar Nueva Empresa</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos de texto */}
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Nombre de Empresa" className="p-2 border rounded" onChange={e => setForm({...form, name: e.target.value})} required />
          <input type="text" placeholder="CUIT / Identificador" className="p-2 border rounded" onChange={e => setForm({...form, cuit: e.target.value})} required />
        </div>

        {/* Upload de Documentos */}
        <div className="space-y-3 pt-4 border-t">
          <label className="block text-sm font-semibold">Certificado Fiscal (PDF)</label>
          <input type="file" accept=".pdf" onChange={e => handleFileChange(e, 'certificado')} className="text-sm" />
          
          <label className="block text-sm font-semibold">Póliza de Seguro (PDF)</label>
          <input type="file" accept=".pdf" onChange={e => handleFileChange(e, 'poliza')} className="text-sm" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
          Crear Legajo de Empresa
        </button>
      </form>
    </div>
  );
}