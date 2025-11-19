# AI Development Context

This document serves as the central index for AI-assisted development in the Franky project. It provides context, guidelines, and references for AI coding assistants across different IDEs (Cursor, Claude Code, Windsurf, etc.).

## Purpose

This file establishes:

- **Architectural patterns** and decision rationale
- **Development standards** for consistency
- **Testing guidelines** for quality
- **Error handling** conventions
- **AI-specific rules** for code generation

## Quick Start for AI Assistants

When working on this codebase, prioritize reading these files in order:

1. **Project Overview**: Start with `.cursor/project-context.md` for technical stack
2. **Core Architecture**: Read `.cursor/core-context.md` for domain layer understanding
3. **Component Guidelines**: Check `.cursor/component-guidelines.md` for UI patterns
4. **Testing Standards**: Review `.cursor/rules/component-testing.mdc` for test requirements
5. **Error Handling**: Reference `.cursor/error-handling.md` for error conventions

## Documentation Structure

```
.
├── AGENTS.md                        # ← You are here (index for all AI context)
├── .cursor/                         # Cursor-specific documentation
│   ├── README.md                    # Overview of Cursor docs
│   ├── project-context.md          # Tech stack, patterns, troubleshooting
│   ├── core-context.md             # Core architecture and ADR index
│   ├── component-guidelines.md     # Component development standards
│   ├── figma-context.md            # Design system integration
│   ├── error-handling.md           # Error handling conventions
│   ├── mcp-setup.md                # MCP server configuration guide
│   ├── mcp.json                    # MCP server definitions
│   └── rules/                      # Cursor-specific automation rules
│       ├── component-testing.mdc   # Testing automation rules
│       └── commit-message.mdc      # Commit message format rules
└── docs/
    ├── adr/                        # Architecture Decision Records
    │   ├── TEMPLATE.md             # ADR template for new decisions
    │   ├── 0001-local-first-writes.md
    │   ├── 0002-composite-post-ids.md
    │   ├── 0003-streams-as-caches.md
    │   ├── 0004-layering-and-dependency-rules.md
    │   ├── 0005-ttl-refresh-policy.md
    │   ├── 0006-pipes-normalization.md
    │   ├── 0007-dexie-version-normalization.md
    │   └── 0008-coordinators-layer.md
    └── snapshot-testing.md         # Snapshot testing philosophy
```

## Core Principles

### 1. Architecture (Domain-Driven Design)

The application follows a strict layered architecture in `src/core/`:

```
UI (user actions) ──────┐
                        ↓
Coordinators (system) ─→ Controllers → Application → Services → Models
                         ↓              ↓             ↓
                         Stores         Pipes         Database
```

**Key rules:**

- UI and Coordinators call controllers (entry points)
- **Controllers**: Entry point for user-initiated actions
- **Coordinators**: Entry point for system-initiated actions (polling, background sync)
- **Application**: Orchestrates workflows (NOT an entry point, called BY controllers)
- Services handle all IO boundaries
- Models are Dexie-only (no network calls)
- Pipes transform/validate data (no IO)

📖 **Read more**: `.cursor/core-context.md` and `docs/adr/0004-layering-and-dependency-rules.md`

### 2. Local-First Design

All write operations:

1. Commit to local Dexie store first
2. Update UI immediately
3. Sync to homeserver in background
4. Reconcile conflicts asynchronously

📖 **Read more**: `docs/adr/0001-local-first-writes.md`

### 3. Component Development

Follow atomic design principles:

- **Atoms**: Base components (Button, Input, Badge)
- **Molecules**: Simple compositions (SearchBar, PostCard)
- **Organisms**: Complex features (PostFeed, UserProfile)
- **Templates**: Page layouts

**Standards:**

- Shadcn UI components as base (check first before creating)
- 100% visual parity with Figma designs
- Complete test coverage (unit + snapshot)
- TypeScript strict mode

📖 **Read more**: `.cursor/component-guidelines.md` and `.cursor/figma-context.md`

### 4. Testing Requirements

All components must have:

- ✅ At least one sanity test (renders correctly)
- ✅ Functional tests for interactions (click, hover)
- ✅ Snapshot tests for visual states
- ✅ One expect per snapshot test
- ✅ Tests run in sandbox before committing

📖 **Read more**: `.cursor/rules/component-testing.mdc`

### 5. Error Handling

Use `AppError` consistently across all layers:

- Models throw `DatabaseError`
- Services throw layer-specific errors
- Application orchestrates and maps errors
- Controllers convert to UI responses

📖 **Read more**: `.cursor/error-handling.md`

## Architecture Decision Records (ADRs)

ADRs document key architectural choices. They capture the **why** behind decisions.

**Format**: `docs/adr/NNNN-title-in-kebab-case.md`

**Current ADRs:**

- [0001: Local-First Writes](docs/adr/0001-local-first-writes.md) - Why writes go local-first
- [0002: Composite Post IDs](docs/adr/0002-composite-post-ids.md) - author:postId format
- [0003: Streams as Caches](docs/adr/0003-streams-as-caches.md) - Stream caching strategy
- [0004: Layering and Dependency Rules](docs/adr/0004-layering-and-dependency-rules.md) - Core architecture contracts
- [0005: TTL Refresh Policy](docs/adr/0005-ttl-refresh-policy.md) - Cache expiry management
- [0006: Pipes Normalization](docs/adr/0006-pipes-normalization.md) - Data transformation layer
- [0007: Dexie Version Normalization](docs/adr/0007-dexie-version-normalization.md) - Database versioning
- [0008: Coordinators Layer](docs/adr/0008-coordinators-layer.md) - System-initiated workflows

**Creating new ADRs**: Use `docs/adr/TEMPLATE.md` as the starting point.

