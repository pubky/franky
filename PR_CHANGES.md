# PR Review Changes Summary

## 1. Added `reset()` Method to `PubkySpecsSingleton`

**File:** `src/core/pipes/pipes.builder.ts`

```typescript
static reset(): void {
  this.builder = null;
}
```

**Reason:** Provides explicit cleanup during logout and helps with testing.

---

## 2. Logout Integration

**File:** `src/core/application/auth/auth.ts`

`AuthApplication.logout()` now calls `PubkySpecsSingleton.reset()` after successful logout to ensure clean state for subsequent sign-ins.

---

## 3. Updated Tests

- **Auth tests:** Verify `reset()` is called on successful logout
- **Test utilities:** `restoreMocks()` calls `PubkySpecsSingleton.reset()` for clean test isolation

---

## 4. E2E Fix

**File:** `cypress/support/commands.ts`

Fixed `cy.type()` being called with empty string when `profileBio` is not provided:

```typescript
if (profileBio) {
  cy.get('#profile-bio-input').type(profileBio);
}
```
