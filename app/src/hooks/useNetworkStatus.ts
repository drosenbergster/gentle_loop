/**
 * Network Status Hook
 *
 * Tracks online/offline state using @react-native-community/netinfo.
 * ARCH-13: Network status detection.
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  /** Whether the device has internet connectivity */
  isOnline: boolean;
  /** Whether the network status has been determined (false during initial check) */
  isReady: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true); // Optimistic default
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? true);
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, isReady };
}
