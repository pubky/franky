# ADR 0012: Component Layer ESLint Enforcement

## Status

Accepted — 2024-12-11

## Context

ADR-0011 established strict component composition rules to maintain atomic design hierarchy:

- **Atoms** cannot import from the component library
- **Molecules** cannot import from `@/organisms` or `@/templates`
- **Organisms** cannot import from `@/templates`
- **Templates** cannot import other page templates (only layout templates)

However, relying solely on code reviews to enforce these rules **does not scale**:

1. **Human error**: Reviewers may miss violations during code review
2. **Inconsistent enforcement**: Different reviewers apply rules differently
3. **Slow feedback**: Violations discovered in PR review, not during development
4. **Knowledge burden**: New developers must memorize all layer rules
5. **No backward compatibility**: Existing violations block new rule adoption

**The problem:** Without automated enforcement, architectural rules are documentation, not constraints.

## Decision

**Enforce component layer rules via ESLint at build time.** Use `eslint-plugin-import`'s `no-restricted-imports` rule to prevent cross-layer violations.

### ESLint Rule Configuration

Create `.eslintrc.component-layers.js` with layer-specific import restrictions:

```javascript
module.exports = {
  overrides: [
    // Atoms: Cannot import any internal components
    {
      files: ['src/components/atoms/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/components/**', '@/atoms/**', '@/molecules/**', '@/organisms/**', '@/templates/**'],
                message: 'Atoms cannot import other components. Only external libraries allowed. (ADR-0011)',
              },
              {
                group: ['@/hooks/**'],
                message: 'Atoms cannot import internal hooks. Use external hooks only. (ADR-0011)',
              },
              {
                group: ['@/core/**'],
                message: 'Atoms cannot import from core layer. Keep atoms isolated. (ADR-0011)',
              },
            ],
          },
        ],
      },
    },

    // Molecules: Can import atoms and molecules only
    {
      files: ['src/components/molecules/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/organisms/**', '../organisms/**', '../../organisms/**'],
                message: 'Molecules cannot import organisms. Pass organisms via children props. (ADR-0011)',
              },
              {
                group: ['@/templates/**', '../templates/**', '../../templates/**'],
                message: 'Molecules cannot import templates. (ADR-0011)',
              },
            ],
          },
        ],
      },
    },

    // Organisms: Can import atoms, molecules, and other organisms
    {
      files: ['src/components/organisms/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/templates/**', '../templates/**', '../../templates/**'],
                message: 'Organisms cannot import templates. (ADR-0011)',
              },
            ],
          },
        ],
      },
    },

    // Templates: Can import atoms, molecules, organisms, and layout templates
    {
      files: ['src/components/templates/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/templates/pages/**', '../pages/**', '../../templates/pages/**'],
                message: 'Templates cannot import page templates. Only layout templates allowed. (ADR-0011)',
              },
            ],
          },
        ],
      },
    },
  ],
};
```

### Integration with Main ESLint Config

Update `.eslintrc.js` to include the component layer rules:

```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    './.eslintrc.component-layers.js', // Add component layer rules
  ],
  // ... rest of config
};
```

### Enforcement Strategy

**Build-time enforcement:**

- ESLint runs during `npm run lint`
- CI/CD fails if violations detected
- Pre-commit hooks (optional) catch violations before commit

**Migration strategy for existing violations:**

- Use ESLint `overrides` with `ignorePatterns` to allow existing violations
- Create migration tickets for each legacy violation
- Remove ignorePatterns as violations are fixed

### Example: Gradual Migration

```javascript
// .eslintrc.component-layers.js
module.exports = {
  overrides: [
    {
      files: ['src/components/molecules/**/*.{ts,tsx}'],
      excludedFiles: [
        // Temporary exceptions during migration (TODO: Remove after fixing)
        'src/components/molecules/DialogFeedbackContent.tsx', // TODO: ADR-0011 migration
        'src/components/molecules/LegacyModal.tsx', // TODO: ADR-0011 migration
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/organisms/**'],
                message: 'Molecules cannot import organisms. Pass organisms via children props. (ADR-0011)',
              },
            ],
          },
        ],
      },
    },
  ],
};
```

### Violation Example

```typescript
// src/components/molecules/DialogContent.tsx
import { PostHeader } from '@/organisms/PostHeader'; // ❌ ESLint error

// ERROR: Molecules cannot import organisms. Pass organisms via children props. (ADR-0011)
```

**Fix:**

```typescript
// src/components/molecules/DialogContent.tsx
interface DialogContentProps {
  children: React.ReactNode; // ✅ Accept organism via children
}

export function DialogContent({ children }: DialogContentProps) {
  return <div>{children}</div>;
}

// src/components/organisms/Dialog.tsx
import { DialogContent } from '@/molecules/DialogContent';
import { PostHeader } from '@/organisms/PostHeader';

export function Dialog() {
  return (
    <DialogContent>
      <PostHeader /> {/* ✅ Organism passed as children */}
    </DialogContent>
  );
}
```

## Consequences

### Positive ✅

- **Prevents violations at build time**: Impossible to merge code that violates layer rules
- **Fast feedback**: Developers see errors immediately in IDE (with ESLint extension)
- **Consistent enforcement**: Rules applied uniformly across all developers
- **Self-documenting**: Error messages explain the rule and reference ADR-0011
- **Gradual migration**: Existing violations can be temporarily excluded during migration
- **Reduced review burden**: Reviewers don't need to manually check layer violations

