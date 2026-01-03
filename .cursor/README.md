# Cursor Documentation

This folder contains all project-specific documentation for AI-assisted development in the Franky project. It's designed to maintain consistency and context across development sessions.

> **📁 All documentation is centralized here** for easy access since the whole team uses Cursor.

## 📁 File Structure

```
.cursor/
├── README.md                       # This file - documentation index
├── docs/                           # All documentation
│   ├── project-context.md          # Tech stack, patterns, troubleshooting
│   ├── core-context.md             # Core architecture and ADR index
│   ├── component-guidelines.md     # Component development standards
│   ├── figma-context.md            # Design system integration
│   ├── error-handling.md           # Error handling conventions
│   ├── z-index-conventions.md      # Z-index layering system
│   ├── snapshot-testing.md         # Snapshot testing philosophy
│   └── environment.md              # Environment variables
├── adr/                            # Architecture Decision Records
│   ├── TEMPLATE.md
│   ├── 0001-local-first-writes.md
│   ├── 0002-composite-post-ids.md
│   ├── 0003-streams-as-caches.md
│   ├── 0004-layering-and-dependency-rules.md
│   ├── 0005-ttl-refresh-policy.md
│   ├── 0006-pipes-normalization.md
│   ├── 0007-dexie-version-normalization.md
│   ├── 0008-coordinators-layer.md
│   ├── 0009-application-cross-domain-orchestration.md
│   ├── 0010-notification-application-orchestration.md
│   └── 0011-dexie-psd-and-tanstack-query.md
├── rules/                          # Automation rules (.mdc)
│   ├── architecture.mdc            # Layer rules, dependencies
│   ├── local-first.mdc             # Write patterns, naming
│   ├── components.mdc              # Shadcn, atomic design
│   ├── component-testing.mdc       # Testing requirements
│   ├── data-patterns.mdc           # IDs, streams, TTL, pipes
│   ├── error-handling.mdc          # AppError patterns
│   ├── z-index.mdc                 # Z-index conventions
│   └── commit-message.mdc          # Commit format
├── commands/                       # Workflow commands
│   ├── pr-full-review.md
│   ├── pr-review.md
│   ├── pr-check.md
│   └── pr-message.md
└── assets/                         # Images and resources
    └── core_structure.png
```

## 🎯 Purpose

These files provide Cursor AI with:

1. **Project Context**: Technical stack, architecture, and development patterns
2. **Core Architecture**: Domain layer structure, ADR index, and layering rules
3. **Design Standards**: Figma integration, Shadcn usage, and visual parity requirements
4. **Component Guidelines**: Development patterns, testing standards, and migration workflows
5. **Error Handling**: Consistent error patterns across all layers
6. **Testing Standards**: Unit tests, snapshot tests, and mocking rules
7. **Environment Setup**: Environment variables and configuration
8. **Automation Rules**: Testing rules and patterns in `.mdc` files
9. **ADRs**: Architecture Decision Records documenting key choices

## 🔧 How Cursor Uses This Documentation

Cursor AI automatically references these files when:

- Working on component development
- Implementing core business logic
- Writing tests for components
- Migrating components from Figma
- Following project patterns and standards
- Handling errors across layers
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

1. Check `docs/component-guidelines.md` for development patterns
2. Use `docs/figma-context.md` for design system integration
3. Follow `docs/project-context.md` for technical requirements
4. Apply `rules/component-testing.mdc` for test structure

### For Core/Business Logic

1. Read `docs/core-context.md` for architecture overview
2. Follow layering rules (UI → Controllers → Application → Services)
3. Use `docs/error-handling.md` for consistent error patterns
4. Check relevant ADRs in `adr/` for design decisions

### For Component Migration

1. Follow migration checklist in `docs/component-guidelines.md`
2. Use Figma tools from `docs/figma-context.md`
3. Maintain standards from `docs/project-context.md`
4. Write tests following `rules/component-testing.mdc`

### For Testing

1. Follow `rules/component-testing.mdc` strictly
2. Use deterministic time patterns for time-based components
3. Mock external dependencies, use real `@/libs` implementations
4. Run tests in sandbox before committing
5. Reference `docs/snapshot-testing.md` for snapshot philosophy

### For Troubleshooting

1. Check common issues in `docs/project-context.md`
2. Review architectural flow in `docs/core-context.md`
3. Verify error handling in `docs/error-handling.md`
4. Review testing patterns in `rules/component-testing.mdc`

## 🔄 Keeping Documentation Updated

When making significant changes to:

- **Component patterns**: Update `docs/component-guidelines.md`
- **Core architecture**: Update `docs/core-context.md` + create ADR in `adr/`
- **Design system**: Update `docs/figma-context.md`
- **Technical stack**: Update `docs/project-context.md`
- **Error handling**: Update `docs/error-handling.md`
- **Testing patterns**: Update `rules/component-testing.mdc` and `docs/snapshot-testing.md`
- **Environment variables**: Update `docs/environment.md`
- **Project structure**: Update all relevant files

## 📚 External Resources

### Design & UI

- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Figma Project](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

### Core Technology

- [Dexie.js Documentation](https://dexie.org/) - IndexedDB wrapper
- [Next.js Documentation](https://nextjs.org/docs)
- [React Testing Library](https://testing-library.com/react)

---

**Remember**: These files help maintain consistency and quality across the project. Keep them updated as the project evolves!

**For AI Assistants**: You are encouraged to reference specific documentation sections when responding to users to build trust and ensure consistency with project standards.
