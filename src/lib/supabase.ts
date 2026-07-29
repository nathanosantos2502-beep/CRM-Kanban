import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, TaskStatus } from '../types';
import { INITIAL_TASKS } from '../data/initialTasks';

const STORAGE_KEY_CUSTOM_CONFIG = 'crm_supabase_custom_config';
const STORAGE_KEY_LOCAL_TASKS = 'crm_kanban_local_tasks';

export const SUPABASE_TABLE_SQL = `-- ==========================================
-- SQL COMPLETO PARA GERENCIAR E ARMAZENAR SUAS INFORMAÇÕES
-- Execute no Editor SQL do Supabase (https://app.supabase.com)
-- ==========================================

-- 1. Criar a tabela 'tasks'
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  contact_info TEXT,
  value NUMERIC(12,2) DEFAULT 0,
  priority TEXT DEFAULT 'Média',
  status TEXT NOT NULL DEFAULT 'não iniciados',
  category TEXT DEFAULT 'Geral',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar segurança em nível de linha (RLS) e permissão de Inserção / Exclusão / Leitura / Atualização
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso público leitura e escrita" ON public.tasks;

CREATE POLICY "Permitir acesso público leitura e escrita" 
ON public.tasks 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- COMANDOS SQL ÚTEIS PARA USO MANUAL (OPCIONAL):
-- ==========================================

-- Exemplo: Inserir um novo registro manualmente via SQL
-- INSERT INTO public.tasks (title, client_name, value, priority, status, category)
-- VALUES ('Nova Proposta Comercial', 'Empresa Exemplo', 5000.00, 'Alta', 'não iniciados', 'Vendas');

-- Exemplo: Apagar um registro específico pelo ID
-- DELETE FROM public.tasks WHERE id = 'SEU_UUID_AQUI';

-- Exemplo: Apagar TODOS os registros da tabela
-- DELETE FROM public.tasks;
`;

// Helper to get active credentials
export function getActiveSupabaseCredentials(): { url: string; anonKey: string; isCustom: boolean } {
  // Check localStorage for user-entered credentials in UI
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey, isCustom: true };
      }
    }
  } catch (e) {
    console.error('Error loading custom Supabase config from localStorage:', e);
  }

  // Check env variables
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
    isCustom: false,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getActiveSupabaseCredentials();
  
  if (!url || !anonKey || url.includes('your-supabase-project-id')) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (err) {
      console.error('Failed to instantiate Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function saveCustomSupabaseCredentials(url: string, anonKey: string) {
  const config = { url: url.trim(), anonKey: anonKey.trim() };
  localStorage.setItem(STORAGE_KEY_CUSTOM_CONFIG, JSON.stringify(config));
  supabaseInstance = null; // reset client instance
}

export function clearCustomSupabaseCredentials() {
  localStorage.removeItem(STORAGE_KEY_CUSTOM_CONFIG);
  supabaseInstance = null;
}

// Local storage helper fallback
export function getLocalTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LOCAL_TASKS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading local tasks:', e);
  }
  // Initialize with sample tasks if empty
  localStorage.setItem(STORAGE_KEY_LOCAL_TASKS, JSON.stringify(INITIAL_TASKS));
  return INITIAL_TASKS;
}

export function setLocalTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCAL_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving local tasks:', e);
  }
}

// Test Connection & Table Existence
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tableExists?: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Insira a URL e a Chave Anônima (Anon Key) do seu projeto Supabase.',
    };
  }

  try {
    const { data, error } = await client.from('tasks').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "tasks" does not exist') || error.message.includes('does not exist')) {
        return {
          success: true,
          tableExists: false,
          message: 'Conectado ao Supabase! Porém, a tabela "tasks" ainda não existe. Execute o SQL fornecido para criá-la.',
        };
      }
      return {
        success: false,
        message: `Erro no Supabase: ${error.message} (Código: ${error.code || 'N/A'})`,
      };
    }

    return {
      success: true,
      tableExists: true,
      message: 'Conectado com sucesso ao Supabase e tabela "tasks" pronta!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha ao conectar: ${err?.message || 'Erro de rede ou URL inválida.'}`,
    };
  }
}

// Data Services (Supabase + Local fallback)

export async function fetchAllTasks(): Promise<{ tasks: Task[]; source: 'supabase' | 'local'; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedTasks: Task[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          client_name: item.client_name || '',
          contact_info: item.contact_info || '',
          value: item.value ? Number(item.value) : 0,
          priority: item.priority || 'Média',
          status: (item.status as TaskStatus) || 'não iniciados',
          category: item.category || 'Geral',
          due_date: item.due_date || '',
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));

        // Mirror to local storage for offline resilience
        setLocalTasks(formattedTasks);
        return { tasks: formattedTasks, source: 'supabase' };
      } else if (error) {
        console.warn('Supabase fetch error, using local storage fallback:', error.message);
        return { tasks: getLocalTasks(), source: 'local', error: error.message };
      }
    } catch (err: any) {
      console.error('Failed to fetch from Supabase:', err);
    }
  }

  return { tasks: getLocalTasks(), source: 'local' };
}

