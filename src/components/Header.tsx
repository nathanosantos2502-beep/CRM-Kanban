import React from 'react';
import { Plus, Search, Filter, Database, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { FilterState, SupabaseConfig } from '../types';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onOpenNewTaskModal: () => void;
  onOpenSupabaseModal: () => void;
  supabaseConfig: SupabaseConfig;
  categories: string[];
  onRefresh: () => void;
  isRefreshing: boolean;
  onClearAllData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  onOpenNewTaskModal,
  onOpenSupabaseModal,
  supabaseConfig,
  categories,
  onRefresh,
  isRefreshing,
  onClearAllData,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg font-bold text-xl">
                K
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  CRM Kanban
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pro
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Gestão Visual de Tarefas e Leads</p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                id="btn-refresh-mobile"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                id="btn-new-task-mobile"
                onClick={onOpenNewTaskModal}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex-1 max-w-xl flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-search-tasks"
                type="text"
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                placeholder="Buscar tarefa, cliente ou tags..."
                className="w-full bg-slate-800 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              id="select-filter-category"
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="bg-slate-800 border border-slate-700/80 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 hidden sm:block"
            >
              <option value="">Todas Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              id="select-filter-priority"
              value={filters.priority}
              onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
              className="bg-slate-800 border border-slate-700/80 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 hidden sm:block"
            >
              <option value="">Todas Prioridades</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="btn-refresh-desktop"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
              title="Atualizar dados do quadro"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {onClearAllData && (
              <button
                id="btn-clear-all-desktop"
                onClick={onClearAllData}
                className="p-2 text-slate-400 hover:text-rose-300 bg-slate-800 hover:bg-rose-950/40 rounded-lg transition-colors border border-slate-700/60 hover:border-rose-500/30"
                title="Apagar todas as tarefas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Supabase Status Button */}
            <button
              id="btn-open-supabase-modal"
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>
                {supabaseConfig.isConnected ? 'Supabase Conectado' : 'Conectar Supabase'}
              </span>
              {supabaseConfig.isConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Create Task Button */}
            <button
              id="btn-new-task-desktop"
              onClick={onOpenNewTaskModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow-md flex items-center gap-2 hover:shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
