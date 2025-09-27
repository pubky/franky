# Pubky Project Context

## 🎨 Design System & Figma Integration

### Figma Project

- **Main Project**: [shadcn_ui-PUBKY](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)
- **Design System**: Based on Shadcn UI with project-specific customizations
- **Component Library**: All components must have 100% parity with Figma design

### Design Patterns

- **Atomic Design**: Atoms → Molecules → Organisms
- **Shadcn Primitives**: Always use Shadcn base components when available
- **CVA (Class Variance Authority)**: For managing component variants
- **Tailwind CSS**: For styling, following Shadcn design system

## 🏗️ Component Development Guidelines

### Folder Structure

```
src/components/
├── atoms/           # Basic components (Button, Input, Avatar, etc.)
├── molecules/       # Atom combinations (InputField, WordSlot, etc.)
└── organisms/       # Complex components (Forms, Dialogs, etc.)
```

### Component Patterns

#### 1. **Always use Shadcn as base**

- Install official component: `npx shadcn@latest add [component] --yes`
- Adapt to project folder structure
- Maintain existing functionality

#### 2. **File Structure**

```
src/components/atoms/[Component]/
├── [Component].tsx      # Main component
├── [Component].types.ts # Type definitions
├── [Component].test.tsx # Tests
└── index.ts             # Exports
```

#### 3. **Imports and Exports**

- Use `@/libs` for utilities (cn, etc.)
- Export via `src/components/atoms/index.ts`
- Maintain compatibility with existing imports

#### 4. **Testing**

- Always create complete tests
- Use `data-testid` for main elements
- Test variants and custom props

## 🔧 Technical Stack

### Core Libraries

- **Next.js 15.3.2**: React framework
- **TypeScript**: Static typing
- **Tailwind CSS**: Styling
- **Shadcn UI**: Base components
- **Radix UI**: Accessible primitives
- **CVA**: Variant management
- **Vitest**: Unit testing
- **React Testing Library**: Component testing

### State Management

- **Zustand**: State management
- **Persist Middleware**: Data persistence
- **Devtools Middleware**: Debugging

### Authentication & Data

- **@synonymdev/pubky**: WASM client for homeserver
- **HomeserverService**: Singleton for communication
- **Session Management**: Cookies and localStorage

## 📋 Component Migration Checklist

When migrating components from Figma:

1. **✅ Install Shadcn**: `npx shadcn@latest add [component]`
2. **✅ Move to atoms/**: Correct folder structure
3. **✅ Adapt imports**: Use `@/libs` and correct paths
4. **✅ Maintain functionality**: Preserve existing props and behaviors
5. **✅ Create tests**: Complete tests with RTL
6. **✅ Update exports**: Via `atoms/index.ts`
7. **✅ Test build**: `npm run build` must pass
8. **✅ Test browser**: Verify visual functionality

## 🎯 Figma Integration Workflow

### For new components:

1. **Analyze Figma**: Use MCP Figma tools to extract design
2. **Check Shadcn**: If equivalent base component exists
3. **Implement**: Following established patterns
4. **Test**: 100% visual and functional parity

### For refactoring:

1. **Backup**: Maintain existing functionality
2. **Migrate**: To Shadcn primitives
3. **Validate**: Tests and build passing
4. **Document**: Update this file if necessary

## 🚨 Common Issues & Solutions

### Build Errors

- **Import paths**: Always use `@/libs` instead of relative paths
- **Missing exports**: Check `atoms/index.ts`
- **Type errors**: Maintain compatibility with existing types

### Test Failures

- **Role queries**: Use `data-testid` for elements without roles
- **Ref forwarding**: Check correct types (HTMLSpanElement vs HTMLDivElement)
- **Mock imports**: Update mocks when necessary

### Figma Parity

- **Sizes**: Maintain exact design sizes
- **Colors**: Use design system tokens
- **Spacing**: Follow Figma grid system
- **States**: Implement all states (hover, focus, disabled, etc.)

## 📚 Resources

- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com/)
- [CVA Documentation](https://cva.style/)
- [Figma Project](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)

---

**Last Updated**: $(date)
**Version**: 1.0.0
