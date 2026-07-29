import React from 'react';
import { CheckCircle2, Clock, DollarSign, Layers } from 'lucide-react';
import { Task } from '../types';

interface MetricsBarProps {
  tasks: Task[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  
  const notStartedCount = tasks.filter((t) => t.status === 'não iniciados').length;
  const inProgressCount = tasks.filter((t) => t.status === 'em andamento').length;
  const completedCount = tasks.filter((t) => t.status === 'finalizado').length;

  const totalValue = tasks.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const completedValue = tasks
    .filter((t) => t.status === 'finalizado')
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      
      {/* Total Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs text-slate-400 font-medium">Total de Tarefas</p>
          <p className="text-xl font-bold text-slate-100 mt-1">{totalTasks}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* In Progress Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs text-slate-400 font-medium">Em Andamento</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-amber-300">{inProgressCount}</span>
            <span className="text-xs text-slate-400">({notStartedCount} a iniciar)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Completed Card */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs text-slate-400 font-medium">Finalizados</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-300">{completedCount}</span>
            <span className="text-xs text-emerald-400/90 font-medium">({completionPercentage}%)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Total Pipeline Value */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs text-slate-400 font-medium">Valor no Funil</p>
          <p className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(totalValue)}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
};
