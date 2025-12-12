# ADR 0011: Component Composition via Children Props

## Status

Accepted — 2024-12-11

## Context

In our atomic design system, we organize components into layers:

- **Atoms**: Base primitives (Button, Input, Badge)
- **Molecules**: Simple compositions of atoms and other molecules (SearchBar, PostCard)
- **Organisms**: Complex features composed of molecules, atoms, and other organisms (PostFeed, DialogFeedback)
- **Templates**: Page layouts that compose organisms, molecules, and atoms (but never other templates)
- **Pages**: Page components that compose templates only (but never other pages)
- **Layouts**: Layout components that compose page templates only (but never other layouts)

A violation of this hierarchy was identified where molecules directly imported and rendered organisms. For example, `DialogFeedbackContent` (a molecule) was directly importing and rendering `PostHeader` (an organism):

```tsx
// ❌ WRONG: Molecule importing Organism
// DialogFeedbackContent.tsx (molecule)
import { PostHeader } from '@/organisms';

export function DialogFeedbackContent({ ... }) {
  return (
    <div>
      <PostHeader postId={currentUserPubky} /> {/* Organism inside molecule */}
      <Textarea />
    </div>
  );
}
```

This creates several problems:

1. **Circular dependency risk**: Organisms import molecules, molecules import organisms
2. **Testing complexity**: Molecules become harder to test in isolation
3. **Reusability reduction**: Molecules become tightly coupled to specific organisms
4. **Layer violation**: Breaks the unidirectional flow of atomic design

## Decision

**Molecules must never directly import or render organisms.** When a molecule needs to display an organism, the organism must be passed as a `children` prop (or a named slot prop) from the parent organism.

### Pattern: Children Injection

```tsx
// ✅ CORRECT: Molecule receives organism as children
// DialogFeedbackContent.tsx (molecule)
export function DialogFeedbackContent({
  children, // Organism is injected here
  feedback,
  ...props
}: DialogFeedbackContentProps) {
  return (
    <div>
      {children} {/* Organism rendered via props, not import */}
      <Textarea value={feedback} />
    </div>
  );
}
```

```tsx
// ✅ CORRECT: Organism composes molecule and injects another organism
// DialogFeedback.tsx (organism)
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function DialogFeedback({ ... }) {
  return (
    <Molecules.DialogFeedbackContent {...props}>
      <Organisms.PostHeader postId={currentUserPubky} />
    </Molecules.DialogFeedbackContent>
  );
}
```

### When to Use Children vs. Named Slots vs. Props

Not every value should be passed as children. Use this guide:

#### Use Regular Props (Preferred for Data)

```tsx
// ✅ GOOD: Simple data as props
<UserProfile userName={userName} avatar={avatarUrl} />

// ❌ BAD: Overusing children for simple data
<UserProfile>
  {userName}
</UserProfile>
```

#### Use `children` Prop (1-2 Component Slots)

```tsx
// ✅ GOOD: Single organism slot
<DialogFeedbackContent>
  <PostHeader />
</DialogFeedbackContent>

// ✅ GOOD: Semantic wrapper with clear meaning
<Card>
  <PostContent />
</Card>
```

#### Use Named Slots (3+ Component Slots)

```tsx
// ✅ GOOD: Multiple distinct slots with explicit positioning
<HomeTemplate header={<FeedHeader />} sidebar={<TrendingSidebar />} content={<PostList />} />

// ⚠️ WARNING: If you need > 5 slots, consider splitting the component
```

#### Use Array of Children (Dynamic Same-Type Slots)

```tsx
// ✅ GOOD: Multiple organisms of the same type
interface DialogLayoutProps {
  posts: React.ReactNode[];
}

export function DialogLayout({ posts }: DialogLayoutProps) {
  return (
    <div>
      {posts.map((post, i) => (
        <div key={i}>{post}</div>
      ))}
    </div>
  );
}

// Usage
<DialogLayout
  posts={postIds.map((id) => (
    <PostHeader key={id} postId={id} />
  ))}
/>;
```

