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
 * - Initialize coordinators on mount (NotificationCoordinator, StreamCoordinator)
 * - Start coordination when the component is mounted
 * - Track route changes and inform coordinators
 * - Stop coordination and cleanup when unmounted
 *
 * Architecture:
 * This component bridges React lifecycle with the coordinators layer:
 *
 * i.e. CoordinatorsManager (UI) → Coordinators → Controllers → Application → Services
 */
export function CoordinatorsManager(): null {
  const pathname = usePathname();

  // Start coordinators on mount, stop on unmount
  useEffect(() => {
    const notificationCoordinator = Core.NotificationCoordinator.getInstance();
    const streamCoordinator = Core.StreamCoordinator.getInstance();

    // Start the coordinators
    notificationCoordinator.start();
    streamCoordinator.start();

    // Cleanup: stop coordinators when component unmounts
    return () => {
      notificationCoordinator.stop();
      streamCoordinator.stop();
    };
  }, []);

  // Update coordinators with current route for route-based activation/deactivation
  useEffect(() => {
    const notificationCoordinator = Core.NotificationCoordinator.getInstance();
    const streamCoordinator = Core.StreamCoordinator.getInstance();

    notificationCoordinator.setRoute(pathname);
    streamCoordinator.setRoute(pathname);
  }, [pathname]);

  // This component has no UI - it only manages coordinator lifecycles
  return null;
}
