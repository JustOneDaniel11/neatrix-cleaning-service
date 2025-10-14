import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

type Props = {
  errorMessage?: string | null;
};

// Lightweight banner to surface configuration issues without blocking UI.
const ServiceStatusBanner: React.FC<Props> = ({ errorMessage }) => {
  const showConfigWarning = !isSupabaseConfigured;
  const showError = Boolean(errorMessage);

  if (!showConfigWarning && !showError) return null;

  const message = showConfigWarning
    ? 'Service Unavailable: Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    : `Service Unavailable: ${errorMessage}`;

  return (
    <div className="w-full bg-yellow-100 border border-yellow-300 text-yellow-900 px-4 py-2 flex items-center gap-2">
      <AlertTriangle className="w-4 h-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default ServiceStatusBanner;