### Dependency Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS PAGES (src/app)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ page.tsx (route entry point)                         │    │
│  │   ├── Purpose: Routing + SEO metadata only          │    │
│  │   ├── imports: Templates ONLY                       │    │
│  │   └── ❌ CANNOT import Organisms, Molecules, Atoms  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ layout.tsx (shared layout)                           │    │
│  │   ├── Purpose: Providers + layout structure         │    │
│  │   ├── imports: Providers, Templates                 │    │
│  │   └── ❌ CANNOT import Organisms, Molecules, Atoms  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (imports)
┌─────────────────────────────────────────────────────────────┐
│                      TEMPLATES                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ HomeTemplate (page layout)                           │    │
│  │   ├── imports: Organisms, Molecules, Atoms          │    │
│  │   └── ❌ CANNOT import other Templates              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (imports)
┌─────────────────────────────────────────────────────────────┐
│                      ORGANISMS                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ DialogFeedback (orchestrator)                        │    │
│  │   ├── imports: Organisms, Molecules, Atoms          │    │
│  │   ├── ❌ CANNOT import Templates                    │    │
│  │   └── passes PostHeader as children to Content      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (imports)
┌─────────────────────────────────────────────────────────────┐
│                      MOLECULES                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ DialogFeedbackContent                                │    │
│  │   ├── imports: Molecules and Atoms                  │    │
│  │   ├── ❌ CANNOT import Organisms or Templates       │    │
│  │   └── renders: {children} (no organism imports)     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (imports)
┌─────────────────────────────────────────────────────────────┐
│                        ATOMS                                 │
│  Button, Input, Textarea, Container, etc.                   │
│  ❌ CANNOT import from component library                    │
└─────────────────────────────────────────────────────────────┘
```

### Rules

#### Component Layer Rules

1. **Atoms** → Import nothing from the component library (only external libs, see details below)
2. **Molecules** → Import from `@/atoms` and `@/molecules` (never from `@/organisms` or `@/templates`)
3. **Organisms** → Import from `@/atoms`, `@/molecules`, and `@/organisms` (never from `@/templates`)
4. **Templates** → Import from `@/atoms`, `@/molecules`, `@/organisms`, and **layout templates only**
5. **When a lower layer needs to render a higher layer** → Accept it via `children` or named slot props

#### Atom Import Rules (Detailed)

Atoms are the foundation and must remain dependency-free from internal components:

**✅ Allowed Imports:**

- External libraries (`react`, `@radix-ui/*`, `class-variance-authority`)
- Utility functions (`@/libs/cn`, `@/libs/formatDate`)
- Type imports only (`import type { User } from '@/types'`)
- External hooks (`useState`, `useCallback` from React)

**❌ Forbidden Imports:**

- Other atoms, molecules, organisms, templates
- Internal hooks from `@/hooks` (would create coupling to core layer)
- Core layer (`@/core/*`)
- Any component from the component library

#### Template Composition Rules (Detailed)

Templates can import other templates **only for layout composition**, not page composition:

**✅ Allowed: Layout Template Composition**

```tsx
// BaseLayoutTemplate.tsx (shared layout wrapper)
export function BaseLayoutTemplate({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}

// DashboardLayoutTemplate.tsx (specific layout)
import { BaseLayoutTemplate } from './BaseLayoutTemplate'; // ✅ OK

export function DashboardLayoutTemplate({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayoutTemplate>
      <nav>Dashboard Navigation</nav>
      {children}
    </BaseLayoutTemplate>
  );
}
```

**❌ Forbidden: Page Template Composition**

```tsx
// HomeTemplate.tsx (page template)
export function HomeTemplate() {
  return <div>Home Content</div>;
}

// DashboardTemplate.tsx (page template)
import { HomeTemplate } from './HomeTemplate'; // ❌ VIOLATION

export function DashboardTemplate() {
  return (
    <div>
      <HomeTemplate /> {/* Page templates cannot nest */}
    </div>
  );
}
```

**Rule of Thumb:**

- ✅ Base layouts → Specific layouts (acyclic, max depth 2)
- ❌ Page template → Page template (forbidden)

#### Next.js App Router Rules (`src/app/`)

6. **`page.tsx`** → Serves as **route entry point** and **SEO metadata** only
   - ✅ Can import: Templates only
   - ❌ Cannot import: Organisms, Molecules, Atoms directly
   - Purpose: Routing, `generateMetadata()`, `generateStaticParams()`

7. **`layout.tsx`** → Serves as **provider wrapper** and **layout structure**
   - ✅ Can import: Providers, Templates
   - ❌ Cannot import: Organisms, Molecules, Atoms directly
   - Purpose: Context providers, shared layout structure, `{children}` rendering

```tsx
// ✅ CORRECT: page.tsx imports only template
// src/app/profile/[pubky]/page.tsx
import { ProfileTemplate } from '@/templates';

