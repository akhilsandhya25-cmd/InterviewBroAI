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
  Sparkles,
  Download,
  Lock,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';
import { tts } from '../services/speech';
import { storage } from '../services/storage';
import { BrandIcon } from '../components/brand/BrandIcon';

interface VoiceOption {
  voice_id: string;
  name: string;
  accent?: string;
  gender?: string;
  description?: string;
}

interface SettingsPageProps {
  onNavigate?: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
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
          fetch('/api/voice/status').then(async r => {
            if (!r.ok) return null;
            const text = await r.text();
            return text ? JSON.parse(text) : null;
          }).catch(() => null),
          fetch('/api/voice/voices').then(async r => {
            if (!r.ok) return null;
            const text = await r.text();
            return text ? JSON.parse(text) : null;
          }).catch(() => null)
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
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.06] text-slate-300 border border-white/[0.08]">
            System & Privacy
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
          Settings & Infrastructure
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
          Review your database synchronization, backend AI proxy configuration, and device permissions.
        </p>
      </div>

      {/* Backend & AI Provider Status */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#C5F36B]" />
          <span>AI Engine & Backend Architecture</span>
        </h2>
        <p className="text-xs text-[#9AA4B2] leading-relaxed">
          InterviewBro AI connects to a secure Express server proxying requests to Google Gemini API (gemini-2.5-flash / gemini-2.0-flash). If no API key is set in <code className="text-[#C5F36B] bg-[#080B11] px-1 py-0.5 rounded border border-white/[0.06]">.env.local</code> (via <code className="text-[#C5F36B] bg-[#080B11] px-1 py-0.5 rounded border border-white/[0.06]">GEMINI_API_KEY</code>), it transparently uses the built-in intelligent placement question bank and heuristic STAR evaluation.
        </p>

        <div className="p-3.5 rounded-xl bg-[#080B11] border border-white/[0.08] flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-[#F5F7FA]">Google Gemini API Key (Server-Side)</div>
            <div className="text-[11px] text-[#9AA4B2] mt-0.5">Configured via server/.env.local (never exposed to client)</div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/[0.06] text-emerald-400 border border-white/[0.08]">
            Secure Backend Proxy
          </span>
        </div>
      </div>

      {/* ElevenLabs Voice Engine & Natural Interviewer Persona */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-[#C5F36B]">
              <Volume2 className="w-5 h-5 text-[#C5F36B]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <span>Interviewer Voice Engine & Personas</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ElevenLabs & Web Speech
                </span>
              </h2>
              <p className="text-xs text-[#9AA4B2]">
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
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isVoiceTesting
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30'
                  : 'bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] shadow-lg shadow-[#C5F36B]/15'
              }`}
            >
              {isVoiceTesting ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isVoiceTesting ? 'Stop Speaking' : 'Test Interviewer Voice'}</span>
            </button>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-white/[0.08] space-y-3">
          <label className="block text-xs font-semibold text-[#F5F7FA]">
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
                      ? 'bg-white/[0.06] border-[#C5F36B] shadow-md ring-1 ring-[#C5F36B]/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F7FA]">{voice.name}</span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C5F36B]/20 text-[#C5F36B] border border-[#C5F36B]/30 font-semibold">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9AA4B2] mt-1 line-clamp-1">
                    {voice.description || `${voice.gender || ''} ${voice.accent || ''}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-[#9AA4B2]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${voiceStatus?.isConfigured ? 'bg-[#C5F36B] animate-pulse' : 'bg-emerald-400'}`} />
            <span>
              {voiceStatus?.isConfigured
                ? 'Server ELEVENLABS_API_KEY detected. Audio caching enabled.'
                : 'Using free built-in browser TTS voice. To enable ElevenLabs, add ELEVENLABS_API_KEY in server/.env.local.'}
            </span>
          </div>
        </div>
      </div>

      {/* Authentication & Cloud Sync Status */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authentication & Database Provider</span>
          </h2>
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border self-start sm:self-auto ${
            isSupabaseConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
          }`}>
            {isSupabaseConnected ? 'Cloud Synced (Supabase Auth)' : 'Local Cryptographic Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#080B11] border border-white/[0.08]">
            <span className="text-[#9AA4B2] block mb-0.5 font-medium">Active Provider:</span>
            <span className="text-[#F5F7FA] font-semibold">
              {isSupabaseConnected
                ? 'Supabase Auth (Cloud PostgreSQL with RLS)'
                : 'Local Secure Engine (PBKDF2-HMAC-SHA512 + Salt)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#080B11] border border-white/[0.08]">
            <span className="text-[#9AA4B2] block mb-0.5 font-medium">Data Isolation:</span>
            <span className="text-emerald-400 font-semibold">
              Strictly isolated per verified User ID
            </span>
          </div>
        </div>

        <p className="text-xs text-[#9AA4B2] leading-relaxed">
          {isSupabaseConnected ? (
            'Your sessions, profiles, and reports are safely persisting in your Supabase PostgreSQL database with Row Level Security (RLS).'
          ) : (
            'Currently running with the local cryptographic auth engine on your Express backend. User sessions and credentials safely persist across server restarts in .data/.'
          )}
        </p>

        {!isSupabaseConnected && (
          <div className="p-4 rounded-xl bg-[#080B11] border border-white/[0.08] space-y-2 text-xs">
            <div className="font-semibold text-[#F5F7FA]">How to Connect Free Supabase Cloud Auth (3 Steps):</div>
            <ol className="list-decimal list-inside space-y-1.5 text-[#9AA4B2]">
              <li>Create a free account at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#C5F36B] hover:underline">supabase.com</a> and start a new project.</li>
              <li>Open the <strong>SQL Editor</strong> in Supabase and run the provided <code className="text-[#C5F36B] bg-white/[0.06] px-1 py-0.5 rounded">supabase/schema.sql</code> script.</li>
              <li>Add your project URL & Anon key to <code className="text-[#C5F36B] bg-white/[0.06] px-1 py-0.5 rounded">client/.env.local</code> as <code className="text-slate-200">VITE_SUPABASE_URL</code> and <code className="text-slate-200">VITE_SUPABASE_ANON_KEY</code>.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Hardware / Media Permissions Test */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#C5F36B]" />
          <span>Webcam & Microphone Hardware Check</span>
        </h2>
        <p className="text-xs text-[#9AA4B2] leading-relaxed">
          Verify browser permissions before entering a live mock interview.
        </p>

        <button
          type="button"
          onClick={testMediaDevices}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white transition-colors flex items-center gap-2 border border-white/[0.08]"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Test Camera & Mic Access</span>
        </button>

        {deviceTestSuccess && (
          <div className="p-3 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-slate-300">
            {deviceTestSuccess}
          </div>
        )}
      </div>

      {/* Trust, Legal & Compliance */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trust, Governance & Statutory Compliance</span>
            </h2>
            <p className="text-xs text-[#9AA4B2] mt-0.5">
              Digital Personal Data Protection Act 2023 baseline, transparent AI scoring notices, and candidate rights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('legal:terms')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 transition-colors border border-white/[0.08] flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terms & Policies</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy-center')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C5F36B]/15 hover:bg-[#C5F36B]/25 text-[#C5F36B] border border-[#C5F36B]/30 transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C5F36B]" />
                  <span>Privacy Center</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('legal:ai-disclaimer')}
            className="p-3 rounded-xl bg-[#080B11] border border-white/[0.08] text-left hover:border-white/[0.16] transition-colors"
          >
            <div className="text-xs font-semibold text-[#F5F7FA]">AI Scoring Disclaimer</div>
            <div className="text-[11px] text-[#9AA4B2] mt-0.5">Placement readiness simulation without hiring guarantees</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('legal:voice-video')}
            className="p-3 rounded-xl bg-[#080B11] border border-white/[0.08] text-left hover:border-white/[0.16] transition-colors"
          >
            <div className="text-xs font-semibold text-[#F5F7FA]">Media & Biometrics Notice</div>
            <div className="text-[11px] text-[#9AA4B2] mt-0.5">Local browser video mirror; zero facial biometric scanning</div>
          </button>
        </div>
      </div>

      {/* Reset, Data Export & Account Deletion */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-rose-500/20 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Candidate Data Portability & Account Erasure</span>
        </h2>
        <p className="text-xs text-[#9AA4B2] leading-relaxed">
          Download a complete portable JSON archive of your interview questions, evaluation reports, and resume analyses, or exercise your statutory right to account erasure.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => storage.exportAllUserData(user?.id)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] flex items-center gap-2 transition-all shadow-lg shadow-[#C5F36B]/15"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data Archive (.JSON)</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('privacy-center')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Manage Erasure / Delete Account</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear Browser Cache Only
          </button>
        </div>
      </div>
    </div>
  );
};

