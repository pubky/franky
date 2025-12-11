'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useState, useRef, useEffect, createContext, useContext } from 'react';

import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

interface PopoverContextType {
  hover?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const PopoverContext = createContext<PopoverContextType>({});

interface PopoverProps extends React.ComponentProps<typeof PopoverPrimitive.Root> {
  hover?: boolean;
  hoverDelay?: number;
}

function Popover({
  open,
  onOpenChange,
  hover = false,
  hoverDelay = 0,
  children,
  ...props
}: PopoverProps): React.ReactElement {
  const [internalOpen, setInternalOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchDevice = Hooks.useIsTouchDevice();
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const handleOpenChange = isControlled ? onOpenChange : setInternalOpen;

  // Disable hover on touch devices
  const effectiveHover = hover && !isTouchDevice;

  const handleMouseEnter = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (effectiveHover) {
      if (hoverDelay > 0) {
        timeoutRef.current = setTimeout((): void => {
          handleOpenChange?.(true);
        }, hoverDelay);
      } else {
        handleOpenChange?.(true);
      }
    }
  };

  const handleMouseLeave = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (effectiveHover) {
      handleOpenChange?.(false);
      // Remove focus from trigger when closing via hover
      setTimeout((): void => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }, 0);
    }
  };

  useEffect((): (() => void) => {
    return (): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <PopoverContext.Provider
      value={{
        hover: effectiveHover,
        onMouseEnter: effectiveHover ? handleMouseEnter : undefined,
        onMouseLeave: effectiveHover ? handleMouseLeave : undefined,
      }}
    >
      <PopoverPrimitive.Root
        data-slot="popover"
        data-testid="popover"
        open={isOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </PopoverPrimitive.Root>
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({
  asChild,
  onMouseEnter: propOnMouseEnter,
  onMouseLeave: propOnMouseLeave,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>): React.ReactElement {
  const { onMouseEnter: contextOnMouseEnter, onMouseLeave: contextOnMouseLeave, hover } = useContext(PopoverContext);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>): void => {
    contextOnMouseEnter?.();
    propOnMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>): void => {
    contextOnMouseLeave?.();
    propOnMouseLeave?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>): void => {
    // Prevent focus outline when using hover mode
    if (hover) {
      e.currentTarget.blur();
    }
    props.onFocus?.(e);
  };

  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      data-testid="popover-trigger"
      data-as-child={asChild ? 'true' : 'false'}
      asChild={asChild}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      {...props}
    />
  );
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 0,
  onMouseEnter: propOnMouseEnter,
  onMouseLeave: propOnMouseLeave,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>): React.ReactElement {
  const { onMouseEnter: contextOnMouseEnter, onMouseLeave: contextOnMouseLeave } = useContext(PopoverContext);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>): void => {
    contextOnMouseEnter?.();
    propOnMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>): void => {
    contextOnMouseLeave?.();
    propOnMouseLeave?.(e);
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        data-testid="popover-content"
        align={align}
        sideOffset={sideOffset}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={Libs.cn(
          'z-50 mx-8 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-[0px_4px_6px_0px_rgba(5,5,10,0.25)] shadow-[0px_10px_15px_0px_rgba(5,5,10,0.50)] outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:mx-0',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>): React.ReactElement {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