export async function generateMetadata({ params }) {
  return { title: `Profile - ${params.pubky}` };
}

export default function ProfilePage({ params }) {
  return <ProfileTemplate pubky={params.pubky} />;
}
```

```tsx
// ✅ CORRECT: layout.tsx wraps with providers and template
// src/app/profile/[pubky]/layout.tsx
import { ProfileProvider } from '@/providers';
import { ProfileLayoutTemplate } from '@/templates';

export default function ProfileLayout({ children }) {
  return (
    <ProfileProvider>
      <ProfileLayoutTemplate>{children}</ProfileLayoutTemplate>
    </ProfileProvider>
  );
}
```

```tsx
// ❌ WRONG: page.tsx importing organisms directly
// src/app/profile/[pubky]/page.tsx
import { ProfileHeader, ProfileTabs } from '@/organisms'; // ❌ Violation!

export default function ProfilePage() {
  return (
    <div>
      <ProfileHeader />
      <ProfileTabs />
    </div>
  );
}
```

### Testing & Storybook Requirements by Layer

Each layer has specific testing and documentation requirements aligned with its responsibilities:

| Layer             | Unit Tests      | Snapshot Tests  | Performance Tests | Storybook       | Required |
| ----------------- | --------------- | --------------- | ----------------- | --------------- | -------- |
| **Atoms**         | ✅ Required     | ✅ Required     | ❌ Not needed     | ✅ Required     | Yes      |
| **Molecules**     | ✅ Required     | ✅ Required     | ❌ Not needed     | ✅ Required     | Yes      |
| **Organisms**     | ✅ Required     | ❌ Not required | ✅ Required       | ❌ Not required | Yes      |
| **Templates**     | ❌ Not required | ❌ Not required | ❌ Not required   | ❌ Not required | No       |
| **Pages/Layouts** | ❌ Not required | ❌ Not required | ❌ Not required   | ❌ Not required | No       |

#### Atoms & Molecules Testing

Focus on **visual correctness** and **isolation**:

- ✅ Snapshot tests for all visual states (default, hover, disabled, error, etc.)
- ✅ Unit tests for interactions (click handlers, input changes)
- ✅ One expect per snapshot test
- ✅ Mock children when testing molecules that accept organisms via props
- ✅ Storybook stories for visual documentation and design review

```tsx
// Atom test example
describe('Button', () => {
  it('renders correctly', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(<Button disabled>Click me</Button>);
    expect(container).toMatchSnapshot();
  });
});
```

#### Storybook Requirements

| Layer             | Storybook       | Rationale                                                         |
| ----------------- | --------------- | ----------------------------------------------------------------- |
| **Atoms**         | ✅ Required     | Reusable primitives need visual documentation for designers       |
| **Molecules**     | ✅ Required     | Compositions need to showcase variants and states                 |
| **Organisms**     | ⚠️ Optional     | Useful for isolated previews, requires MSW for core layer mocking |
| **Templates**     | ❌ Not required | Layout-only, verified via E2E and visual review                   |
| **Pages/Layouts** | ❌ Not required | Routing-only, no visual components                                |

**Rationale**:

- **Atoms & Molecules** are the building blocks used across the app—Storybook enables designers and developers to review all visual states in isolation
- **Organisms** can have Storybook stories if isolated previews are valuable during development. Use MSW (Mock Service Worker) to mock core layer dependencies (controllers, API calls)
- **Templates & Pages** are layout/routing concerns with no reusable visual components

**Atom/Molecule Story Example:**

```tsx
// ✅ CORRECT: Atom with Storybook story
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Atoms/Button',
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Click me' },
};

export const Disabled: Story = {
  args: { children: 'Click me', disabled: true },
};

export const Loading: Story = {
  args: { children: 'Click me', loading: true },
};
```

**Organism Story Example (Optional, with MSW):**

```tsx
// ⚠️ OPTIONAL: Organism with MSW mocking
// PostFeed.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { PostFeed } from './PostFeed';

