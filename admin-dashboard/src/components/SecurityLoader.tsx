import React from 'react';
import { Shield, Lock, Key, Eye, Fingerprint } from 'lucide-react';

interface SecurityLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SecurityLoader({ 
  message = "Securing Dashboard", 
  size = 'md' 
}: SecurityLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const containerSizeClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Main loader container */}
      <div className={`relative flex flex-col items-center ${containerSizeClasses[size]}`}>
        {/* Security icons with neon glow animation */}
        <div className="relative">
          {/* Central shield with pulsing glow */}
          <div className="relative">
            <Shield 
              className={`${sizeClasses[size]} text-cyan-400 security-shield-glow animate-pulse`}
            />
            
            {/* Rotating security icons around the shield */}
            <div className="absolute inset-0 security-icons-rotate">
              {/* Lock icon */}
              <Lock 
                className="absolute w-4 h-4 text-emerald-400 -top-2 left-1/2 transform -translate-x-1/2 security-icon-glow-green"
              />
              
              {/* Key icon */}
              <Key 
                className="absolute w-4 h-4 text-yellow-400 top-1/2 -right-2 transform -translate-y-1/2 rotate-45 security-icon-glow-yellow"
              />
              
              {/* Eye icon */}
              <Eye 
                className="absolute w-4 h-4 text-purple-400 -bottom-2 left-1/2 transform -translate-x-1/2 security-icon-glow-purple"
              />
              
              {/* Fingerprint icon */}
              <Fingerprint 
                className="absolute w-4 h-4 text-pink-400 top-1/2 -left-2 transform -translate-y-1/2 security-icon-glow-pink"
              />
            </div>
          </div>

          {/* Scanning line effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 security-scan-line" />
          </div>

          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/30 security-glow-ring" />
        </div>

        {/* Loading message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2 tracking-wide">
            {message}
          </h3>
          <p className="text-sm text-slate-400 animate-pulse">
            Please wait while we verify your credentials...
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 bg-cyan-400 rounded-full security-dot security-dot-${i}`}
            />
          ))}
        </div>
      </div>


    </div>
  );
}