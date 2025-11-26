/**
 * Converts a route path to a regex pattern that matches routes starting with that path.
 * Escapes special regex characters and anchors to the start of the string.
 */
export function routeToRegex(route: string): RegExp {
    // Escape special regex characters and anchor to start
    const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped}`);
  }