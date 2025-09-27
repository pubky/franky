# Cursor Documentation

This folder contains project-specific documentation for Cursor AI to maintain consistency and context across development sessions.

## 📁 File Structure

```
.cursor/
├── README.md                    # This file - how to use the documentation
├── project-context.md          # Main project context and technical stack
├── component-guidelines.md     # Component development patterns and standards
└── figma-context.md           # Figma integration and design system context
```

## 🎯 Purpose

These files provide Cursor AI with:

1. **Project Context**: Technical stack, architecture, and development patterns
2. **Design Standards**: Figma integration, Shadcn usage, and visual parity requirements
3. **Component Guidelines**: Development patterns, testing standards, and migration workflows
4. **Common Solutions**: Troubleshooting guides and best practices

## 🔧 How Cursor Uses This Documentation

Cursor AI automatically references these files when:

- Working on component development
- Migrating components from Figma
- Following project patterns and standards
- Troubleshooting common issues
- Maintaining consistency across the codebase

## 📋 Key Principles

### 1. **Shadcn First**

- Always check for Shadcn equivalent components
- Use official Shadcn primitives as base
- Adapt to project structure, don't recreate

### 2. **Figma Parity**

- 100% visual parity with Figma designs
- Use MCP Figma tools for accurate extraction
- Maintain exact sizes, colors, and spacing

### 3. **Atomic Design**

- Follow atoms → molecules → organisms structure
- Maintain consistent folder organization
- Preserve existing functionality during migrations

### 4. **Quality Standards**

- Complete test coverage with RTL
- Build and browser testing
- TypeScript type safety
- ESLint compliance

## 🚀 Quick Reference

### For New Components

1. Check `component-guidelines.md` for development patterns
2. Use `figma-context.md` for design system integration
3. Follow `project-context.md` for technical requirements

### For Component Migration

1. Follow migration checklist in `component-guidelines.md`
2. Use Figma tools from `figma-context.md`
3. Maintain standards from `project-context.md`

### For Troubleshooting

1. Check common issues in `project-context.md`
2. Review testing patterns in `component-guidelines.md`
3. Verify Figma integration in `figma-context.md`

## 🔄 Keeping Documentation Updated

When making significant changes to:

- **Component patterns**: Update `component-guidelines.md`
- **Design system**: Update `figma-context.md`
- **Technical stack**: Update `project-context.md`
- **Project structure**: Update all relevant files

## 📚 External Resources

- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Figma Project](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Remember**: These files help maintain consistency and quality across the project. Keep them updated as the project evolves!
