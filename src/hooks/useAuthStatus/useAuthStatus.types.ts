export enum AuthStatus {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATED = 'AUTHENTICATED',
  NEEDS_PROFILE_CREATION = 'NEEDS_PROFILE_CREATION',
}

export interface AuthStatusResult {
  status: AuthStatus;
  isLoading: boolean;
  hasKeypair: boolean;
  hasProfile: boolean;
  isFullyAuthenticated: boolean;
}

export interface RouteAccess {
  allowedRoutes: string[];
  redirectTo?: string;
}

export type RouteAccessMap = Record<AuthStatus, RouteAccess>;
