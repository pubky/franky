import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

export type DropdownMenuProps = React.ComponentProps<typeof DropdownMenuPrimitive.Root>;
export type DropdownMenuTriggerProps = React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>;
export type DropdownMenuContentProps = React.ComponentProps<typeof DropdownMenuPrimitive.Content>;
export type DropdownMenuItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
};
export type DropdownMenuSeparatorProps = React.ComponentProps<typeof DropdownMenuPrimitive.Separator>;
