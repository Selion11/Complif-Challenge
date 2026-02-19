"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/services/auth.service';
import Link from 'next/link';

interface SignupForm {
  username: string;
  password: string;
  cuit_empresa: string;
  role: 'admin' | 'viewer'; 
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupForm>({
    username: '',
    password: '',
    cuit_empresa: '',
    role: 'viewer'
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData);
      router.push('/login?registered=true'); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-black">
        <h2 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Usuario" 
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <input 
            type="text" 
            placeholder="CUIT de la Empresa" 
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, cuit_empresa: e.target.value})}
            required
          />
          <select 
            className="w-full p-2 border rounded text-black"
            value={formData.role}
            onChange={(e) => setFormData({
                ...formData, 
                role: e.target.value as 'admin' | 'viewer' 
            })}
            >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
            </select>

          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Registrarse
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}