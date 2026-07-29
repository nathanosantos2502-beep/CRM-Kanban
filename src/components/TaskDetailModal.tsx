import React from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Tag, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!isOpen || !task) return null;

  const formatCurrency = (val?: number) => {
    if (!val && val !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não definida';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              {task.priority}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {task.category || 'Geral'}
            </span>
          </div>

          <button
            id="btn-close-detail-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title & Status */}
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{task.title}</h2>
            
            {/* Status change selector */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-400 font-medium">Status Atual:</span>
              <select
                id="select-detail-status"
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-indigo-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="não iniciados">Não Iniciados</option>
                <option value="em andamento">Em Andamento</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Valor da Oportunidade
              </p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(task.value)}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Data de Entrega / Prazo
              </p>
              <p className="text-sm font-semibold text-slate-200 mt-1">{formatDate(task.due_date)}</p>
            </div>
          </div>

          {/* Client & Contact Info */}
          {(task.client_name || task.contact_info) && (
            <div className="space-y-2 bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Informações do Cliente
              </p>
              {task.client_name && (
                <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{task.client_name}</span>
                </div>
              )}
              {task.contact_info && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{task.contact_info}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Descrição e Anotações
              </h4>
              <p className="text-sm text-slate-300 bg-slate-800/30 p-3.5 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Criado em: {formatDate(task.created_at)}</span>
            <span>ID: {task.id.substring(0, 8)}...</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            id="btn-detail-delete"
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-detail-edit"
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>
            <button
              id="btn-detail-close"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
