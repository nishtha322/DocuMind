// src/hooks/useHealthStatus.js

import { useEffect, useState } from 'react';
import { checkHealth } from '../api/health';

export function useHealthStatus() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  useEffect(() => {
    let cancelled = false;

    checkHealth()
      .then(() => {
        if (!cancelled) setStatus('online');
      })
      .catch(() => {
        if (!cancelled) setStatus('offline');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
