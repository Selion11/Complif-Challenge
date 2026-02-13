"use client";

import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export default function PDFPreviewModal({ isOpen, onClose, fileUrl, title }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header del Modal */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-all text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenedor del PDF */}
        <div className="flex-1 bg-slate-200 relative">
          <iframe 
            src={`${fileUrl}#toolbar=0&view=FitH`} 
            className="w-full h-full border-none"
            title="Vista previa del documento"
          />
        </div>

        {/* Footer (opcional) */}
        <div className="p-3 border-t bg-slate-50 text-right">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
}