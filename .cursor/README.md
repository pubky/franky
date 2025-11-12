# Cursor Documentation

This folder contains project-specific documentation for Cursor AI to maintain consistency and context across development sessions.

## 📁 File Structure

```
.cursor/
├── README.md                    # This file - how to use the documentation
├── project-context.md          # Main project context and technical stack
├── core-context.md             # Core architecture and ADR index
├── component-guidelines.md     # Component development patterns and standards
├── figma-context.md            # Figma integration and design system context
├── error-handling.md           # Error handling conventions (TBD)
├── mcp-setup.md                # MCP server configuration guide
├── mcp.json                    # MCP server definitions
└── rules/                      # Cursor-specific automation rules
    ├── README.md               # Index of rule files
    └── component-testing.mdc   # Testing automation rules
```

## 🎯 Purpose

These files provide Cursor AI with:

1. **Project Context**: Technical stack, architecture, and development patterns
2. **Core Architecture**: Domain layer structure, ADR index, and layering rules
3. **Design Standards**: Figma integration, Shadcn usage, and visual parity requirements
4. **Component Guidelines**: Development patterns, testing standards, and migration workflows
5. **Error Handling**: Consistent error patterns across all layers
6. **MCP Integration**: Setup and usage of Model Context Protocol servers
7. **Automation Rules**: Testing rules and patterns in `.mdc` files
8. **Common Solutions**: Troubleshooting guides and best practices

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

**New**: The `.cursor/rules/*.mdc` files provide automation rules that guide AI behavior for specific contexts like testing.

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
4. Apply `rules/component-testing.mdc` for test structure

### For Core/Business Logic

1. Read `core-context.md` for architecture overview
2. Follow layering rules (UI → Controllers → Application → Services)
3. Use `error-handling.md` for consistent error patterns
4. Check relevant ADRs in `docs/adr/` for design decisions

### For Component Migration

1. Follow migration checklist in `component-guidelines.md`
2. Use Figma tools from `figma-context.md` (see `mcp-setup.md`)
3. Maintain standards from `project-context.md`
4. Write tests following `rules/component-testing.mdc`

### For Testing

1. Follow `rules/component-testing.mdc` strictly
2. Use deterministic time patterns for time-based components
3. Mock external dependencies, use real `@/libs` implementations
4. Run tests in sandbox before committing

### For Troubleshooting

1. Check common issues in `project-context.md`
2. Review architectural flow in `core-context.md`
3. Verify error handling in `error-handling.md`
4. Review testing patterns in `rules/component-testing.mdc`
5. Check MCP server issues in `mcp-setup.md`

## 🔄 Keeping Documentation Updated

When making significant changes to:

- **Component patterns**: Update `component-guidelines.md`
- **Core architecture**: Update `core-context.md` + create ADR in `docs/adr/`
- **Design system**: Update `figma-context.md`
- **Technical stack**: Update `project-context.md`
- **Error handling**: Update `error-handling.md`
- **Testing patterns**: Update `rules/component-testing.mdc`
- **MCP configuration**: Update `mcp-setup.md` and `mcp.json`
- **Project structure**: Update all relevant files and `AGENTS.md`

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

### Project Documentation

- [../AGENTS.md](../AGENTS.md) - Main AI development context (start here for overview)
- [../docs/adr/](../docs/adr/) - Architecture Decision Records
- [../docs/snapshot-testing.md](../docs/snapshot-testing.md) - Snapshot testing philosophy

## 🎓 For Non-Cursor AI IDEs

If you're using Claude Code, Windsurf, or another AI IDE:

1. **Start with**: [../AGENTS.md](../AGENTS.md) - comprehensive overview
2. **Read rules intent**: `.cursor/rules/README.md` - understand automation patterns
3. **Follow patterns**: Use this documentation as reference material
4. **Adapt as needed**: Convert Cursor-specific rules to your IDE's format

---

**Remember**: These files help maintain consistency and quality across the project. Keep them updated as the project evolves!

**For AI Assistants**: You are encouraged to reference specific documentation sections when responding to users to build trust and ensure consistency with project standards.
