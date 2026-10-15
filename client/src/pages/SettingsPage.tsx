import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Volume2,
  Play,
  Square,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';
import { tts } from '../services/speech';
import { BrandIcon } from '../components/brand/BrandIcon';

interface VoiceOption {
  voice_id: string;
  name: string;
  accent?: string;
  gender?: string;
  description?: string;
}

export const SettingsPage: React.FC = () => {
  const { user, quota, isSupabaseConnected } = useAuth();
  const [deviceTestSuccess, setDeviceTestSuccess] = useState<string | null>(null);

  // Voice Engine States
  const [voiceList, setVoiceList] = useState<VoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => tts.getElevenLabsVoice());
  const [isVoiceTesting, setIsVoiceTesting] = useState<boolean>(false);
  const [voiceStatus, setVoiceStatus] = useState<{ isConfigured: boolean; message: string; provider: string } | null>(null);
  const [preferElevenLabs, setPreferElevenLabs] = useState<boolean>(() => tts.getUseElevenLabs());

  useEffect(() => {
    // Fetch voice backend status and voices
    const loadVoiceData = async () => {
      try {
        const [statusRes, voicesRes] = await Promise.all([
          fetch('/api/voice/status').then(r => r.json()).catch(() => null),
          fetch('/api/voice/voices').then(r => r.json()).catch(() => null)
        ]);

        if (statusRes) {
          setVoiceStatus(statusRes);
        }
        if (voicesRes && voicesRes.voices) {
          setVoiceList(voicesRes.voices);
        }
      } catch (e) {
        console.warn('Could not load voice metadata:', e);
      }
    };
    loadVoiceData();
  }, []);

  const handleSelectVoice = (id: string) => {
    setSelectedVoiceId(id);
    tts.setElevenLabsVoice(id);
  };

  const handleToggleElevenLabs = (enabled: boolean) => {
    setPreferElevenLabs(enabled);
    tts.setUseElevenLabs(enabled);
  };

  const testInterviewerSpeech = async () => {
    if (isVoiceTesting) {
      tts.stop();
      setIsVoiceTesting(false);
      return;
    }

    setIsVoiceTesting(true);
    const testPhrase = "Hello! I am your InterviewBro AI interviewer. Let's begin your technical practice session today.";
    
    tts.speak(testPhrase, {
      onStart: () => setIsVoiceTesting(true),
      onEnd: () => setIsVoiceTesting(false),
      onError: () => setIsVoiceTesting(false)
    });
  };

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

      {/* ElevenLabs Voice Engine & Natural Interviewer Persona */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-violet-500/30 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300">
              <Volume2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Interviewer Voice Engine & Personas</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ElevenLabs & Web Speech
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {voiceStatus?.isConfigured 
                  ? 'ElevenLabs high-fidelity neural streaming audio active' 
                  : 'Web Speech API automatic fallback (Free operating system & browser speech)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={testInterviewerSpeech}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                isVoiceTesting 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30' 
                  : 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-violet-600/20'
              }`}
            >
              {isVoiceTesting ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isVoiceTesting ? 'Stop Speaking' : 'Test Interviewer Voice'}</span>
            </button>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Selected Interviewer Persona:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {voiceList.map((voice) => {
              const isSelected = selectedVoiceId === voice.voice_id;
              return (
                <div
                  key={voice.voice_id}
                  onClick={() => handleSelectVoice(voice.voice_id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-violet-950/40 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{voice.name}</span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {voice.description || `${voice.gender || ''} ${voice.accent || ''}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${voiceStatus?.isConfigured ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span>
              {voiceStatus?.isConfigured 
                ? 'Server ELEVENLABS_API_KEY detected. Audio caching enabled.' 
                : 'Using free built-in browser TTS voice. To enable ElevenLabs, add ELEVENLABS_API_KEY in server/.env.local.'}
            </span>
          </div>
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
