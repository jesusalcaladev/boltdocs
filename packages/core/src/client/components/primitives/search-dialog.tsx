import * as RAC from 'react-aria-components'
import { Search, Hash, FileText, CornerDownLeft } from 'lucide-react'
import { cn } from '@client/utils/cn'
import type { ComponentBase } from './types'

export interface SearchDialogProps extends ComponentBase {
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export interface SearchDialogItemProps
  extends Omit<RAC.ListBoxItemProps, 'children'> {
  className?: string
  children: React.ReactNode
}

export interface SearchDialogItemIconProps {
  isHeading?: boolean
  className?: string
}

export const SearchDialogRoot = ({
  children,
  isOpen,
  onOpenChange,
  className,
}: SearchDialogProps) => {
  return (
    <RAC.ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={cn(
        'fixed inset-0 z-100 bg-black/40 backdrop-blur-sm px-4 py-4 sm:py-20',
        'entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out',
      )}
    >
      <RAC.Modal
        className={cn(
          'mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-2xl ring-1 ring-black/5 outline-none',
          'entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95',
          className,
        )}
      >
        <RAC.Dialog className="flex flex-col max-h-[70vh] focus:outline-none">
          {children as any}
        </RAC.Dialog>
      </RAC.Modal>
    </RAC.ModalOverlay>
  )
}

export const SearchDialogAutocomplete = ({
  children,
  className,
  ...props
}: RAC.AutocompleteProps<object> & { className?: string }) => {
  return (
    <div className={className}>
      <RAC.Autocomplete {...props} className="flex flex-col min-h-0">
        {children}
      </RAC.Autocomplete>
    </div>
  )
}

export const SearchDialogInput = ({
  className,
  ...props
}: RAC.InputProps & { className?: string }) => {
  return (
    <RAC.SearchField
      className="flex items-center gap-3 border-b border-border-subtle px-4 py-4"
      autoFocus
    >
      <Search className="h-5 w-5 text-text-muted" />
      <RAC.Input
        {...props}
        className={cn(
          'w-full bg-transparent text-lg text-text-main placeholder-text-muted outline-none',
          className,
        )}
        placeholder="Search documentation..."
      />
      <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-main px-1.5 py-1 text-[10px] font-medium text-text-muted">
        <kbd className="font-sans">ESC</kbd>
      </div>
    </RAC.SearchField>
  )
}

export const SearchDialogList = ({
  children,
  className,
  ...props
}: RAC.ListBoxProps<object> & { className?: string }) => {
  return (
    <RAC.ListBox
      {...props}
      className={cn('flex-1 overflow-y-auto p-2 outline-none', className)}
    >
      {children as any}
    </RAC.ListBox>
  )
}

export const SearchDialogItemRoot = ({
  children,
  className,
  ...props
}: SearchDialogItemProps) => {
  return (
    <RAC.ListBoxItem
      {...props}
      className={cn(
        'group flex items-center gap-3 rounded-lg p-3 text-left outline-none cursor-pointer transition-colors',
        'text-text-muted hover:bg-bg-main hover:text-text-main focus:bg-primary-500 focus:text-white selected:bg-primary-500 selected:text-white',
        className,
      )}
    >
      {(itemProps) => (
        <>
          {children}
          {(itemProps.isFocused || itemProps.isSelected) && (
            <div className="ml-auto opacity-50 flex items-center gap-1">
              <span className="text-[10px]">Select</span>
              <CornerDownLeft size={10} />
            </div>
          )}
        </>
      )}
    </RAC.ListBoxItem>
  )
}

export const SearchDialogItemIcon = ({
  isHeading,
  className,
}: SearchDialogItemIconProps) => {
  return (
    <div className={cn('shrink-0', className)}>
      {isHeading ? <Hash size={18} /> : <FileText size={18} />}
    </div>
  )
}

export const SearchDialogItemTitle = ({
  children,
  className,
}: ComponentBase) => {
  return (
    <span
      className={cn('block font-medium truncate flex-1 text-sm', className)}
    >
      {children}
    </span>
  )
}

export const SearchDialogItemBio = ({ children, className }: ComponentBase) => {
  return (
    <span
      className={cn(
        'ml-2 text-xs opacity-70 truncate hidden sm:inline group-focus:opacity-100',
        className,
      )}
    >
      {children}
    </span>
  )
}

export default {
  Root: SearchDialogRoot,
  Autocomplete: SearchDialogAutocomplete,
  Input: SearchDialogInput,
  List: SearchDialogList,
  Item: Object.assign(SearchDialogItemRoot, {
    Icon: SearchDialogItemIcon,
    Title: SearchDialogItemTitle,
    Bio: SearchDialogItemBio,
  }),
}
