import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Camera, 
  Mic, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export const SettingsPage: React.FC = () => {
  const { user, quota, isSupabaseConnected } = useAuth();
  const [deviceTestSuccess, setDeviceTestSuccess] = useState<string | null>(null);

  const testMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      setDeviceTestSuccess(`Success! Detected camera (${videoTracks[0]?.label || 'Active'}) and microphone (${audioTracks[0]?.label || 'Active'}).`);
      stream.getTracks().forEach(t => t.stop());
    } catch (e: any) {
      setDeviceTestSuccess(`Device test note: ${e.message || 'Permission denied or no webcam/mic found'}`);
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all mock interview sessions and resumes? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
            System & Privacy
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & Infrastructure
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your database synchronization, backend AI proxy configuration, and device permissions.
        </p>
      </div>

      {/* Backend & AI Provider Status */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>AI Engine & Backend Architecture</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          InterviewBro AI connects to a secure Express server proxying requests to Google Gemini API (gemini-2.5-flash / gemini-2.0-flash). If no API key is set in <code className="text-violet-300 bg-slate-950 px-1 py-0.5 rounded">.env.local</code> (via <code className="text-violet-300 bg-slate-950 px-1 py-0.5 rounded">GEMINI_API_KEY</code>), it transparently uses the built-in intelligent placement question bank and heuristic STAR evaluation.
        </p>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-200">Google Gemini API Key (Server-Side)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Configured via server/.env.local (never exposed to client)</div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Secure Backend Proxy
          </span>
        </div>
      </div>

      {/* Supabase Database Connection */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase PostgreSQL Integration</span>
          </h2>
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
            isSupabaseConnected 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            {isSupabaseConnected ? 'Connected & Synced' : 'Local Offline Mode'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {isSupabaseConnected ? (
            'Your sessions, profiles, and reports are safely persisting in your Supabase PostgreSQL database with Row Level Security (RLS).'
          ) : (
            'Currently running in local-first demo mode. Data is saved in your browser localStorage. To connect to Supabase, provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env.'
          )}
        </p>
      </div>

      {/* Hardware / Media Permissions Test */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>Webcam & Microphone Hardware Check</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Verify browser permissions before entering a live mock interview.
        </p>

        <button
          type="button"
          onClick={testMediaDevices}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-2 border border-slate-700"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Test Camera & Mic Access</span>
        </button>

        {deviceTestSuccess && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            {deviceTestSuccess}
          </div>
        )}
      </div>

      {/* Reset & Privacy */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-rose-500/20 space-y-4">
        <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Data Storage & Privacy Reset</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Clear all locally saved interview sessions, audio records, uploaded resumes, and cached scores from your current browser storage.
        </p>

        <button
          type="button"
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors"
        >
          Clear All Local Session Data
        </button>
      </div>
    </div>
  );
};
