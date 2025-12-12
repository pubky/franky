/**
 * ESLint Component Layer Enforcement Rules
 *
 * Enforces ADR-0011 component composition rules:
 * - Atoms: Cannot import internal components, hooks, or core layer
 * - Molecules: Can import atoms and molecules only (not organisms or templates)
 * - Organisms: Can import atoms, molecules, and organisms (not templates)
 * - Templates: Can import atoms, molecules, organisms (not other templates)
 *
 * See: docs/adr/0011-component-composition-children-pattern.md
 * See: docs/adr/0012-component-layer-eslint-enforcement.md
 */

const componentLayerRules = [
  // ========================================================================
  // ATOMS: Cannot import any internal components
  // ========================================================================
  {
    files: ['src/components/atoms/**/*.{ts,tsx}'],
    ignores: [
      // Storybook files can import their own atoms for demonstration
      'src/components/atoms/**/*.stories.{ts,tsx}',
      // Test files can import their own atoms for testing
      'src/components/atoms/**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/**', '@/atoms/**', '@/molecules/**', '@/organisms/**', '@/templates/**'],
              message: '🚫 Atoms cannot import other components. Only external libraries allowed. (ADR-0011)',
            },
            {
              group: ['@/hooks/**'],
              message: '🚫 Atoms cannot import internal hooks. Use external hooks only. (ADR-0011)',
            },
            {
              group: ['@/core/**'],
              message: '🚫 Atoms cannot import from core layer. Keep atoms isolated. (ADR-0011)',
            },
          ],
        },
      ],
    },
  },

  // ========================================================================
  // MOLECULES: Can import atoms and molecules only
  // ========================================================================
  {
    files: ['src/components/molecules/**/*.{ts,tsx}'],
    ignores: [
      // Storybook files can import for demonstration
      'src/components/molecules/**/*.stories.{ts,tsx}',
      // Test files can import for testing
      'src/components/molecules/**/*.test.{ts,tsx}',
      // Temporary exceptions during migration (TODO: Remove after ADR-0011 migration completes)
      // Add files here that need gradual migration, with ticket references
      // Example: 'src/components/molecules/DialogFeedbackContent.tsx', // TODO: Ticket #123
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/organisms/**', '@/components/organisms/**', '../organisms/**', '../../organisms/**'],
              message:
                '🚫 Molecules cannot import organisms. Pass organisms via children props. (ADR-0011)\n' +
                '   Example: <Molecule>{<Organism />}</Molecule>\n' +
                '   See: docs/adr/0011-component-composition-children-pattern.md',
            },
            {
              group: ['@/templates/**', '@/components/templates/**', '../templates/**', '../../templates/**'],
              message: '🚫 Molecules cannot import templates. (ADR-0011)',
            },
          ],
        },
      ],
    },
  },

  // ========================================================================
  // ORGANISMS: Can import atoms, molecules, and other organisms
  // ========================================================================
  {
    files: ['src/components/organisms/**/*.{ts,tsx}'],
    ignores: [
      // Storybook files can import for demonstration
      'src/components/organisms/**/*.stories.{ts,tsx}',
      // Test files can import for testing
      'src/components/organisms/**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/templates/**', '@/components/templates/**', '../templates/**', '../../templates/**'],
              message: '🚫 Organisms cannot import templates. (ADR-0011)',
            },
          ],
        },
      ],
    },
  },

  // ========================================================================
  // TEMPLATES: Cannot import other templates (all templates are independent)
  // ========================================================================
  {
    files: ['src/components/templates/**/*.{ts,tsx}'],
    ignores: [
      // Storybook files can import for demonstration
      'src/components/templates/**/*.stories.{ts,tsx}',
      // Test files can import for testing
      'src/components/templates/**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/templates', '@/templates/**', '@/components/templates/**'],
              message:
                '🚫 Templates cannot import other templates. (ADR-0011)\n' +
                '   Each template should be independent and compose organisms directly.',
            },
          ],
        },
      ],
    },
  },
];

export default componentLayerRules;
