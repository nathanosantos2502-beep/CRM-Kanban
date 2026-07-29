export type TaskStatus = 'não iniciados' | 'em andamento' | 'finalizado';

export type TaskPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface Task {
  id: string;
  title: string;
  description?: string;
  client_name?: string;
  contact_info?: string;
  value?: number;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  due_date?: string; // YYYY-MM-DD format
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isCustom: boolean; // Set true if user entered via UI
}

export interface FilterState {
  search: string;
  category: string;
  priority: string;
}