export async function createNewTask(newTaskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const client = getSupabaseClient();
  const now = new Date().toISOString();
  
  // Create task object with fallback ID
  const tempId = crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`;
  const taskToSave: Task = {
    ...newTaskData,
    id: tempId,
    created_at: now,
    updated_at: now,
  };

  if (client) {
    try {
      const { data, error } = await client
        .from('tasks')
        .insert([
          {
            title: newTaskData.title,
            description: newTaskData.description || null,
            client_name: newTaskData.client_name || null,
            contact_info: newTaskData.contact_info || null,
            value: newTaskData.value || 0,
            priority: newTaskData.priority,
            status: newTaskData.status,
            category: newTaskData.category || 'Geral',
            due_date: newTaskData.due_date || null,
          }
        ])
        .select()
        .single();

      if (!error && data) {
        const createdFromSupabase: Task = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          client_name: data.client_name || '',
          contact_info: data.contact_info || '',
          value: data.value ? Number(data.value) : 0,
          priority: data.priority || 'Média',
          status: data.status as TaskStatus,
          category: data.category || 'Geral',
          due_date: data.due_date || '',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        // Update local cache
        const local = getLocalTasks();
        setLocalTasks([createdFromSupabase, ...local]);
        return createdFromSupabase;
      } else {
        console.warn('Supabase insert failed, saving locally:', error?.message);
      }
    } catch (err) {
      console.error('Error inserting to Supabase:', err);
    }
  }

  // Save to local storage
  const currentLocal = getLocalTasks();
  const updatedLocal = [taskToSave, ...currentLocal];
  setLocalTasks(updatedLocal);
  return taskToSave;
}

export async function updateExistingTask(task: Task): Promise<Task> {
  const client = getSupabaseClient();
  const updatedTask = { ...task, updated_at: new Date().toISOString() };

  if (client) {
    try {
      const { error } = await client
        .from('tasks')
        .update({
          title: task.title,
          description: task.description || null,
          client_name: task.client_name || null,
          contact_info: task.contact_info || null,
          value: task.value || 0,
          priority: task.priority,
          status: task.status,
          category: task.category || 'Geral',
          due_date: task.due_date || null,
          updated_at: updatedTask.updated_at,
        })
        .eq('id', task.id);

      if (error) {
        console.warn('Supabase update error:', error.message);
      }
    } catch (err) {
      console.error('Error updating in Supabase:', err);
    }
  }

  // Always update local storage
  const currentLocal = getLocalTasks();
  const newLocal = currentLocal.map((t) => (t.id === task.id ? updatedTask : t));
  setLocalTasks(newLocal);

  return updatedTask;
}

export async function updateTaskStatusInDb(taskId: string, newStatus: TaskStatus): Promise<void> {
  const client = getSupabaseClient();
  const now = new Date().toISOString();

  if (client) {
    try {
      const { error } = await client
        .from('tasks')
        .update({
          status: newStatus,
          updated_at: now,
        })
        .eq('id', taskId);

      if (error) {
        console.warn('Supabase status update error:', error.message);
      }
    } catch (err) {
      console.error('Error updating status in Supabase:', err);
    }
  }

  // Update local
  const currentLocal = getLocalTasks();
  const updated = currentLocal.map((t) => (t.id === taskId ? { ...t, status: newStatus, updated_at: now } : t));
  setLocalTasks(updated);
}

export async function deleteTaskFromDb(taskId: string): Promise<void> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client.from('tasks').delete().eq('id', taskId);
      if (error) {
        console.warn('Supabase delete error:', error.message);
      }
    } catch (err) {
      console.error('Error deleting from Supabase:', err);
    }
  }

  // Update local
  const currentLocal = getLocalTasks();
  const updated = currentLocal.filter((t) => t.id !== taskId);
  setLocalTasks(updated);
}

export async function deleteAllTasksFromDb(): Promise<void> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn('Supabase delete all error:', error.message);
      }
    } catch (err) {
      console.error('Error deleting all from Supabase:', err);
    }
  }

  // Clear local tasks
  setLocalTasks([]);
}

export async function uploadLocalTasksToSupabase(tasksToUpload: Task[]): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { count: 0, error: 'Cliente Supabase não configurado.' };
  }

  try {
    const payload = tasksToUpload.map((t) => ({
      title: t.title,
      description: t.description || null,
      client_name: t.client_name || null,
      contact_info: t.contact_info || null,
      value: t.value || 0,
      priority: t.priority,
      status: t.status,
      category: t.category || 'Geral',
      due_date: t.due_date || null,
    }));

    const { data, error } = await client.from('tasks').insert(payload).select();

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: data ? data.length : 0 };
  } catch (err: any) {
    return { count: 0, error: err?.message || 'Falha ao sincronizar dados.' };
  }
}
