import React, { useState } from 'react';
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddNewTaskForStatus: (status: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddNewTaskForStatus,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const columnConfig: Record<
    TaskStatus,
    { icon: React.ReactNode; colorBar: string; badgeBg: string; textAccent: string }
  > = {
    'não iniciados': {
      icon: <Circle className="w-4 h-4 text-slate-400" />,
      colorBar: 'bg-slate-500',
      badgeBg: 'bg-slate-700/60 text-slate-300',
      textAccent: 'text-slate-200',
    },
    'em andamento': {
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      colorBar: 'bg-amber-500',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      textAccent: 'text-amber-300',
    },
    finalizado: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      colorBar: 'bg-emerald-500',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      textAccent: 'text-emerald-300',
    },
  };

  const currentConfig = columnConfig[status];

  const columnTotalValue = tasks.reduce((sum, t) => sum + (t.value || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl bg-slate-900/90 border transition-colors min-h-[520px] max-h-[calc(100vh-220px)] shadow-lg ${
        isDragOver
          ? 'border-indigo-500/80 bg-slate-900/95 ring-2 ring-indigo-500/30'
          : 'border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${currentConfig.colorBar}`} />
            {currentConfig.icon}
            <h2 className={`font-bold text-base ${currentConfig.textAccent}`}>
              {title}
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${currentConfig.badgeBg}`}>
              {tasks.length}
            </span>
          </div>

          <button
            id={`btn-add-column-${status.replace(/\s+/g, '-')}`}
            onClick={() => onAddNewTaskForStatus(status)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={`Adicionar tarefa em ${title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Column Value Subtitle */}
        {columnTotalValue > 0 && (
          <div className="text-xs text-slate-400 font-medium">
            Total na coluna: <span className="text-slate-200">{formatCurrency(columnTotalValue)}</span>
          </div>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-36 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs text-slate-500 font-medium">Nenhuma tarefa nesta coluna</p>
            <button
              id={`btn-empty-add-${status.replace(/\s+/g, '-')}`}
              onClick={() => onAddNewTaskForStatus(status)}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar tarefa</span>
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelectTask={onSelectTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>

      {/* Footer Add Button */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 rounded-b-2xl">
        <button
          id={`btn-footer-add-${status.replace(/\s+/g, '-')}`}
          onClick={() => onAddNewTaskForStatus(status)}
          className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-700/80 hover:border-indigo-500/60 text-slate-400 hover:text-indigo-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar tarefa</span>
        </button>
      </div>
    </div>
  );
};
