import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskStatus, FilterState, SupabaseConfig } from './types';
import { 
  fetchAllTasks, 
  createNewTask, 
  updateExistingTask, 
  updateTaskStatusInDb, 
  deleteTaskFromDb, 
  deleteAllTasksFromDb,
  getActiveSupabaseCredentials, 
  testSupabaseConnection 
} from './lib/supabase';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { Database, Plus, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    isConnected: false,
    isCustom: false,
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    priority: '',
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState<TaskStatus>('não iniciados');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Delete Confirmation Modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    taskId?: string;
    isClearAll?: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Check Supabase status & load tasks
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    const activeCreds = getActiveSupabaseCredentials();

    // Test connection
    const testRes = await testSupabaseConnection();
    setSupabaseConfig({
      url: activeCreds.url,
      anonKey: activeCreds.anonKey,
      isConnected: testRes.success && testRes.tableExists !== false,
      isCustom: activeCreds.isCustom,
    });

    // Fetch tasks
    const { tasks: fetchedTasks } = await fetchAllTasks();
    setTasks(fetchedTasks);
    setLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Extract unique categories for filter
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        !filters.search ||
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (task.client_name && task.client_name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (task.category && task.category.toLowerCase().includes(filters.search.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()));

      const matchCategory = !filters.category || task.category === filters.category;
      const matchPriority = !filters.priority || task.priority === filters.priority;

      return matchSearch && matchCategory && matchPriority;
    });
  }, [tasks, filters]);

  // Handlers
  const handleOpenNewTaskModal = (status: TaskStatus = 'não iniciados') => {
    setEditingTask(null);
    setDefaultModalStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    if (taskData.id) {
      // Update
      const existing = tasks.find((t) => t.id === taskData.id);
      if (existing) {
        const updated = await updateExistingTask({ ...existing, ...taskData });
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        if (selectedTask?.id === updated.id) {
          setSelectedTask(updated);
        }
      }
    } else {
      // Create
      const created = await createNewTask(taskData);
      setTasks((prev) => [created, ...prev]);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
    );

    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    await updateTaskStatusInDb(taskId, newStatus);
  };

  // Request deletion of a single task
  const onRequestDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    const titleName = taskToDelete ? `"${taskToDelete.title}"` : 'esta tarefa';

    setDeleteModalState({
      isOpen: true,
      taskId,
      isClearAll: false,
      title: 'Excluir Tarefa',
      message: `Tem certeza que deseja apagar ${titleName}? A ação não poderá ser desfeita.`,
    });
  };

  // Request clear all data
  const onRequestClearAll = () => {
    setDeleteModalState({
      isOpen: true,
      isClearAll: true,
      title: 'Apagar Todas as Tarefas',
      message: 'Tem certeza que deseja apagar TODOS os dados do CRM? Esta operação limpará seu quadro e o banco de dados.',
    });
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (deleteModalState.isClearAll) {
      setTasks([]);
      setIsDetailModalOpen(false);
      setSelectedTask(null);
      await deleteAllTasksFromDb();
    } else if (deleteModalState.taskId) {
      const targetId = deleteModalState.taskId;
      setTasks((prev) => prev.filter((t) => t.id !== targetId));
      if (selectedTask?.id === targetId) {
        setIsDetailModalOpen(false);
        setSelectedTask(null);
      }
      await deleteTaskFromDb(targetId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* Header */}
      <Header
        filters={filters}
        onFilterChange={setFilters}
        onOpenNewTaskModal={() => handleOpenNewTaskModal('não iniciados')}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        supabaseConfig={supabaseConfig}
        categories={availableCategories}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
        onClearAllData={tasks.length > 0 ? onRequestClearAll : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner if Supabase is not connected */}
        {!supabaseConfig.isConnected && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200">
                  Banco Supabase não configurado ou aguardando tabela
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  O sistema está utilizando armazenamento local. Conecte ao seu projeto Supabase para salvar seus dados na nuvem.
                </p>
              </div>
            </div>

            <button
              id="btn-banner-connect-supabase"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2 shrink-0"
            >
              <Database className="w-4 h-4" />
              <span>Configurar Supabase</span>
            </button>
          </div>
        )}

        {/* Metrics Bar */}
        <MetricsBar tasks={filteredTasks} />

        {/* Kanban Board */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm font-medium">Carregando tarefas do CRM...</p>
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onSelectTask={handleSelectTask}
            onEditTask={handleEditTask}
            onDeleteTask={onRequestDeleteTask}
            onStatusChange={handleStatusChange}
            onAddNewTaskForStatus={(status) => handleOpenNewTaskModal(status)}
          />
        )}
      </main>

      {/* Floating Action Button for Adding New Task */}
      <button
        id="btn-fab-new-task"
        onClick={() => handleOpenNewTaskModal('não iniciados')}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-2xl hover:shadow-indigo-500/30 transition-all flex items-center gap-2 group"
        title="Criar nova tarefa no CRM"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
        <span className="font-semibold text-sm hidden sm:inline pr-1">Nova Tarefa</span>
      </button>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultStatus={defaultModalStatus}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(task) => {
          setIsDetailModalOpen(false);
          handleEditTask(task);
        }}
        onDelete={onRequestDeleteTask}
        onStatusChange={handleStatusChange}
      />

      {/* Supabase Configuration & Migration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={refreshData}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={deleteModalState.title}
        message={deleteModalState.message}
        confirmText={deleteModalState.isClearAll ? 'Apagar Tudo' : 'Excluir'}
      />
    </div>
  );
}
