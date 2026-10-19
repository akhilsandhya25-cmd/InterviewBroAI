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

  // Color profiles based on current state
  const stateConfig = useMemo(() => {
    switch (state) {
      case 'thinking':
        return {
          glow: 'from-cyan-500/20 to-indigo-500/20',
          ring: 'border-cyan-400 border-t-white',
          label: 'Analyzing Response...',
          badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          icon: BrainCircuit,
          accentColor: '#06B6D4'
        };
      case 'speaking':
        return {
          glow: 'from-[#C5F36B]/25 to-emerald-500/20',
          ring: 'border-[#C5F36B] border-t-white',
          label: 'Interviewer Speaking',
          badgeBg: 'bg-[#C5F36B]/15 text-[#C5F36B] border-[#C5F36B]/30 font-bold',
          icon: Volume2,
          accentColor: '#C5F36B'
        };
      case 'listening':
        return {
          glow: 'from-cyan-400/25 to-emerald-500/20',
          ring: 'border-cyan-400 border-t-emerald-300',
          label: 'Listening to You...',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold',
          icon: Mic,
          accentColor: '#10B981'
        };
      case 'idle':
      default:
        return {
          glow: 'from-white/[0.05] to-transparent',
          ring: 'border-white/[0.1] border-t-white/[0.3]',
          label: 'Interviewer Ready',
          badgeBg: 'bg-[#121826] text-[#9AA4B2] border-white/[0.08]',
          icon: UserCheck,
          accentColor: '#9AA4B2'
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
          className="relative rounded-full bg-[#121826] border border-white/[0.12] shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-200"
          style={{
            width: pixelDimensions.orb,
            height: pixelDimensions.orb,
          }}
        >
          {state === 'speaking' ? (
            /* Animated Audio Bars */
            <div className="flex items-center gap-1 z-10">
              <span className="w-1.5 bg-[#C5F36B] rounded-full animate-bounce [animation-delay:0ms] h-4" />
              <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:120ms] h-7" />
              <span className="w-1.5 bg-white rounded-full animate-bounce [animation-delay:60ms] h-9" />
              <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:180ms] h-7" />
              <span className="w-1.5 bg-[#C5F36B] rounded-full animate-bounce [animation-delay:90ms] h-4" />
            </div>
          ) : state === 'listening' ? (
            /* Receptive Mic Waves */
            <div className="flex flex-col items-center justify-center z-10">
              <Mic className="w-6 h-6 text-emerald-400 animate-pulse mb-1" />
              <div className="flex items-center gap-1">
                <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:0ms]" />
                <span className="w-1 h-3 bg-emerald-300 rounded-full animate-pulse [animation-delay:100ms]" />
                <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:200ms]" />
              </div>
            </div>
          ) : state === 'thinking' ? (
            /* Analyzing State */
            <div className="flex flex-col items-center justify-center z-10">
              <BrainCircuit className="w-7 h-7 text-cyan-300 animate-pulse" />
              <span className="text-[9px] font-mono tracking-wider text-cyan-400 mt-1 uppercase font-semibold">
                Thinking
              </span>
            </div>
          ) : (
            /* Idle Ready State */
            <div className="flex flex-col items-center justify-center z-10 text-[#9AA4B2]">
              <UserCheck className="w-7 h-7 text-[#9AA4B2] mb-1" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5F36B]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/[0.2]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/[0.2]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Badge and Role Tag */}
      <div className="mt-2.5 flex flex-col items-center text-center space-y-1">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors duration-150 ${stateConfig.badgeBg}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{stateConfig.label}</span>
        </div>

        <div className="text-[11px] text-[#9AA4B2] font-medium">
          {interviewerName} {company ? `• ${company}` : ''}
        </div>
      </div>
    </div>
  );
};
