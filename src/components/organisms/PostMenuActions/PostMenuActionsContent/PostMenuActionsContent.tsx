'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { POST_MENU_VARIANT } from '../PostMenuActions.constants';
import type { PostMenuActionsContentProps } from './PostMenuActionsContent.types';

export function PostMenuActionsContent({
  postId,
  onClose,
  variant = POST_MENU_VARIANT.DROPDOWN,
}: PostMenuActionsContentProps) {
  const { menuItems, isLoading } = Hooks.usePostMenuActions(postId, onClose);

  if (isLoading) {
    return null;
  }

  if (variant === POST_MENU_VARIANT.SHEET) {
    return (
      <Atoms.Container className="flex flex-col gap-1" overrideDefaults>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Atoms.Button
              key={item.id}
              overrideDefaults
              onClick={item.onClick}
              disabled={item.disabled}
              className={Libs.cn(
                'w-full justify-start gap-2 px-0 py-1.5',
                'text-base leading-6 font-medium',
                item.destructive ? 'text-[#EF4444] hover:bg-destructive/10' : 'text-foreground hover:bg-accent',
                item.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <Atoms.Container overrideDefaults className="flex items-center gap-2">
                <Icon className="size-4 shrink-0" />
                <Atoms.Typography
                  as="span"
                  className={Libs.cn(
                    'text-base leading-6 font-medium',
                    item.destructive && 'text-[#EF4444]',
                    !item.destructive && 'text-foreground',
                  )}
                >
                  {item.label}
                </Atoms.Typography>
              </Atoms.Container>
            </Atoms.Button>
          );
        })}
      </Atoms.Container>
    );
  }

  return (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <Atoms.DropdownMenuItem
            key={item.id}
            onClick={item.onClick}
            disabled={item.disabled}
            className={Libs.cn(
              'gap-2',
              'text-base leading-6 font-medium',
              item.destructive && 'text-[#EF4444] focus:text-[#EF4444]',
              !item.destructive && 'text-foreground',
              item.disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className={Libs.cn('text-base leading-6 font-medium', item.destructive && 'text-[#EF4444]')}>
              {item.label}
            </span>
          </Atoms.DropdownMenuItem>
        );
      })}
    </>
  );
}
