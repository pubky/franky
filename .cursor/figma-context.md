# Figma Integration Context

## 🎨 Main Figma Project

### Project Details

- **Project Name**: shadcn_ui-PUBKY
- **Main URL**: [https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)
- **Design System**: Based on Shadcn UI with custom modifications
- **Target**: 100% visual parity with Figma designs

## 🔧 MCP Figma Tools Usage

### Available Tools

- `mcp_Figma_Desktop_get_code` - Generate UI code from Figma nodes
- `mcp_Figma_Desktop_get_metadata` - Get component structure and metadata
- `mcp_Figma_Desktop_get_screenshot` - Generate screenshots for comparison
- `mcp_Figma_Desktop_get_variable_defs` - Extract design tokens and variables

### Workflow for Component Extraction

1. **Get Metadata**: Use `get_metadata` to understand component structure
2. **Extract Code**: Use `get_code` to generate initial implementation
3. **Compare Visual**: Use `get_screenshot` to verify visual parity
4. **Extract Tokens**: Use `get_variable_defs` for design system values

## 📋 Component Mapping

### Completed Components

- ✅ **Toggle**: Migrated to Shadcn primitives
- ✅ **Avatar**: Migrated to Shadcn primitives
- ✅ **Input**: Using Shadcn base (in ui/ folder)

### Pending Components

- 🔄 **Button**: Needs Shadcn migration
- 🔄 **Card**: Needs Shadcn migration
- 🔄 **Dialog**: Needs Shadcn migration
- 🔄 **Breadcrumb**: Implemented as molecule

## 🎯 Design System Standards

### Color Tokens

- Use Figma variables for consistent colors
- Extract via `get_variable_defs` when available
- Map to Tailwind CSS classes

### Spacing & Sizing

- Follow Figma's 8px grid system
- Use consistent spacing tokens
- Maintain exact component dimensions

### Typography

- Use Figma text styles
- Map to Tailwind typography classes
- Maintain visual hierarchy

## 🔍 Component Analysis Process

### Before Implementation

1. **Analyze Figma**: Use MCP tools to extract design details
2. **Check Shadcn**: Verify if equivalent component exists
3. **Plan Migration**: Document existing functionality to preserve
4. **Extract Tokens**: Get design system values from Figma

### During Implementation

1. **Install Shadcn**: Use official component as base
2. **Adapt Structure**: Move to project's atomic design structure
3. **Maintain Parity**: Ensure 100% visual match with Figma
4. **Preserve Functionality**: Keep existing props and behaviors

### After Implementation

1. **Visual Comparison**: Use screenshots to verify parity
2. **Test Coverage**: Ensure all variants and states work
3. **Documentation**: Update component examples and docs
4. **Integration**: Verify compatibility with existing code

## 🚨 Common Figma Integration Issues

### Node ID Extraction

- Extract from Figma URLs: `node-id=1-2` → `1:2`
- Use correct format for MCP tools
- Handle different node types appropriately

### Design Token Mapping

- Map Figma variables to Tailwind classes
- Maintain consistency across components
- Document custom tokens when needed

### Visual Parity Verification

- Use screenshots for comparison
- Test all component states and variants
- Verify responsive behavior matches design

## 📚 Resources

### Figma Project Links

- [Main Project](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)
- [Component Library](https://www.figma.com/design/01ZvjSPZnKTNmaEWz0yJsq/shadcn_ui-PUBKY)

### Design System References

- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Note**: Always prioritize Shadcn primitives and maintain 100% visual parity with Figma designs. Use MCP Figma tools to extract accurate design specifications and verify implementation quality.
