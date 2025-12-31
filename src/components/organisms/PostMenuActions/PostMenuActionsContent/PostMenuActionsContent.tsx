'use client';

import * as Atoms from '@/atoms';
import { MENU_VARIANT } from '@/config/ui';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import type { PostMenuActionsContentProps } from './PostMenuActionsContent.types';

export function PostMenuActionsContent({ postId, variant, onActionComplete }: PostMenuActionsContentProps) {
  const { menuItems, isLoading } = Hooks.usePostMenuActions(postId);

  if (isLoading) {
    return (
      <Atoms.Container overrideDefaults className="flex flex-col gap-2.5 p-4">
        <Atoms.Typography as="span" overrideDefaults className="text-muted-foreground">
          Loading...
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  const handleItemClick = async (item: (typeof menuItems)[0]) => {
    await item.onClick();
    onActionComplete?.();
  };

  return (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const color = item.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground';

        return variant === MENU_VARIANT.SHEET ? (
          <Atoms.Button
            key={item.id}
            variant="ghost"
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className="justify-start"
          >
            <Atoms.Container overrideDefaults className="flex items-center gap-2">
              <Icon className={Libs.cn('size-4', color)} />
              <Atoms.Typography as="span" overrideDefaults className={Libs.cn('text-base font-medium', color)}>
                {item.label}
              </Atoms.Typography>
            </Atoms.Container>
          </Atoms.Button>
        ) : (
          <Atoms.DropdownMenuItem
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className="group p-0"
          >
            <Atoms.Container overrideDefaults className="flex items-center gap-2 p-0">
              <Icon className={Libs.cn('size-4 transition-colors', color, 'group-hover:text-foreground')} />
              <Atoms.Typography
                as="span"
                overrideDefaults
                className={Libs.cn('text-base font-medium transition-colors', color, 'group-hover:text-foreground')}
              >
                {item.label}
              </Atoms.Typography>
            </Atoms.Container>
          </Atoms.DropdownMenuItem>
        );
      })}
    </>
  );
}