## MCP (Model Context Protocol) Servers

This project uses MCP servers for enhanced AI capabilities:

### Available Servers

1. **Figma MCP** - Extract design specs directly from Figma
2. **Playwright MCP** - Browser automation for UI testing
3. **GitHub MCP** - Direct GitHub integration for issues/PRs
4. **Context7 MCP** - Access up-to-date library documentation

### Setup

See `.cursor/mcp-setup.md` for complete configuration instructions including:

- Authentication requirements
- Rate limits
- Environment variables
- Troubleshooting

## IDE-Specific Context

### Cursor

Cursor users benefit from automatic context loading via:

- `.cursor/rules/*.mdc` files (automation rules)
- All `.cursor/*.md` files (documentation)
- Configured MCP servers in `.cursor/mcp.json`

### Other AI IDEs (Claude Code, Windsurf, etc.)

For non-Cursor IDEs:

1. Start with this file (AGENTS.md)
2. Read documentation in reading order above
3. Check `.cursor/rules/*.mdc` files for automation patterns
4. Adapt patterns to your IDE's capabilities

## Key Anti-Patterns to Avoid

❌ **Don't bypass the application layer** - Controllers should never call services directly  
❌ **Don't let services/application call controllers** - Violates unidirectional flow  
❌ **Don't let coordinators call application directly** - Must go through controllers  
❌ **Don't perform IO in pipes** - Pipes are for transformation only  
❌ **Don't mock `@/libs` indiscriminately** - Use real implementations unless testing errors  
❌ **Don't create components without checking Shadcn** - Reuse existing primitives  
❌ **Don't skip snapshot tests** - Visual regression matters  
❌ **Don't commit untested code** - Run tests in sandbox first  
❌ **Don't duplicate logic across layers** - Single responsibility per layer  
❌ **Don't return un-normalized data** - Pipes must normalize external shapes

## Common Development Workflows

### Creating a New Component

```bash
# 1. Check if Shadcn has equivalent
# 2. Check Figma for design specs (use Figma MCP)
# 3. Create in appropriate atomic level
# 4. Write unit tests + snapshots
# 5. Verify in Storybook
# 6. Run tests: npm test -- ComponentName.test.tsx
```

### Adding Business Logic

```bash
# 1. Identify layer (application vs controller)
# 2. Define error boundaries
# 3. Add validation in pipes if needed
# 4. Implement in application layer
# 5. Expose via controller
# 6. Update types
```

### Debugging Errors

```bash
# 1. Check error.type (should be AppError)
# 2. Inspect error.details for context
# 3. Trace through layers using core-context.md
# 4. Verify error handling follows error-handling.md
```

## Project-Specific Conventions

### Naming

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `PostCard.tsx`)
- **Tests**: Same name + `.test.tsx` (e.g., `PostCard.test.tsx`)
- **Snapshots**: Auto-generated in `__snapshots__/`
- **ADRs**: `NNNN-title-in-kebab-case.md`

### Imports

- Use `@/` aliases (configured in tsconfig.json)
- Core exports via `@/core`
- Components via `@/components`
- Hooks via `@/hooks`
- Utils via `@/libs`

### Code Organization

```typescript
// Component file structure:
1. Imports (React, external, internal)
2. Types/Interfaces
3. Component definition
4. Export

// Core file structure:
1. Imports
2. Types
3. Constants
4. Helper functions
5. Main logic
6. Export
```

## Quality Standards

### Before Committing

- [ ] All tests pass: `npm test`
- [ ] No linter errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Snapshots updated if needed: `npm test -- -u`
- [ ] Code follows project conventions
- [ ] Documentation updated if needed

### Code Review Checklist

- [ ] Follows layered architecture
- [ ] Error handling uses AppError
- [ ] Components have complete tests
- [ ] No anti-patterns present
- [ ] Types are properly defined
- [ ] No console.logs in production code

## Resources

### Internal Documentation

- [Project README](README.md) - Getting started
- [Environment Setup](docs/environment.md) - Development environment
- [Snapshot Testing Guide](docs/snapshot-testing.md) - Testing philosophy

### External Resources

- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Figma Design System](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - Primitives
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
- [React Testing Library](https://testing-library.com/react) - Testing utilities

## Maintenance

### Updating This Documentation

When you make significant changes to:

- **Architecture** → Update core-context.md + create ADR if decision changes
- **Component patterns** → Update component-guidelines.md
- **Testing standards** → Update component-testing.mdc
- **Error handling** → Update error-handling.md
- **This index** → Update AGENTS.md if structure changes

### Documentation Review Cycle

- **Weekly**: Verify links still valid
- **Monthly**: Check for outdated patterns
- **Per Release**: Update ADRs if architecture evolved
- **When Onboarding**: Get feedback on clarity

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────────┐
│  FRANKY AI DEVELOPMENT QUICK REFERENCE                       │
├──────────────────────────────────────────────────────────────┤
│  Entry Points:  UI (user) + Coordinators (system)            │
│  Architecture:  Both → Controllers → Application → Services  │
│  Write Flow:    Local DB → UI Update → Background Sync       │
│  Components:    Check Shadcn First → Match Figma 100%        │
│  Testing:       Unit + Snapshot + Sandbox Validation         │
│  Errors:        Always use AppError + layer-specific         │
│  Mocking:       Real @/libs, Mock external deps              │
│  Docs:          AGENTS.md → .cursor/*.md → docs/adr/         │
└──────────────────────────────────────────────────────────────┘
```

---

**Remember**: This documentation system maintains consistency and quality. Keep it updated as the project evolves, and use it as your source of truth when generating or reviewing code.

**For AI assistants**: You are encouraged to reference specific sections of this documentation in your responses to users to build trust and ensure consistency.
