import React, { useMemo } from 'react';
import { Mic, Volume2, UserCheck, BrainCircuit } from 'lucide-react';

export type OrbState = 'idle' | 'thinking' | 'speaking' | 'listening';

interface VoiceInterviewerOrbProps {
  state: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interviewerName?: string;
  company?: string;
  audioLevel?: number; // 0.0 to 1.0
  className?: string;
}

export const VoiceInterviewerOrb: React.FC<VoiceInterviewerOrbProps> = ({
  state = 'idle',
  size = 'lg',
  interviewerName = 'Lead Technical Interviewer',
  company,
  audioLevel = 0,
  className = ''
}) => {
  const pixelDimensions = useMemo(() => {
    switch (size) {
      case 'sm': return { orb: 56, container: 72 };
      case 'md': return { orb: 80, container: 104 };
      case 'lg': return { orb: 110, container: 140 };
      case 'xl': return { orb: 140, container: 180 };
    }
  }, [size]);

  // Color profiles based on current state tailored for modern polished UI
  const stateConfig = useMemo(() => {
    switch (state) {
      case 'thinking':
        return {
          glow: 'from-blue-500/20 to-indigo-500/20',
          ring: 'border-blue-500 border-t-indigo-600',
          label: 'Analyzing Response...',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
          icon: BrainCircuit,
          accentColor: '#2563EB'
        };
      case 'speaking':
        return {
          glow: 'from-blue-600/25 to-indigo-600/25',
          ring: 'border-blue-600 border-t-indigo-500',
          label: 'Interviewer Speaking',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 font-bold shadow-sm shadow-blue-500/10',
          icon: Volume2,
          accentColor: '#2563EB'
        };
      case 'listening':
        return {
          glow: 'from-emerald-500/25 to-teal-500/20',
          ring: 'border-emerald-500 border-t-teal-400',
          label: 'Listening to You...',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
          icon: Mic,
          accentColor: '#059669'
        };
      case 'idle':
      default:
        return {
          glow: 'from-slate-200/50 to-transparent',
          ring: 'border-slate-300 border-t-slate-400',
          label: 'Interviewer Ready',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
          icon: UserCheck,
          accentColor: '#64748B'
        };
    }
  }, [state]);

  const StatusIcon = stateConfig.icon;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer Glow & Ripple Container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: pixelDimensions.container, height: pixelDimensions.container }}
      >
        {/* Subtle Ambient Glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${stateConfig.glow} blur-xl transition-all duration-300 pointer-events-none`}
          style={{
            transform: state === 'speaking'
              ? `scale(${1.08 + audioLevel * 0.15})`
              : state === 'listening'
              ? `scale(${1.04 + audioLevel * 0.1})`
              : 'scale(1)'
          }}
        />

        {/* Concentric Rotating / Pulsing Border */}
        <div
          className={`absolute rounded-full border-2 ${stateConfig.ring} transition-all duration-300 ${
            state === 'thinking' ? 'animate-spin' : state === 'speaking' ? 'animate-pulse' : ''
          }`}
          style={{ width: pixelDimensions.orb + 12, height: pixelDimensions.orb + 12 }}
        />

        {/* Core Orb Center */}
        <div
          className="relative rounded-full bg-white border border-slate-200/90 shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-200"
          style={{
            width: pixelDimensions.orb,
            height: pixelDimensions.orb,
          }}
        >
          {state === 'speaking' ? (
            /* Animated Audio Bars */
            <div className="flex items-center gap-1.5 z-10">
              <span className="w-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0ms] h-4" />
              <span className="w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:120ms] h-7" />
              <span className="w-1.5 bg-blue-700 rounded-full animate-bounce [animation-delay:60ms] h-9" />
              <span className="w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:180ms] h-7" />
              <span className="w-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:90ms] h-4" />
            </div>
          ) : state === 'listening' ? (
            /* Receptive Mic Waves */
            <div className="flex flex-col items-center justify-center z-10">
              <Mic className="w-6 h-6 text-emerald-600 animate-pulse mb-1" />
              <div className="flex items-center gap-1">
                <span className="w-1 h-1.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:0ms]" />
                <span className="w-1 h-3 bg-emerald-600 rounded-full animate-pulse [animation-delay:100ms]" />
                <span className="w-1 h-1.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:200ms]" />
              </div>
            </div>
          ) : state === 'thinking' ? (
            /* Analyzing State */
            <div className="flex flex-col items-center justify-center z-10">
              <BrainCircuit className="w-7 h-7 text-blue-600 animate-pulse" />
              <span className="text-[9px] font-mono tracking-wider text-blue-600 mt-1 uppercase font-bold">
                Thinking
              </span>
            </div>
          ) : (
            /* Idle Ready State */
            <div className="flex flex-col items-center justify-center z-10 text-slate-500">
              <UserCheck className="w-7 h-7 text-slate-600 mb-1" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Badge and Role Tag */}
      <div className="mt-2.5 flex flex-col items-center text-center space-y-1">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-colors duration-150 ${stateConfig.badgeBg}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{stateConfig.label}</span>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          {interviewerName} {company ? `• ${company}` : ''}
        </div>
      </div>
    </div>
  );
};
