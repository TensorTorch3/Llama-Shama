import { useState, useEffect } from 'react';
import llamaService from '@/services/llamaService';

export function useBackendStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        const available = await llamaService.isBackendAvailable();
        if (mounted) {
          setIsOnline(available);
        }
      } catch (error) {
        if (mounted) {
          setIsOnline(false);
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    checkStatus();
    
    // Poll status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { isOnline, isChecking };
}
