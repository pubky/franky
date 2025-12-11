# ADR 0013: Code Style Enforcement

## Status

Accepted — 2024-12-11

## Context

As the codebase grows, inconsistent code organization creates friction:

1. **Type definitions scattered**: Some files define types inline, others use separate `.types.ts` files
2. **Constants mixed with logic**: Constants defined in component files make them harder to find and reuse
3. **Function signatures inconsistent**: Some functions use positional parameters, others use destructured objects

These inconsistencies lead to:

- **Reduced readability**: Developers must scan entire files to find type definitions
- **Poor discoverability**: Constants buried in implementation files are hard to find
- **Inconsistent refactoring**: Function parameter changes require different approaches
- **Code review friction**: Reviewers must check multiple patterns for the same concept

The project already has 145+ `.types.ts` files, indicating the pattern is established but not enforced.

## Decision

**Enforce three code style rules via ESLint:**

### Rule 1: Types and Interfaces in Separate Files

All type definitions and interfaces must be in a dedicated `*.types.ts` file.

**Pattern:** `ComponentName.types.ts` or `moduleName.types.ts`

```typescript
// ❌ WRONG: Types defined in component file
// src/components/organisms/PostMain/PostMain.tsx
export interface PostMainProps {
  postId: string;
  onClick?: () => void;
}

export function PostMain({ postId, onClick }: PostMainProps) {
  // ...
}
```

```typescript
// ✅ CORRECT: Types in separate file
// src/components/organisms/PostMain/PostMain.types.ts
export interface PostMainProps {
  postId: string;
  onClick?: () => void;
}

// src/components/organisms/PostMain/PostMain.tsx
import type { PostMainProps } from './PostMain.types';

export function PostMain({ postId, onClick }: PostMainProps) {
  // ...
}
```

**Exceptions:**

- Generic utility types in `@/types` or `@/libs`
- Type-only files (files that only export types)
- Test files (`.test.ts`, `.test.tsx`)
- Storybook files (`.stories.ts`, `.stories.tsx`)

### Rule 2: Constants in Separate Files

All constants must be in a dedicated `*.constants.ts` file.

**Pattern:** `ComponentName.constants.ts` or `moduleName.constants.ts`

```typescript
// ❌ WRONG: Constants in component file
// src/components/atoms/Button/Button.tsx
const BUTTON_VARIANTS = {
  primary: 'bg-blue-500',
  secondary: 'bg-gray-500',
} as const;

export function Button({ variant = 'primary' }) {
  return <button className={BUTTON_VARIANTS[variant]}>...</button>;
}
```

```typescript
// ✅ CORRECT: Constants in separate file
// src/components/atoms/Button/Button.constants.ts
export const BUTTON_VARIANTS = {
  primary: 'bg-blue-500',
  secondary: 'bg-gray-500',
} as const;

// src/components/atoms/Button/Button.tsx
import { BUTTON_VARIANTS } from './Button.constants';

export function Button({ variant = 'primary' }) {
  return <button className={BUTTON_VARIANTS[variant]}>...</button>;
}
```

**Exceptions:**

- Single-use inline constants (e.g., `const DELAY_MS = 300` used only once)
- Test files (`.test.ts`, `.test.tsx`)
- Storybook files (`.stories.ts`, `.stories.tsx`)
- Configuration files

### Rule 3: Typed Destructured Function Parameters

All functions must use typed destructured parameters with explicit return types.

```typescript
// ❌ WRONG: Positional parameters without types
function add(num1, num2) {
  return num1 + num2;
}

// ❌ WRONG: Positional parameters with inline types
function add(num1: number, num2: number): number {
  return num1 + num2;
}

// ❌ WRONG: Destructured but no return type
function add({ num1, num2 }: AddParams) {
  return num1 + num2;
}
```

```typescript
// ✅ CORRECT: Destructured parameters with interface and return type
interface AddParams {
  num1: number;
  num2: number;
}

function add({ num1, num2 }: AddParams): number {
  return num1 + num2;
}
```

**Benefits of destructured parameters:**

- **Self-documenting**: Parameter names visible at call site
- **Extensible**: Easy to add optional parameters without breaking callers
- **Refactoring-friendly**: Parameter order doesn't matter
- **IDE support**: Better autocomplete and parameter hints

**Exceptions:**

- Single-parameter functions (e.g., `(id: string) => ...`)
- Event handlers (e.g., `(event: MouseEvent) => ...`)
- Callbacks matching external library signatures
- Array methods (e.g., `.map((item) => ...)`)
- React component functions (use Props interface pattern)

