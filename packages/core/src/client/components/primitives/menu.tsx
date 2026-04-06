'use client'

import { Check, ChevronRight, Dot } from 'lucide-react'
import React from 'react'
import * as RAC from 'react-aria-components'
import { Popover, type PopoverProps } from './popover'
import { cn } from '@client/utils/cn'

/**
 * MenuTrigger wraps a trigger (usually a Button) and a Menu.
 */
export interface MenuTriggerProps extends RAC.MenuTriggerProps {
  placement?: PopoverProps['placement']
}

export function MenuTrigger(props: MenuTriggerProps) {
  const [trigger, menu] = (
    React.Children.toArray(props.children) as React.ReactElement[]
  ).slice(0, 2)
  return (
    <RAC.MenuTrigger {...props}>
      {trigger as any}
      <Popover placement={props.placement} className="min-w-[140px]">
        {menu as any}
      </Popover>
    </RAC.MenuTrigger>
  )
}

/**
 * SubmenuTrigger for nested menus.
 */
export function SubmenuTrigger(props: RAC.SubmenuTriggerProps) {
  const [trigger, menu] = (
    React.Children.toArray(props.children) as React.ReactElement[]
  ).slice(0, 2)
  return (
    <RAC.SubmenuTrigger {...props}>
      {trigger as any}
      <Popover offset={-4} crossOffset={-4}>
        {menu as any}
      </Popover>
    </RAC.SubmenuTrigger>
  )
}

/**
 * The Menu container.
 */
export function Menu<T extends object>(props: RAC.MenuProps<T>) {
  return (
    <RAC.Menu
      {...props}
      className={RAC.composeRenderProps(props.className, (className) =>
        cn('p-1.5 outline-none max-h-[inherit] overflow-auto', className),
      )}
    />
  )
}

/**
 * MenuItem with support for selection states and submenus.
 */
export function MenuItem(props: RAC.MenuItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === 'string' ? props.children : undefined)

  return (
    <RAC.MenuItem
      {...props}
      textValue={textValue}
      className={RAC.composeRenderProps(
        props.className,
        (className, { isFocused, isPressed, isDisabled }) =>
          cn(
            'group relative flex flex-row items-center gap-2 px-2 py-1 rounded-lg outline-none cursor-default transition-none',
            'text-text-main text-[13px]',
            isFocused && 'bg-bg-surface-elevated text-primary-600 shadow-sm ring-1 ring-border-strong/5',
            isPressed && 'bg-bg-surface-elevated',
            isDisabled && 'opacity-40 grayscale pointer-events-none',
            className,
          ),
      )}
    >
      {RAC.composeRenderProps(
        props.children,
        (children, { selectionMode, isSelected, hasSubmenu }) => (
          <>
            {selectionMode !== 'none' && (
              <span className="flex items-center w-4 h-4 shrink-0 justify-center">
                {isSelected && selectionMode === 'multiple' && (
                  <Check className="w-3.5 h-3.5 stroke-[2.5px] text-primary-500 animate-in zoom-in-50 duration-200" />
                )}
                {isSelected && selectionMode === 'single' && (
                  <Dot className="w-6 h-6 text-primary-500 animate-in zoom-in-50 duration-200" />
                )}
              </span>
            )}
            <div className="flex-1 min-w-0">
              {children}
            </div>
            {hasSubmenu && (
              <ChevronRight className="w-4 h-4 ml-auto text-text-muted group-focused:text-primary-500/70 transition-colors" />
            )}
          </>
        ),
      )}
    </RAC.MenuItem>
  )
}

/**
 * MenuSection for grouping items with an optional header.
 */
export interface MenuSectionProps<T> extends RAC.MenuSectionProps<T> {
  title?: string
}

export function MenuSection<T extends object>({
  title,
  ...props
}: MenuSectionProps<T>) {
  return (
    <RAC.MenuSection
      {...props}
      className={cn('flex flex-col gap-0.5', props.className)}
    >
      {title && (
        <RAC.Header className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.075em] text-text-muted/50 select-none">
          {title}
        </RAC.Header>
      )}
      <RAC.Collection items={props.items}>{props.children}</RAC.Collection>
    </RAC.MenuSection>
  )
}

/**
 * MenuSeparator for visual division.
 */
export function MenuSeparator(props: RAC.SeparatorProps) {
  return (
    <RAC.Separator
      {...props}
      className="mx-2 my-1.5 border-t border-border-subtle/50"
    />
  )
}

// Default export for convenience
export default {
  Root: Menu,
  Item: MenuItem,
  Trigger: MenuTrigger,
  SubTrigger: SubmenuTrigger,
  Section: MenuSection,
  Separator: MenuSeparator,
}
