import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Modern pulse loader with gradient */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse`}>
          <div className="absolute inset-2 rounded-full bg-white/20 animate-ping"></div>
          <div className="absolute inset-4 rounded-full bg-white/40 animate-pulse delay-75"></div>
        </div>
        
        {/* Spinning ring around the loader */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 animate-spin`}></div>
      </div>
      
      {/* Loading text with typing animation */}
      <div className="text-center">
        <p className="text-gray-600 font-medium animate-pulse">
          {text}
        </p>
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export const FullScreenLoader: React.FC<{ text?: string }> = ({ text = 'Loading your dashboard...' }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <Loader size="lg" text={text} className="py-4" />
      </div>
    </div>
  );
};

export default Loader;