### React Component Pattern

For React components, the destructured props pattern is already standard:

```typescript
// src/components/atoms/Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

// src/components/atoms/Button/Button.tsx
import type { ButtonProps } from './Button.types';

export function Button({ variant = 'primary', children, onClick }: ButtonProps): React.ReactElement {
  return (
    <button className={BUTTON_VARIANTS[variant]} onClick={onClick}>
      {children}
    </button>
  );
}
```

## Consequences

### Positive ✅

- **Consistent codebase**: All files follow the same organization pattern
- **Better discoverability**: Types and constants always in predictable locations
- **Improved IDE navigation**: Jump to type definition goes to dedicated file
- **Easier refactoring**: Types and constants isolated, easier to modify
- **Self-documenting functions**: Destructured parameters show intent
- **Reduced merge conflicts**: Types/constants changes isolated from logic changes

### Negative ❌

- **More files**: Each component may have 2-3 additional files
- **Migration effort**: Existing code must be refactored to comply
- **Learning curve**: New developers must learn the pattern
- **Overhead for simple components**: Even small components need separate files

### Neutral ⚠️

- **Import statements increase**: More imports per file (trade-off for organization)
- **File navigation**: Need to open multiple files to see full picture (IDE mitigates this)

## Alternatives Considered

### Alternative 1: Inline Types with Naming Convention

**Description**: Keep types inline but require naming convention (e.g., `Props` suffix).

**Pros**:

- Fewer files
- Types close to usage

**Cons**:

- Types hard to find in large files
- No enforcement mechanism
- Inconsistent with current 145+ `.types.ts` files

**Why not chosen**: Doesn't solve discoverability problem and conflicts with existing pattern.

### Alternative 2: Barrel File Exports Only

**Description**: Allow inline types but require re-export from `index.ts`.

**Pros**:

- Flexible file organization
- Single import point

**Cons**:

- Types still scattered in implementation files
- Barrel files become maintenance burden
- Circular dependency risk

**Why not chosen**: Adds complexity without solving organization problem.

### Alternative 3: Positional Parameters with JSDoc

**Description**: Allow positional parameters with JSDoc documentation.

```typescript
/**
 * @param num1 - First number
 * @param num2 - Second number
 * @returns Sum of numbers
 */
function add(num1: number, num2: number): number {
  return num1 + num2;
}
```

**Pros**:

- Works with any function signature
- Good documentation

**Cons**:

- Positional parameters are order-dependent
- Adding parameters breaks callers
- JSDoc duplicates type information

**Why not chosen**: Destructured parameters provide same documentation benefits with better refactoring support.

## Implementation Notes

### ESLint Rules

Create `eslint.config.code-style.mjs` with the following rules:

1. **`no-restricted-syntax`**: Detect type/interface definitions in non-`.types.ts` files
2. **`no-restricted-syntax`**: Detect const declarations in component files
3. **`@typescript-eslint/explicit-function-return-type`**: Require return types
4. **Custom rule or convention check**: Prefer destructured parameters (advisory)

### File Structure Convention

```
src/components/atoms/Button/
├── Button.tsx           # Component implementation
├── Button.types.ts      # Types and interfaces
├── Button.constants.ts  # Constants (if any)
├── Button.test.tsx      # Tests
├── Button.stories.tsx   # Storybook
└── index.ts             # Barrel export
```

### Migration Strategy

1. **Phase 1: Enable as warnings** - Add rules as ESLint warnings
2. **Phase 2: Fix new code** - All new code must comply
3. **Phase 3: Gradual migration** - Fix existing violations by module
4. **Phase 4: Enable as errors** - Enforce for entire codebase

### Index File Pattern

For components with separate files, use an index file for clean imports:

```typescript
// src/components/atoms/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
export { BUTTON_VARIANTS } from './Button.constants';
```

## Related Decisions

- Related: [ADR-0012: Component Layer ESLint Enforcement](./0012-component-layer-eslint-enforcement.md) (similar enforcement approach)
- Related: [ADR-0011: Component Composition via Children Props](./0011-component-composition-children-pattern.md) (component patterns)

## References

- [TypeScript Handbook: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [ESLint explicit-function-return-type](https://typescript-eslint.io/rules/explicit-function-return-type/)
- [Clean Code: Function Arguments](https://blog.cleancoder.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
