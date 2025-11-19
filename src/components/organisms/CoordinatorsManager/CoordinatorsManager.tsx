'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import * as Core from '@/core';

/**
 * CoordinatorsManager
 *
 * Centralized component that initializes and manages the coordinators layer lifecycle.
 * This component has no UI - it only manages coordinator lifecycles.
 *
 * Responsibilities:
 * - Initialize coordinators on mount
 * - Start coordination when the component is mounted
 * - Track route changes and inform coordinators
 * - Stop coordination and cleanup when unmounted
 *
 * Architecture:
 * This component bridges React lifecycle with the coordinators layer:
 *
 * i.e. CoordinatorsManager (UI) → Coordinators → Controllers → Application → Services
 */
export function CoordinatorsManager() {
  const pathname = usePathname();

  // Start notification coordinator on mount, stop on unmount
  useEffect(() => {
    const notificationCoordinator = Core.NotificationCoordinator.getInstance();

    // Start the notification coordinator
    notificationCoordinator.start();

    // Cleanup: stop coordinator when component unmounts
    return () => {
      notificationCoordinator.stop();
    };
  }, []);

  // Update notification coordinator with current route for route-based activation/deactivation
  useEffect(() => {
    const notificationCoordinator = Core.NotificationCoordinator.getInstance();
    notificationCoordinator.setRoute(pathname);
  }, [pathname]);

  // This component has no UI - it only manages coordinator lifecycles
  return null;
}
