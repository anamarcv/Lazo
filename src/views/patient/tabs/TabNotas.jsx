import React, { useState } from 'react';
import { 
  FileText, 
  Filter, 
  Plus, 
  Link as LinkIcon, 
  Calendar, 
  User, 
  CheckCircle,
  Search
} from 'lucide-react';

export default function TabNotas({ patient, onOpenNotaModal }) {
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const notas = patient.notas || [];

  const filteredNotas = notas.filter(n => {
    const matchesType = filterType === 'todos' || n.tipo === filterType;
    const matchesSearch = n.contenido.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.autor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en el texto de las notas..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs focus:outline-none focus:border-lazo-primary text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-lazo-canvas border border-slate-200/80 text-xs font-semibold text-slate-700 focus:outline-none focus:border-lazo-primary"
          >
            <option value="todos">Todos los tipos de nota</option>
            <option value="Nota de seguimiento">Notas de Seguimiento</option>
            <option value="Consulta médica">Consultas Médicas</option>
            <option value="Educación en salud">Educación en Salud</option>
            <option value="Administrativa">Administrativas</option>
          </select>

          <button
            onClick={onOpenNotaModal}
            className="px-4 py-2.5 rounded-2xl bg-lazo-primary text-white text-xs font-semibold hover:bg-lazo-primary-hover transition-colors flex items-center gap-2 shrink-0 shadow-soft"
          >
            <Plus className="w-4 h-4" />
            <span>Redactar nueva nota</span>
          </button>
        </div>
      </div>

      {/* Lista de Notas */}
      <div className="space-y-4">
        {filteredNotas.length > 0 ? (
          filteredNotas.map((nota) => (
            <div key={nota.id} className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-lazo-sage text-lazo-primary text-xs font-bold">
                    {nota.tipo}
                  </span>
                  {nota.vinculadaLlamada && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                      <LinkIcon className="w-3 h-3 text-lazo-primary" />
                      Vinculada a llamada {nota.vinculadaLlamada}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {nota.autor}
                  </span>
                  <span>·</span>
                  <span>{nota.fechaHora}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {nota.contenido}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Nota validada y firmada profesionalmente (NOM-004)
                </span>
                <span>ID: {nota.id}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 text-xs">
            No se encontraron notas que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}
