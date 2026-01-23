# Refactor: Unified TTL Viewport Subscription Architecture

## Overview

Eliminates code duplication by extracting a shared `useViewportObserver` hook and consolidating TTL subscription logic into a single `useTtlSubscription` hook with discriminated union types.

## Technical Improvements

### 1. Single IntersectionObserver Implementation

**Before:** Two separate hooks each implemented their own IntersectionObserver setup with identical logic:

- Element tracking via `useState`
- Callback ref pattern for DOM attachment
- Observer configuration (rootMargin, threshold)
- Cleanup on unmount

**After:** `useViewportObserver` encapsulates all IntersectionObserver concerns. Pure viewport detection with no business logic, making it reusable for lazy loading, scroll analytics, or animation triggers.

### 2. Simplified Effect Lifecycle

**Before:** Each hook used two `useEffect` hooks:

- First effect: Observer setup + visibility-based subscribe/unsubscribe
- Second effect: Handle ID changes while element remains visible

**After:** Single `useEffect` handles all subscription logic. The ID is included in the dependency array, so React's effect system naturally handles ID changes without a dedicated effect.

### 3. Type-Safe Discriminated Union API

```typescript
type UseTtlSubscriptionOptions =
  | { type: 'post'; id: string; subscribeAuthor?: boolean }
  | { type: 'user'; id: string };
```

TypeScript enforces that `subscribeAuthor` is only available for post subscriptions. Attempting to use it with `type: 'user'` produces a compile-time error.

### 4. Centralized Subscription Management

Single ref tracks all subscription state:

```typescript
const subscriptionRef = useRef<{
  postId: string | null;
  authorPubky: string | null;
  userPubky: string | null;
}>({ postId: null, authorPubky: null, userPubky: null });
```

Cleanup logic handles all entity types in one place, preventing subscription leaks when switching between post/user types or on unmount.

### 5. Added `enabled` Flag

New capability to conditionally disable observation without unmounting:

```typescript
const { ref } = useTtlSubscription({
  type: 'user',
  id: userId,
  enabled: isAuthenticated, // Only track when authenticated
});
```

When `enabled` becomes `false`, visibility resets and subscriptions are cleaned up.

## Behavioral Difference

| Aspect              | Before                           | After                    |
| ------------------- | -------------------------------- | ------------------------ |
| Subscribe timing    | Synchronous in observer callback | After React state update |
| Effect count        | 2 per hook                       | 1 total                  |
| Observer instances  | 1 per hook usage                 | 1 per hook usage         |

The subscription timing change introduces ~1 render cycle delay (typically <16ms). This is negligible for TTL tracking where staleness is measured in minutes.

## Extensibility

Adding a new entity type requires:

1. Extend the discriminated union type
2. Add subscription logic branch in the effect
3. Add cleanup logic

No changes needed to viewport observation, ref handling, or component integration patterns.
