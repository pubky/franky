/**
 * ESLint Code Style Enforcement Rules
 *
 * Enforces ADR-0013 code style rules:
 * - Types and interfaces must be in separate *.types.ts files
 * - Constants must be in separate *.constants.ts files
 * - Functions must have explicit return types
 *
 * See: docs/adr/0013-code-style-enforcement.md
 */

const codeStyleRules = [
  // ========================================================================
  // RULE 1: Types and interfaces must be in *.types.ts files
  // ========================================================================
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      // Allow types in .types.ts files (that's where they should be!)
      'src/**/*.types.ts',
      // Allow types in test files
      'src/**/*.test.{ts,tsx}',
      // Allow types in Storybook files
      'src/**/*.stories.{ts,tsx}',
      // Allow types in type-only utility files
      'src/types/**/*.ts',
      'src/libs/**/*.ts',
      // Allow types in core models (they ARE the types)
      'src/core/models/**/*.ts',
      // Allow types in pipes (transformation utilities)
      'src/core/pipes/**/*.ts',
    ],
    rules: {
      'no-restricted-syntax': [
        'warn', // Start as warning for gradual migration
        {
          selector: 'TSInterfaceDeclaration[declare!=true]',
          message:
            '🚫 Interfaces should be defined in a separate *.types.ts file. (ADR-0013)\n' +
            '   Example: Move this interface to ComponentName.types.ts\n' +
            '   See: docs/adr/0013-code-style-enforcement.md',
        },
        {
          selector: 'TSTypeAliasDeclaration',
          message:
            '🚫 Type aliases should be defined in a separate *.types.ts file. (ADR-0013)\n' +
            '   Example: Move this type to ComponentName.types.ts\n' +
            '   See: docs/adr/0013-code-style-enforcement.md',
        },
      ],
    },
  },

  // ========================================================================
  // RULE 2: Constants must be in *.constants.ts files
  // ========================================================================
  {
    files: ['src/components/**/*.{ts,tsx}'],
    ignores: [
      // Allow constants in .constants.ts files (that's where they should be!)
      'src/**/*.constants.ts',
      // Allow constants in test files
      'src/**/*.test.{ts,tsx}',
      // Allow constants in Storybook files
      'src/**/*.stories.{ts,tsx}',
      // Allow constants in index files (re-exports)
      'src/**/index.ts',
      // Allow constants in types files (type-level constants)
      'src/**/*.types.ts',
    ],
    rules: {
      'no-restricted-syntax': [
        'warn', // Start as warning for gradual migration
        {
          // Match: const UPPER_CASE = ... (exported module-level constants)
          selector:
            'Program > ExportNamedDeclaration > VariableDeclaration[kind="const"] > VariableDeclarator[id.name=/^[A-Z][A-Z0-9_]+$/]',
          message:
            '🚫 Exported UPPER_CASE constants should be in a separate *.constants.ts file. (ADR-0013)\n' +
            '   Example: Move this constant to ComponentName.constants.ts\n' +
            '   See: docs/adr/0013-code-style-enforcement.md',
        },
        {
          // Match: const UPPER_CASE = ... (non-exported module-level constants)
          selector: 'Program > VariableDeclaration[kind="const"] > VariableDeclarator[id.name=/^[A-Z][A-Z0-9_]+$/]',
          message:
            '🚫 Module-level UPPER_CASE constants should be in a separate *.constants.ts file. (ADR-0013)\n' +
            '   Example: Move this constant to ComponentName.constants.ts\n' +
            '   Exception: Single-use inline constants can stay if used only once.\n' +
            '   See: docs/adr/0013-code-style-enforcement.md',
        },
      ],
    },
  },

  // ========================================================================
  // RULE 3: Functions must have explicit return types
  // ========================================================================
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      // Allow implicit returns in test files
      'src/**/*.test.{ts,tsx}',
      // Allow implicit returns in Storybook files
      'src/**/*.stories.{ts,tsx}',
    ],
    rules: {
      // Require explicit return types on functions
      '@typescript-eslint/explicit-function-return-type': [
        'warn', // Start as warning for gradual migration
        {
          // Allow expressions (arrow functions in callbacks)
          allowExpressions: true,
          // Allow type inference for higher-order functions
          allowHigherOrderFunctions: true,
          // Allow type inference for direct exports
          allowDirectConstAssertionInArrowFunctions: true,
          // Allow concise arrow functions in callbacks
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          // Require return types on module boundaries
          allowedNames: [
            // React component functions (return type inferred from JSX)
            // These are handled by the Props interface pattern
          ],
        },
      ],
      // Require explicit return types on module boundaries
      '@typescript-eslint/explicit-module-boundary-types': [
        'warn', // Start as warning for gradual migration
        {
          allowArgumentsExplicitlyTypedAsAny: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
    },
  },

  // ========================================================================
  // RULE 4: Prefer destructured parameters (advisory - not strictly enforced)
  // ========================================================================
  // Note: ESLint doesn't have a built-in rule for this.
  // This is enforced via code review and convention.
  // Consider implementing a custom ESLint rule if strict enforcement is needed.

  // ========================================================================
  // EXCEPTIONS: Core layer has different patterns
  // ========================================================================
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      // Core layer can have more flexible return type inference
      // since it's internal implementation
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
    },
  },
];

export default codeStyleRules;
