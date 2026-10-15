import React, { useMemo } from 'react';
import { Sparkles, Mic, Volume2, Bot, BrainCircuit } from 'lucide-react';

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
  interviewerName = 'InterviewBro AI Interviewer',
  company,
  audioLevel = 0,
  className = ''
}) => {
  const pixelDimensions = useMemo(() => {
    switch (size) {
      case 'sm': return { orb: 64, container: 80 };
      case 'md': return { orb: 96, container: 120 };
      case 'lg': return { orb: 130, container: 160 };
      case 'xl': return { orb: 180, container: 220 };
    }
  }, [size]);

  // Color profiles based on current state
  const stateConfig = useMemo(() => {
    switch (state) {
      case 'thinking':
        return {
          glow: 'from-cyan-500/30 via-violet-600/40 to-blue-500/20',
          ring: 'border-cyan-400 border-t-violet-400',
          label: 'AI Thinking & Analyzing',
          badgeBg: 'bg-violet-500/20 text-cyan-300 border-cyan-500/40',
          icon: BrainCircuit,
          textColor: 'text-cyan-300'
        };
      case 'speaking':
        return {
          glow: 'from-violet-500/40 via-fuchsia-500/30 to-cyan-400/30',
          ring: 'border-violet-400 border-t-fuchsia-400',
          label: 'Interviewer Speaking',
          badgeBg: 'bg-violet-600/25 text-violet-200 border-violet-400/50',
          icon: Volume2,
          textColor: 'text-violet-300'
        };
      case 'listening':
        return {
          glow: 'from-cyan-400/40 via-emerald-500/30 to-teal-400/20',
          ring: 'border-cyan-400 border-t-emerald-300',
          label: 'Listening to Your Answer',
          badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
          icon: Mic,
          textColor: 'text-cyan-300'
        };
      case 'idle':
      default:
        return {
          glow: 'from-violet-600/20 via-slate-700/20 to-cyan-500/10',
          ring: 'border-slate-700 border-t-violet-500/60',
          label: 'Interviewer Ready',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Bot,
          textColor: 'text-slate-400'
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
        {/* State-specific expanding ripple waves */}
        {state === 'speaking' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping pointer-events-none" />
            <div className="absolute -inset-4 rounded-full border border-cyan-400/20 animate-pulse pointer-events-none" />
          </>
        )}

        {state === 'listening' && (
          <>
            <div className="absolute inset-1 rounded-full border border-cyan-400/40 animate-pulse pointer-events-none" />
            <div className="absolute -inset-2 rounded-full border border-teal-500/20 animate-ping pointer-events-none duration-1000" />
          </>
        )}

        {state === 'thinking' && (
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-violet-400/40 animate-spin duration-3000 pointer-events-none" />
        )}

        {/* Dynamic Glow Aura */}
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${stateConfig.glow} blur-xl transition-all duration-500`}
          style={{
            transform: state === 'speaking' 
              ? `scale(${1.1 + audioLevel * 0.2})` 
              : state === 'listening' 
              ? `scale(${1.05 + audioLevel * 0.15})` 
              : 'scale(1)'
          }}
        />

        {/* Spinning / Breathing Concentric Ring */}
        <div 
          className={`absolute rounded-full border-2 ${stateConfig.ring} transition-all duration-300 ${
            state === 'thinking' ? 'animate-spin' : state === 'speaking' ? 'animate-pulse' : ''
          }`}
          style={{ width: pixelDimensions.orb + 12, height: pixelDimensions.orb + 12 }}
        />

        {/* Core Orb Center */}
        <div 
          className="relative rounded-full bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#0A0D14] border border-slate-700/80 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-300"
          style={{ 
            width: pixelDimensions.orb, 
            height: pixelDimensions.orb,
            boxShadow: state === 'speaking' 
              ? '0 0 25px rgba(139, 92, 246, 0.45)' 
              : state === 'listening'
              ? '0 0 25px rgba(6, 182, 212, 0.4)'
              : '0 0 15px rgba(15, 23, 42, 0.8)'
          }}
        >
          {/* Animated Core Ambient Light Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />

          {/* Core Graphical Animation Depending on State */}
          {state === 'speaking' ? (
            /* Animated Audio Bars */
            <div className="flex items-center gap-1 z-10">
              <span className="w-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms] h-5" />
              <span className="w-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms] h-8" />
              <span className="w-1.5 bg-white rounded-full animate-bounce [animation-delay:75ms] h-10" />
              <span className="w-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:200ms] h-8" />
              <span className="w-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:100ms] h-5" />
            </div>
          ) : state === 'listening' ? (
            /* Listening Receptive Waveform */
            <div className="flex flex-col items-center justify-center z-10">
              <Mic className="w-7 h-7 text-cyan-300 animate-pulse mb-1" />
              <div className="flex items-center gap-1">
                <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0ms]" />
                <span className="w-1 h-3.5 bg-cyan-300 rounded-full animate-pulse [animation-delay:100ms]" />
                <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:200ms]" />
              </div>
            </div>
          ) : state === 'thinking' ? (
            /* Processing Shimmer */
            <div className="flex flex-col items-center justify-center z-10">
              <BrainCircuit className="w-8 h-8 text-cyan-300 animate-pulse" />
              <span className="text-[9px] font-mono tracking-wider text-violet-300 mt-1 uppercase">
                Synthesizing
              </span>
            </div>
          ) : (
            /* Idle Breathing Mode */
            <div className="flex flex-col items-center justify-center z-10 text-slate-400">
              <Bot className="w-8 h-8 text-violet-400/80 mb-1" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Badge and Role Tag */}
      <div className="mt-3 flex flex-col items-center text-center space-y-1">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-sm transition-colors duration-200 ${stateConfig.badgeBg}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{stateConfig.label}</span>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          {interviewerName} {company ? `• ${company}` : ''}
        </div>
      </div>
    </div>
  );
};
