import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Upload, 
  Terminal, 
  ExternalLink,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  getActiveSupabaseCredentials, 
  saveCustomSupabaseCredentials, 
  clearCustomSupabaseCredentials, 
  testSupabaseConnection, 
  SUPABASE_TABLE_SQL,
  uploadLocalTasksToSupabase,
  getLocalTasks
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableExists?: boolean } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveSupabaseCredentials();
      setUrl(active.url);
      setAnonKey(active.anonKey);
      setIsCustom(active.isCustom);
      setTestResult(null);
      setUploadResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    // First save runtime credentials so test uses current form values
    if (url.trim() && anonKey.trim()) {
      saveCustomSupabaseCredentials(url.trim(), anonKey.trim());
    }

    const res = await testSupabaseConnection();
    setTesting(false);
    setTestResult(res);
    onConfigUpdated();
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseCredentials(url.trim(), anonKey.trim());
    onConfigUpdated();
    handleTestConnection();
  };

  const handleClearCustom = () => {
    clearCustomSupabaseCredentials();
    const active = getActiveSupabaseCredentials();
    setUrl(active.url);
    setAnonKey(active.anonKey);
    setIsCustom(false);
    setTestResult(null);
    setUploadResult(null);
    onConfigUpdated();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_TABLE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleUploadSampleTasks = async () => {
    setUploading(true);
    setUploadResult(null);
    const localTasks = getLocalTasks();
    const res = await uploadLocalTasksToSupabase(localTasks);
    setUploading(false);
    if (res.error) {
      setUploadResult(`Erro ao enviar: ${res.error}`);
    } else {
      setUploadResult(`Sucesso! ${res.count} tarefas enviadas para o Supabase.`);
      onConfigUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Conexão com o Supabase</h2>
              <p className="text-xs text-slate-400">Armazenamento em nuvem em tempo real</p>
            </div>
          </div>

          <button
            id="btn-close-supabase-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(80vh-100px)] overflow-y-auto custom-scrollbar">
          
          {/* Credentials Form */}
          <form onSubmit={handleSaveCredentials} className="space-y-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Credenciais do Projeto Supabase
              </h3>
              {isCustom && (
                <button
                  id="btn-reset-supabase-credentials"
                  type="button"
                  onClick={handleClearCustom}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar padrão</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                id="input-supabase-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzxyz.supabase.co"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                API Anon Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                id="input-supabase-anon-key"
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                id="btn-test-supabase-connection"
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !url || !anonKey}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
              </button>

              <button
                id="btn-save-supabase-credentials"
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-md"
              >
                Salvar Credenciais
              </button>
            </div>
          </form>

          {/* Test Status Feedback */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                testResult.success
                  ? testResult.tableExists === false
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  testResult.tableExists === false ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold mb-1">
                    {testResult.success ? 'Resultado do Teste:' : 'Falha na Conexão:'}
                  </p>
                  <p>{testResult.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* SQL Script Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                SQL de Criação da Tabela <code className="text-indigo-300 lowercase">tasks</code>
              </h3>

              <button
                id="btn-copy-supabase-sql"
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Acesse o{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Supabase SQL Editor
                <ExternalLink className="w-3 h-3" />
              </a>{' '}
              e cole o código abaixo para preparar o banco de dados:
            </p>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-indigo-200/90 overflow-x-auto leading-relaxed select-all">
              {SUPABASE_TABLE_SQL}
            </pre>
          </div>

          {/* Sync / Upload Section */}
          <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Enviar Tarefas Locais para o Supabase
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Popula seu banco Supabase com as tarefas atualmente cadastradas.
              </p>
            </div>

            <button
              id="btn-upload-tasks-to-supabase"
              type="button"
              onClick={handleUploadSampleTasks}
              disabled={uploading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Enviando...' : 'Sincronizar para Supabase'}</span>
            </button>
          </div>

          {uploadResult && (
            <div className="p-3 bg-slate-800 text-emerald-300 text-xs rounded-xl border border-emerald-500/30">
              {uploadResult}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            id="btn-close-supabase-modal-footer"
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow"
          >
            Concluído
          </button>
        </div>

      </div>
    </div>
  );
};
