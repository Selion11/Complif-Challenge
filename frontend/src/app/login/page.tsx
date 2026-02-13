"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth.service';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      router.push('/dashboard'); // Solo si el login es exitoso
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-black">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input 
          type="text" 
          placeholder="Usuario" 
          className="block w-full p-2 border mb-4 text-black"
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          className="block w-full p-2 border mb-4 text-black"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Entrar
        </button>
      </form>
    </div>
  );
}