### Negative ❌

- **Migration overhead**: Existing violations must be cataloged and tracked
- **Build failures**: CI/CD may fail initially if violations exist
- **Configuration complexity**: ESLint overrides can become verbose with many exceptions

### Neutral ⚠️

- **Requires ESLint plugin**: Project must include `eslint-plugin-import` (already standard)
- **IDE integration**: Developers need ESLint IDE extension for real-time feedback (recommended practice)
- **Exception management**: Temporary exceptions must be tracked and removed (adds maintenance task)

## Alternatives Considered

### Alternative 1: TypeScript Path Mapping Restrictions

**Description**: Use TypeScript's `paths` and `baseUrl` to prevent cross-layer imports at compile time.

**Example:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/atoms/*": ["src/components/atoms/*"],
      "@/molecules/*": ["src/components/molecules/*"]
      // Molecules cannot reference organisms path
    }
  }
}
```

**Pros**:

- Type-level enforcement
- No additional tooling required
- Compile-time errors

**Cons**:

- **Cannot enforce directory-specific rules**: TypeScript paths are global
- **Cannot provide custom error messages**: Generic "module not found" errors
- **Cannot support gradual migration**: All-or-nothing enforcement
- **Limited pattern matching**: Cannot distinguish layout templates from page templates

**Why not chosen**: TypeScript paths are too coarse-grained. ESLint provides file-level overrides and custom error messages.

### Alternative 2: Custom ESLint Plugin

**Description**: Create a custom ESLint plugin specifically for component layer rules.

**Example:**

```javascript
// eslint-plugin-component-layers
module.exports = {
  rules: {
    'enforce-layer-boundaries': {
      create(context) {
        // Custom logic to detect violations
      },
    },
  },
};
```

**Pros**:

- Full control over rule logic
- Can implement complex heuristics
- Can provide IDE quick-fixes

**Cons**:

- **High implementation cost**: Custom plugin requires significant development effort
- **Maintenance burden**: Must maintain plugin alongside project
- **Testing overhead**: Plugin needs its own test suite
- **Overkill**: `no-restricted-imports` already solves 95% of use cases

**Why not chosen**: `no-restricted-imports` provides sufficient enforcement with zero custom code. Custom plugin is premature optimization.

### Alternative 3: Dependency Cruiser

**Description**: Use `dependency-cruiser` to enforce architectural rules via dependency graphs.

**Example:**

```javascript
// .dependency-cruiser.js
module.exports = {
  forbidden: [
    {
      from: { path: '^src/components/molecules' },
      to: { path: '^src/components/organisms' },
      comment: 'Molecules cannot import organisms (ADR-0011)',
    },
  ],
};
```

**Pros**:

- Powerful dependency graph analysis
- Visual dependency graphs
- Supports complex architectural rules

**Cons**:

- **Additional tooling**: Requires new dependency and configuration
- **Learning curve**: Team must learn dependency-cruiser syntax
- **CI integration**: Separate CI step required
- **No IDE integration**: Errors only shown during explicit lint runs

**Why not chosen**: ESLint is already integrated into IDE, CI/CD, and developer workflow. Dependency Cruiser adds complexity without significant benefit.

## Implementation Notes

### Step 1: Create ESLint Configuration

Create `.eslintrc.component-layers.js` with the rules defined above.

### Step 2: Audit Existing Violations

Run ESLint to identify all existing violations:

```bash
npm run lint 2>&1 | grep "ADR-0011" > violations.txt
```

Create migration tickets for each violation:

```markdown
## Molecule Violations (24 files)

- [ ] src/components/molecules/DialogFeedbackContent.tsx
- [ ] src/components/molecules/PostModal.tsx
- ...

## Priority: High (8 files)

- Critical path components
```

### Step 3: Add Temporary Exceptions

Update `.eslintrc.component-layers.js` with `excludedFiles` for existing violations:

```javascript
excludedFiles: [
  'src/components/molecules/DialogFeedbackContent.tsx', // Ticket #123
  'src/components/molecules/PostModal.tsx', // Ticket #124
  // ...
],
```

### Step 4: Enable in CI/CD

Ensure `npm run lint` runs in CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Lint
  run: npm run lint
```

### Step 5: Enable Pre-commit Hook (Optional)

Add Husky pre-commit hook to catch violations early:

```bash
npx husky add .husky/pre-commit "npm run lint"
```

### Step 6: Migrate Legacy Violations

Follow ADR-0011 migration steps for each excluded file. Remove from `excludedFiles` after fixing.

### Monitoring

Track migration progress:

```bash
# Count remaining exceptions
grep -c "excludedFiles" .eslintrc.component-layers.js
```

**Goal**: Zero exceptions by end of Q1 2025.

## Related Decisions

- Enforces: [ADR-0011: Component Composition via Children Props](./0011-component-composition-children-pattern.md)
- Related: [ADR-0004: Layering and Dependency Rules](./0004-layering-and-dependency-rules.md) (core layer enforcement)

## References

- [ESLint no-restricted-imports](https://eslint.org/docs/latest/rules/no-restricted-imports)
- [eslint-plugin-import](https://github.com/import-js/eslint-plugin-import)
- [Atomic Design Pattern](https://bradfrost.com/blog/post/atomic-web-design/)
- [Dependency Cruiser](https://github.com/sverweij/dependency-cruiser) (alternative considered)
