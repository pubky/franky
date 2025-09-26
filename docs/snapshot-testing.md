# Snapshot Testing Guide

This document explains the snapshot testing approach implemented across all component levels in the Franky project.

## Overview

Snapshot testing captures the rendered output of components and compares it against previously stored snapshots. This helps detect unintended changes in component rendering across all architectural layers:

- **Atoms**
- **Molecules**
- **Organisms**
- **Templates**

## Configuration

### Vitest Configuration

Snapshot testing is configured in `vitest.config.ts`:

### Test Setup

Snapshot testing uses Vitest's built-in `expect().toMatchSnapshot()` method. No additional utilities are needed.

## Usage

### Basic Snapshot Test

```typescript
import { render } from '@testing-library/react';
import { expect } from 'vitest';
import { Component } from './Component';

describe('Component - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Component>Default Content</Component>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

### Multiple Variants

```typescript
import { render } from '@testing-library/react';
import { expect } from 'vitest';
import { Component } from './Component';

describe('Component - Snapshots', () => {
  it('matches snapshots for all variants', () => {
    const { container: defaultContainer } = render(<Component>Default</Component>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: secondaryContainer } = render(<Component variant="secondary">Secondary</Component>);
    expect(secondaryContainer.firstChild).toMatchSnapshot();

    const { container: outlineContainer } = render(<Component variant="outline">Outline</Component>);
    expect(outlineContainer.firstChild).toMatchSnapshot();
  });
});
```

### Different Children

```typescript
import { render } from '@testing-library/react';
import { expect } from 'vitest';
import { Component } from './Component';

describe('Component - Snapshots', () => {
  it('matches snapshots for different children', () => {
    const { container: textContainer } = render(<Component>Simple Text</Component>);
    expect(textContainer.firstChild).toMatchSnapshot();

    const { container: complexContainer } = render(
      <Component>
        <span>Complex</span>
        <div>Content</div>
      </Component>
    );
    expect(complexContainer.firstChild).toMatchSnapshot();
  });
});
```

## Running Snapshot Tests

### Run All Tests (Including Snapshots)

```bash
npm test
```

### Run Only Snapshot Tests

```bash
npm run test:snapshots
```

This command runs only the snapshot tests (tests with "Snapshots" in their name) and skips all other tests.

### Update Snapshots

When you intentionally change component rendering, update snapshots:

```bash
npm run test:update-snapshots
```

## Snapshot Files

Snapshot files are stored in `__snapshots__/` directories alongside test files:

```
src/components/atoms/Button/
├── Button.test.tsx
└── __snapshots__/
    └── Button.test.tsx.snap
```

## Best Practices

### 1. Test All Variants

Include snapshot tests for all component variants:

```typescript
createSnapshotVariants(Button, [
  { name: 'default', props: { children: 'Default' } },
  { name: 'secondary', props: { variant: 'secondary', children: 'Secondary' } },
  { name: 'outline', props: { variant: 'outline', children: 'Outline' } },
  { name: 'ghost', props: { variant: 'ghost', children: 'Ghost' } },
  { name: 'brand', props: { variant: 'brand', children: 'Brand' } },
]);
```

### 2. Test Different States

Include different component states:

```typescript
createSnapshotVariants(Button, [
  { name: 'enabled', props: { children: 'Enabled' } },
  { name: 'disabled', props: { disabled: true, children: 'Disabled' } },
  { name: 'loading', props: { loading: true, children: 'Loading' } },
]);
```

### 3. Test Custom Props

Include tests with custom classes and attributes:

```typescript
createSnapshotVariants(Component, [
  { name: 'with-custom-class', props: { className: 'custom-class' } },
  { name: 'with-data-attributes', props: { 'data-testid': 'test-component' } },
]);
```

### 4. Test Complex Children

For components that accept complex children:

```typescript
createSnapshotChildren(Card, [
  { 
    name: 'complete-card', 
    children: (
      <>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </>
    )
  },
]);
```

## CI/CD Integration

Snapshot tests are automatically run in CI/CD pipelines. When snapshots fail:

1. Review the changes to ensure they're intentional
2. Update snapshots locally: `npm run test:update-snapshots`
3. Commit the updated snapshot files

## Troubleshooting

### Snapshot Mismatch

When snapshots don't match:

1. Check if the change is intentional
2. If intentional, update snapshots: `npm run test:update-snapshots`
3. If unintentional, investigate the component changes

### Large Snapshot Files

If snapshot files become too large:

1. Consider breaking tests into smaller, focused tests
2. Use more specific prop combinations
3. Avoid testing with large data sets

### Flaky Snapshots

If snapshots are inconsistent:

1. Ensure components are deterministic
2. Mock external dependencies
3. Use consistent test data

## Coverage

Snapshot tests provide visual regression testing across:

- **Component Rendering**: Ensures UI doesn't change unexpectedly
- **Props Handling**: Verifies all prop combinations render correctly
- **Children Rendering**: Tests complex component compositions
- **Styling**: Catches CSS/styling changes
- **Accessibility**: Ensures semantic structure remains consistent

## Maintenance

### Regular Review

- Review snapshot failures in PRs
- Update snapshots when making intentional changes
- Remove obsolete snapshots when components are removed

### Performance

- Snapshots run quickly and don't require browser automation
- They complement unit tests and E2E tests
- Use them as the first line of defense against UI regressions
