import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Eye, 
  ChevronRight, 
  ChevronLeft, 
  DollarSign,
  Tag
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const priorityStyles: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    Baixa: { bg: 'bg-slate-700/60', text: 'text-slate-300', border: 'border-slate-600' },
    Média: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30' },
    Alta: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
    Urgente: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  };

  const currentPriorityStyle = priorityStyles[task.priority] || priorityStyles['Média'];

  const formatCurrency = (val?: number) => {
    if (!val && val !== 0) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Determine available next/prev status movements
  const getPrevStatus = (s: TaskStatus): TaskStatus | null => {
    if (s === 'em andamento') return 'não iniciados';
    if (s === 'finalizado') return 'em andamento';
    return null;
  };

  const getNextStatus = (s: TaskStatus): TaskStatus | null => {
    if (s === 'não iniciados') return 'em andamento';
    if (s === 'em andamento') return 'finalizado';
    return null;
  };

  const prevStatus = getPrevStatus(task.status);
  const nextStatus = getNextStatus(task.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={handleDragStart}
      className="group relative bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      {/* Top Header: Category & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${currentPriorityStyle.bg} ${currentPriorityStyle.text} ${currentPriorityStyle.border}`}
          >
            {task.priority}
          </span>
          {task.category && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 border border-slate-600/50 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5 opacity-70" />
              {task.category}
            </span>
          )}
        </div>

        {/* Action Buttons: Direct Delete & Options Menu */}
        <div className="flex items-center gap-1">
          <button
            id={`btn-direct-delete-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors opacity-80 hover:opacity-100"
            title="Excluir tarefa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              id={`btn-menu-${task.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Opções"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-7 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-30 py-1 text-xs"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  id={`btn-view-${task.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onSelectTask(task);
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ver detalhes</span>
                </button>
                <button
                  id={`btn-edit-${task.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEditTask(task);
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Editar</span>
                </button>
                <button
                  id={`btn-delete-${task.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDeleteTask(task.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-rose-300 hover:bg-rose-950/50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h3
        onClick={() => onSelectTask(task)}
        className="text-sm font-semibold text-slate-100 hover:text-indigo-300 cursor-pointer line-clamp-2 mb-2 transition-colors"
      >
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Client & Value Information */}
      <div className="space-y-1.5 mb-3 pt-1 border-t border-slate-700/50 text-xs text-slate-300">
        {task.client_name && (
          <div className="flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{task.client_name}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {task.value !== undefined && task.value > 0 ? (
            <div className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span>{formatCurrency(task.value)}</span>
            </div>
          ) : (
            <span />
          )}

          {task.due_date && (
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{task.due_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Shift Quick Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px]">
        {prevStatus ? (
          <button
            id={`btn-prev-status-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, prevStatus);
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            title={`Mover para ${prevStatus}`}
          >
            <ChevronLeft className="w-3 h-3" />
            <span className="capitalize">{prevStatus === 'não iniciados' ? 'Não iniciado' : 'Em andamento'}</span>
          </button>
        ) : (
          <div />
        )}

        {nextStatus ? (
          <button
            id={`btn-next-status-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, nextStatus);
            }}
            className="flex items-center gap-1 text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-600 px-2 py-1 rounded transition-colors ml-auto"
            title={`Mover para ${nextStatus}`}
          >
            <span className="capitalize">{nextStatus === 'em andamento' ? 'Em andamento' : 'Finalizado'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 ml-auto">
            ✓ Concluído
          </span>
        )}
      </div>
    </motion.div>
  );
};