const meta: Meta<typeof PostFeed> = {
  component: PostFeed,
  title: 'Organisms/PostFeed',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/posts', () => {
          return HttpResponse.json([
            { id: '1', content: 'Test post 1', author: 'user1' },
            { id: '2', content: 'Test post 2', author: 'user2' },
          ]);
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PostFeed>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/posts', async () => {
          await delay('infinite'); // Show loading state
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/posts', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
};
```

**Decision:** Create organism stories only if they provide value during development (UI review, state exploration). Don't create them just to have coverage.

#### Organisms Testing

Focus on **performance** and **integration**:

- ✅ Render cycle tests (ensure minimal re-renders)
- ✅ Core layer call verification (controllers, hooks)
- ✅ Hook usage tests (correct dependencies, cleanup)
- ✅ Integration tests for composed behavior
- ✅ Performance budgets for render times
- ❌ Snapshot tests not required (visual testing delegated to atoms/molecules)

**Performance Budgets:**

| Metric                         | Budget  | Measurement                         |
| ------------------------------ | ------- | ----------------------------------- |
| Initial render (100 items)     | < 500ms | `performance.now()`                 |
| Re-render (single item update) | < 50ms  | `performance.now()`                 |
| Memory growth (1000 items)     | < 10MB  | `performance.memory.usedJSHeapSize` |

```tsx
// Organism performance test example
describe('PostFeed Performance', () => {
  it('renders 100 posts in under 500ms', () => {
    const start = performance.now();
    render(<PostFeed posts={generateMockPosts(100)} />);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(500);
  });

  it('re-renders single post update in under 50ms', () => {
    const { rerender } = render(<PostFeed posts={mockPosts} />);

    const start = performance.now();
    rerender(<PostFeed posts={mockPostsWithOneUpdate} />);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });

  it('does not re-render when unrelated props change', () => {
    const renderSpy = vi.fn();

    function TestPostFeed(props: PostFeedProps) {
      renderSpy();
      return <PostFeed {...props} />;
    }

    const { rerender } = render(<TestPostFeed userId="user1" />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    rerender(<TestPostFeed userId="user1" unrelatedProp="new" />);
    expect(renderSpy).toHaveBeenCalledTimes(1); // No re-render
  });

  it('calls controller on mount', () => {
    const mockController = vi.spyOn(PostController, 'fetchPosts');
    render(<PostFeed />);
    expect(mockController).toHaveBeenCalledOnce();
  });

  it('cleans up hooks on unmount', () => {
    const mockCleanup = vi.fn();
    vi.spyOn(PostController, 'subscribe').mockReturnValue(mockCleanup);

    const { unmount } = render(<PostFeed />);
    unmount();

    expect(mockCleanup).toHaveBeenCalledOnce();
  });
});
```

#### Templates Testing

Templates are **layout compositions only** and do not require tests:

- ❌ No unit tests required
- ❌ No snapshot tests required
- ❌ No performance tests required

**Rationale**: Templates are thin wrappers that compose already-tested organisms. Their correctness is verified through:

- E2E tests that exercise full page flows
- Visual review in Storybook
- Individual organism tests

#### Pages & Layouts Testing (`src/app/`)

Next.js pages and layouts are **routing and metadata only** and do not require tests:

- ❌ No unit tests required
- ❌ No snapshot tests required
- ❌ No performance tests required

**Rationale**: Pages and layouts contain no business logic—they only:

- Define routes (via file system)
- Export SEO metadata (`generateMetadata`)
- Wrap content with providers
- Render templates

Their correctness is verified through:

- E2E tests that exercise full user flows
- Next.js build-time validation
- Template and organism tests

### Named Slot Pattern with Type Safety

For multiple organism slots, use named props instead of children. Prefer specific types over generic `React.ReactNode`:

```tsx
// ✅ BEST: Specific component types (most type-safe)
interface HomeTemplateProps {
  header: React.ReactElement<typeof FeedHeader>;
  sidebar: React.ReactElement<typeof TrendingSidebar>;
  content: React.ReactElement<typeof PostList>;
}

export function HomeTemplate({ header, sidebar, content }: HomeTemplateProps) {
  return (
    <div>
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{content}</main>
    </div>
  );
}

// ✅ GOOD: JSX.Element (flexible, still type-safe)
interface HomeTemplateProps {
  header: JSX.Element;
  sidebar: JSX.Element;
  content: JSX.Element;
}

// ⚠️ ACCEPTABLE: React.ReactNode (allows primitives, use sparingly)
interface HomeTemplateProps {
  header: React.ReactNode; // Accepts strings, numbers, null
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

// Page composing the template with organisms
export function HomePage() {
  return (
    <Templates.HomeTemplate
      header={<Organisms.FeedHeader />}
      sidebar={<Organisms.TrendingSidebar />}
      content={<Organisms.PostList />}
    />
  );
}
```

**Type Safety Guidelines:**

| Type                                   | Accepts                             | Use When                 |
| -------------------------------------- | ----------------------------------- | ------------------------ |
| `React.ReactElement<typeof Component>` | Specific component only             | Strict slot requirements |
| `JSX.Element`                          | Any valid JSX                       | Flexible but type-safe   |
| `React.ReactNode`                      | JSX, strings, numbers, null, arrays | Need primitive fallbacks |

**Recommendation**: Use `JSX.Element` as the default for component slots. Use `React.ReactNode` only when you need to support primitive fallbacks like loading text or empty states.

## Implementation Notes

### Migration Steps

When refactoring a molecule that imports an organism:

1. **Identify the organism import** in the molecule
2. **Add children/slot prop** to the molecule's types
3. **Replace organism render** with `{children}` or slot prop
4. **Move organism render** to the parent organism
5. **Update tests** to pass mock children
6. **Update snapshots** if needed

### Migration Priority

Not all violations need immediate fixing. Prioritize based on impact:

**🔴 High Priority (Fix Immediately):**

- Molecules importing organisms in **critical user paths** (authentication, checkout, post creation)
- Molecules with **circular dependency risks** (molecule ↔ organism cycles)
- Newly created components (enforce from day 1)

**🟡 Medium Priority (Fix in Next Sprint):**

- Molecules importing organisms in **secondary features** (settings, profile editing)
- Molecules used in **multiple organisms** (high coupling risk)

**🟢 Low Priority (Fix During Refactor):**

- Molecules importing organisms in **rarely used features** (admin panels, analytics)
- Molecules with **single usage** (low coupling risk)
- Legacy components scheduled for replacement

### Backward Compatibility

During migration period:

```tsx
// Mark violations with TODO comments
import { PostHeader } from '@/organisms'; // TODO: ADR-0011 violation - pass via children

export function DialogFeedbackContent({ postId }) {
  return (
    <div>
      <PostHeader postId={postId} /> {/* Will be removed */}
      <Textarea />
    </div>
  );
}
```

**Important:** New ESLint rules (ADR-0012) will prevent new violations while allowing existing code to be migrated gradually.

### Code Locations

- Molecules: `src/components/molecules/`
- Organisms: `src/components/organisms/`
- Example refactor: `DialogFeedbackContent` moved to molecules, `PostHeader` passed as children

### Codemod Script (Future Enhancement)

For automated migration, consider creating a codemod:

```typescript
// scripts/migrate-adr-0011.ts (example, not implemented)
import { transformSync } from '@babel/core';

export function migrateToChildrenPattern(filePath: string): string {
  // 1. Detect organism imports in molecule files
  // 2. Extract organism component names
  // 3. Replace with children prop
  // 4. Update parent organism to pass children
  // 5. Update tests to mock children

  // Implementation left as future enhancement
  throw new Error('Not yet implemented - manual migration required');
}
```

### Testing Pattern

```tsx
// Molecule test - includes snapshot + mock children
describe('DialogFeedbackContent', () => {
  const MockPostHeader = () => <div data-testid="post-header">Mock</div>;

  it('renders correctly with children', () => {
    const { container } = render(
      <DialogFeedbackContent {...props}>
        <MockPostHeader />
      </DialogFeedbackContent>,
    );
    expect(container).toMatchSnapshot(); // ✅ Snapshot required for molecules
  });
});

// Organism test - focuses on performance, no snapshot
describe('DialogFeedback', () => {
  it('calls core layer on submit', async () => {
    const mockSubmit = vi.spyOn(FeedbackController, 'submit');
    render(<DialogFeedback />);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(mockSubmit).toHaveBeenCalledOnce(); // ✅ Core call verification
  });

  it('does not re-render children unnecessarily', () => {
    // ✅ Performance test - no snapshot needed
  });
});
```

## Related Decisions

- Depends on: Atomic Design pattern (implicit, not in ADR)
- Related: [ADR-0004: Layering and Dependency Rules](./0004-layering-and-dependency-rules.md) (similar principles for core layer)
- Enforced by: [ADR-0012: Component Layer ESLint Enforcement](./0012-component-layer-eslint-enforcement.md) (automated rule enforcement)

## References

- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [React Composition Patterns](https://reactjs.org/docs/composition-vs-inheritance.html)
- [Component Driven Development](https://www.componentdriven.org/)
