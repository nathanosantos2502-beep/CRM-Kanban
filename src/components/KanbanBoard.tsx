import React from 'react';
import { Task, TaskStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddNewTaskForStatus: (status: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddNewTaskForStatus,
}) => {
  const notStartedTasks = tasks.filter((t) => t.status === 'não iniciados');
  const inProgressTasks = tasks.filter((t) => t.status === 'em andamento');
  const finishedTasks = tasks.filter((t) => t.status === 'finalizado');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
      <KanbanColumn
        status="não iniciados"
        title="Não Iniciados"
        tasks={notStartedTasks}
        onSelectTask={onSelectTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onStatusChange={onStatusChange}
        onAddNewTaskForStatus={onAddNewTaskForStatus}
      />

      <KanbanColumn
        status="em andamento"
        title="Em Andamento"
        tasks={inProgressTasks}
        onSelectTask={onSelectTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onStatusChange={onStatusChange}
        onAddNewTaskForStatus={onAddNewTaskForStatus}
      />

      <KanbanColumn
        status="finalizado"
        title="Finalizado"
        tasks={finishedTasks}
        onSelectTask={onSelectTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onStatusChange={onStatusChange}
        onAddNewTaskForStatus={onAddNewTaskForStatus}
      />
    </div>
  );
};
