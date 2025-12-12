# Component Development Guidelines

## 🎯 Core Principles

### 1. **Shadcn First**

- **ALWAYS** check if Shadcn equivalent component exists
- Use `npx shadcn@latest add [component] --yes` to install
- Adapt to project structure, don't recreate from scratch

### 2. **Figma Parity**

- **100% visual parity** with Figma design
- Use MCP Figma tools to extract designs
- Maintain exact sizes, colors and spacing

### 3. **Atomic Design Structure**

```
atoms/     → Basic components (Button, Input, Avatar)
molecules/ → Atom combinations (InputField, WordSlot)
organisms/ → Complex components (Forms, Dialogs)
templates/ → Page layouts (never import other templates)
```

### 4. **Component Composition Rules (ADR-0011)**

**Molecules must never import organisms.** When a molecule needs to render an organism, pass it via `children` or named slot props:

```tsx
// ❌ WRONG: Molecule importing Organism
import { PostHeader } from '@/organisms';
export function DialogFeedbackContent() {
  return <PostHeader />; // Direct import violates hierarchy
}

// ✅ CORRECT: Molecule receives organism as children
export function DialogFeedbackContent({ children }) {
  return <>{children}<Textarea /></>;
}

// Parent organism composes and injects
export function DialogFeedback() {
  return (
    <Molecules.DialogFeedbackContent>
      <Organisms.PostHeader />
    </Molecules.DialogFeedbackContent>
  );
}
```

**Dependency Rules:**
- **Atoms** → Import nothing from component library (only external libs, utils, type imports)
- **Molecules** → Import from `@/atoms` and `@/molecules` (never from `@/organisms` or `@/templates`)
- **Organisms** → Import from `@/atoms`, `@/molecules`, and `@/organisms` (never from `@/templates`)
- **Templates** → Import from `@/atoms`, `@/molecules`, `@/organisms`, and **layout templates only** (never from page templates)

**Automated Enforcement:**
These rules are automatically enforced by ESLint (ADR-0012). Violations will fail CI/CD builds. If you see a linting error, pass the component via `children` props instead of importing it directly.

See:
- [ADR-0011: Component Composition via Children Props](../docs/adr/0011-component-composition-children-pattern.md)
- [ADR-0012: Component Layer ESLint Enforcement](../docs/adr/0012-component-layer-eslint-enforcement.md)

## 📁 File Structure Template

```
src/components/atoms/[Component]/
├── [Component].tsx           # Main component
├── [Component].test.tsx      # Unit tests
├── [Component].types.ts      # Type definitions
└── index.ts                  # Exports
```

## 🔧 Implementation Checklist

### Before Starting

- [ ] Check if Shadcn equivalent component exists
- [ ] Analyze design in Figma using MCP tools
- [ ] Identify all necessary variants and states

### During Development

- [ ] Install Shadcn component if available
- [ ] Move to `atoms/[Component]/` structure
- [ ] Adapt imports to use `@/libs`
- [ ] Maintain existing functionality
- [ ] Implement all Figma variants
- [ ] Use CVA to manage variants

### Testing

- [ ] Create complete tests with RTL
- [ ] Use `data-testid` for main elements
- [ ] Test all variants and props
- [ ] Verify `npm test` passes
- [ ] Verify `npm run build` passes

### Final Steps

- [ ] Update exports in `atoms/index.ts`
- [ ] Test in browser
- [ ] Document changes if necessary

## 🎨 Design System Integration

### Colors

- Use design system tokens: `bg-primary`, `text-muted-foreground`
- Don't hardcode colors: `#ffffff` → `bg-background`

### Sizing

- Follow Figma scale: `h-6 w-6`, `h-10 w-10`, etc.
- Use consistent Tailwind classes

### Spacing

- Follow grid system: `p-4`, `gap-2`, `space-y-4`
- Maintain consistency with other components

### Typography

- Use text classes: `text-sm`, `font-medium`
- Maintain visual hierarchy

## 🧪 Testing Patterns

### Component Tests

```typescript
// ✅ Good: Use data-testid for reliable queries
render(<Button data-testid="button">Click me</Button>);
const button = screen.getByTestId('button');

// ❌ Bad: Role queries may not work for all components
const button = screen.getByRole('button');
```

### Variant Testing

```typescript
// Test all variants
it('renders different sizes correctly', () => {
  const { rerender, container } = render(<Button size="sm" />);
  expect(container.firstChild).toHaveClass('h-8');

  rerender(<Button size="lg" />);
  expect(container.firstChild).toHaveClass('h-12');
});
```

### Ref Testing

```typescript
// Use correct HTML element type
it('forwards ref correctly', () => {
  const ref = React.createRef<HTMLButtonElement>(); // or HTMLSpanElement
  render(<Button ref={ref} />);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
```

## 🔄 Migration Patterns

### From Custom to Shadcn

1. **Backup**: Document existing functionality
2. **Install**: `npx shadcn@latest add [component]`
3. **Adapt**: Move to correct structure
4. **Preserve**: Maintain props and behaviors
5. **Test**: Verify compatibility

### Common Adaptations

```typescript
// ✅ Adapt Shadcn component
const Button = React.forwardRef<
  React.ElementRef<typeof ButtonPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ButtonPrimitive.Root> &
  VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ButtonPrimitive.Root
    ref={ref}
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
));
```

## 🚨 Common Pitfalls

### Import Issues

```typescript
// ✅ Correct
import { cn } from '@/libs';

// ❌ Wrong
import { cn } from 'src/lib/utils';
```

### Export Issues

```typescript
// ✅ Update atoms/index.ts
export * from './Button';

// ❌ Forget to update exports
```

### Test Issues

```typescript
// ✅ Use container for elements without roles
const { container } = render(<Avatar />);
const avatar = container.firstChild as HTMLElement;

// ❌ Assume role exists
const avatar = screen.getByRole('img');
```

## 📋 Quality Checklist

### Code Quality

- [ ] TypeScript types are correct
- [ ] No ESLint errors
- [ ] Proper imports and exports
- [ ] Consistent naming conventions

### Design Quality

- [ ] 100% visual parity with Figma
- [ ] All variants implemented
- [ ] Responsive behavior correct
- [ ] Accessibility maintained

### Testing Quality

- [ ] All tests pass
- [ ] Good test coverage
- [ ] Tests are maintainable
- [ ] No flaky tests

### Integration Quality

- [ ] Build passes
- [ ] No runtime errors
- [ ] Compatible with existing code
- [ ] Performance acceptable

---

**Remember**: Always prioritize Shadcn primitives and maintain Figma parity!
