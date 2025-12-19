# Z-Index Conventions

This document defines the z-index layering system used throughout the Franky application to prevent stacking conflicts and ensure consistent behavior.

## Z-Index Scale

| Value | Purpose | Examples |
|-------|---------|----------|
| `-z-10` | Background elements | `ImageBackground` - fixed background images |
| `z-10` | Sticky/relative overlays | `ProgressSteps`, `ButtonFilters`, word slot badges |
| `z-30` | Floating buttons (scrolled state) | `NewPostsButton` when scrolled |
| `z-40` | Fixed navigation & FAB | `NewPostCTA`, `MobileFooter`, `Dialog` overlay |
| `z-50` | Modals, dialogs, popovers | `DialogContent`, `Sheet`, `Popover`, `SideDrawer`, dropdowns |
| `z-60` | Modal controls | Close buttons inside media lightboxes |

## Layer Hierarchy

```
z-60  ─────────────  Modal controls (close buttons on lightboxes)
z-50  ─────────────  Modals, dialogs, sheets, popovers
z-40  ─────────────  FAB, mobile footer, dialog overlays
z-30  ─────────────  Floating UI elements (scrolled state)
z-10  ─────────────  Sticky headers, relative overlays
z-0   ─────────────  Normal document flow
-z-10 ─────────────  Background images
```

## Guidelines

### When to use each level

- **`-z-10`**: Only for decorative background elements that should never intercept clicks
- **`z-10`**: Sticky elements within the normal page flow (filter bars, progress indicators)
- **`z-30`**: Elements that float above content but below fixed navigation
- **`z-40`**: Fixed navigation elements that should always be accessible (FAB, footer nav)
- **`z-50`**: Modal content that requires user interaction before proceeding
- **`z-60`**: Controls within modals that need to be above modal content

### Rules

1. **Dialogs and modals**: Always use `z-50` for the content, `z-40` for the overlay backdrop
2. **FAB buttons**: Use `z-40` to sit above content but below modals
3. **Fixed navigation**: Use `z-40` to match FAB level
4. **Popovers/dropdowns**: Use `z-50` to appear above fixed elements when open
5. **Nested overlays**: If nesting modals (rare), increment by 10 per level

### Adding new z-index values

Before adding a new z-index:
1. Check if an existing level fits your use case
2. If creating a new level, use increments of 10
3. Document the new level in this file
4. Consider impact on existing components at that level

## Component Reference

### Background (`-z-10`)
- `ImageBackground` - Fixed background images

### Sticky/Relative (`z-10`)
- `ProgressSteps` - Sticky progress indicator
- `ButtonFilters` - Fixed filter buttons
- `WordSlot` badges - Position indicators
- `ProfilePageEmptyState` - Relative z-index for layered content

### Floating (`z-30`)
- `NewPostsButton` - "New posts available" button (when scrolled)

### Fixed Navigation (`z-40`)
- `NewPostCTA` - Floating action button for new posts
- `MobileFooter` - Bottom navigation bar
- `DialogOverlay` - Modal backdrop overlay

### Modals (`z-50`)
- `Dialog` / `DialogContent` - Modal dialogs
- `Sheet` / `SheetContent` - Side sheets
- `SideDrawer` - Navigation drawer
- `Popover` / `PopoverContent` - Contextual popovers
- `SearchInput` dropdown - Search suggestions
- `TagInput` dropdown - Tag suggestions
- `Language` dropdown - Language selector

### Modal Controls (`z-60`)
- `PostAttachmentsImagesAndVideos` - Close button on image/video lightbox

