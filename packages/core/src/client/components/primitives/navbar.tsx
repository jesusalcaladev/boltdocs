import { type ReactNode, useState, useEffect } from 'react'
import {
  Button,
  Separator,
  ToggleButton,
  Link,
  Menu,
  MenuItem,
  MenuTrigger,
  cn,
} from './index'
import { Button as ButtonRAC } from 'react-aria-components'
import { Search, Sun, Moon, ExternalLink, ChevronDown } from 'lucide-react'
import * as IconsSocials from '@components/icons-dev'
import type { ComponentBase } from './types'
import type { BoltdocsSocialLink } from '@node/config'

export interface NavbarLinkProps extends Omit<ComponentBase, 'children'> {
  label: ReactNode
  href: string
  active?: boolean
  to?: 'internal' | 'external'
}

export interface NavbarLogoProps extends Omit<ComponentBase, 'children'> {
  src: string
  alt: string
  width?: number
  height?: number
}

export interface NavbarSearchTriggerProps extends ComponentBase {
  onPress: () => void
}

export interface NavbarThemeProps {
  className?: string
  theme: 'dark' | 'light'
  onThemeChange: (isSelected: boolean) => void
}

export interface NavbarMenuProps extends ComponentBase {
  label: ReactNode
  icon?: ReactNode
}

export interface NavbarVersionProps extends ComponentBase {
  current: string
}

export interface NavbarItemProps extends Omit<ComponentBase, 'children'> {
  label: string
  onPress?: () => void
  isCurrent?: boolean
}

export interface NavbarSocialsProps extends ComponentBase {
  icon: string
  link: string
}

export const NavbarRoot = ({
  children,
  className,
  ...props
}: ComponentBase) => {
  return (
    <header
      className={cn(
        'boltdocs-navbar sticky top-0 z-50 w-full border-b border-border-subtle bg-bg-main/80 backdrop-blur-md',
        className,
      )}
      {...props}
    >
      {children}
    </header>
  )
}

export const NavbarContent = ({ children, className }: ComponentBase) => {
  return (
    <div
      className={cn(
        'mx-auto flex lg:h-navbar max-w-(--breakpoint-3xl) items-center justify-between px-4 md:px-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const NavbarLeft = ({ children, className }: ComponentBase) => {
  return (
    <div className={cn('flex items-center gap-4', className)}>{children}</div>
  )
}

export const NavbarRight = ({ children, className }: ComponentBase) => {
  return (
    <div className={cn('flex items-center gap-2 md:gap-4', className)}>
      {children}
    </div>
  )
}

export const NavbarCenter = ({ children, className }: ComponentBase) => {
  return (
    <div
      className={cn(
        'hidden lg:flex flex-1 justify-center items-center gap-4 px-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const NavbarLogo = ({
  src,
  alt,
  width = 24,
  height = 24,
  className,
}: NavbarLogoProps) => {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2 shrink-0 outline-none', className)}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-6 w-6 object-contain"
        />
      ) : null}
    </Link>
  )
}

export const NavbarTitle = ({ children, className }: ComponentBase) => {
  return (
    <span
      className={cn(
        'text-lg font-bold tracking-tight hidden sm:inline-block',
        className,
      )}
    >
      {children}
    </span>
  )
}

export const NavbarLinks = ({ children, className }: ComponentBase) => {
  return (
    <nav
      className={cn(
        'hidden md:flex items-center gap-6 text-sm font-medium',
        className,
      )}
    >
      {children}
    </nav>
  )
}

export const NavbarLink = ({
  label,
  href,
  active,
  to,
  className,
}: NavbarLinkProps) => {
  return (
    <Link
      href={href}
      target={to === 'external' ? '_blank' : undefined}
      className={cn(
        'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 rounded-sm',
        {
          'text-primary-500 font-bold': active,
          'text-text-muted hover:text-text-main font-medium': !active,
        },
        className,
      )}
    >
      {label as any}
      {to === 'external' && (
        <span className="ml-1 inline-block">
          <ExternalLink size={12} />
        </span>
      )}
    </Link>
  )
}

export const NavbarSearchTrigger = ({
  className,
  onPress,
}: NavbarSearchTriggerProps) => {
  const [mounted, setMounted] = useState(false)
  const isMac = mounted && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ButtonRAC
      onPress={onPress}
      className={cn(
        'flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-muted outline-none cursor-pointer',
        'transition-all duration-200 hover:border-border-strong hover:text-text-main hover:bg-bg-muted hover:shadow-sm active:scale-[0.98]',
        'focus-visible:ring-2 focus-visible:ring-primary-500/30',
        'w-full max-w-[320px] justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Search size={16} />
        <span className="hidden sm:inline-block">Search docs...</span>
      </div>
      <div className="hidden sm:flex items-center gap-1 pointer-events-none select-none">
        <kbd className="flex h-5 items-center justify-center rounded border border-border-subtle bg-bg-main px-1.5 font-mono text-[10px] font-medium">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="flex h-5 w-5 items-center justify-center rounded border border-border-subtle bg-bg-main font-mono text-[10px] font-medium">
          K
        </kbd>
      </div>
    </ButtonRAC>
  )
}

export const NavbarTheme = ({
  className,
  theme,
  onThemeChange,
}: NavbarThemeProps) => {
  return (
    <ToggleButton
      isSelected={theme === 'dark'}
      onChange={onThemeChange}
      className={cn(
        'rounded-md p-2 text-text-muted outline-none cursor-pointer',
        'transition-all duration-300 hover:bg-bg-surface hover:text-text-main hover:rotate-12 active:scale-90',
        'focus-visible:ring-2 focus-visible:ring-primary-500/30',
        className,
      )}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </ToggleButton>
  )
}

export const NavbarMenu = ({
  label,
  children,
  className,
  icon,
}: NavbarMenuProps) => {
  return (
    <MenuTrigger placement="bottom end">
      <Button
        variant="ghost"
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-text-muted outline-none cursor-pointer transition-colors',
          'hover:bg-bg-surface hover:text-text-main',
          'focus-visible:ring-2 focus-visible:ring-primary-500/30',
          className,
        )}
      >
        {icon && <span className="flex items-center shrink-0">{icon}</span>}
        <span className="text-[13px] font-bold uppercase tracking-wide">
          {label}
        </span>
        <ChevronDown size={14} className="ml-0.5 opacity-50" />
      </Button>
      <Menu className="min-w-[180px]">{children as any}</Menu>
    </MenuTrigger>
  )
}

export const NavbarItem = ({
  label,
  className,
  onPress,
  isCurrent,
}: NavbarItemProps) => {
  return (
    <MenuItem
      onAction={onPress}
      className={cn(
        isCurrent &&
          'bg-primary-500 text-white font-medium hover:bg-primary-600 focus:bg-primary-600 focus:text-white',
        className,
      )}
    >
      {label}
    </MenuItem>
  )
}

export const Icon = ({ name }: { name: BoltdocsSocialLink['icon'] }) => {
  if (name === 'github') return <IconsSocials.Github />
  if (name === 'discord') return <IconsSocials.Discord />
  if (name === 'x') return <IconsSocials.XSocial />
  if (name === 'bluesky') return <IconsSocials.Bluesky />
}

export const NavbarSocials = ({
  icon,
  link,
  className,
}: NavbarSocialsProps) => {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'rounded-md p-2 text-text-muted outline-none transition-colors',
        'hover:bg-bg-surface hover:text-text-main',
        'focus-visible:ring-2 focus-visible:ring-primary-500/30',
        className,
      )}
    >
      <Icon name={icon} />
    </Link>
  )
}

export const NavbarSplit = ({ className }: ComponentBase) => {
  return (
    <Separator
      orientation="vertical"
      className={cn('h-6 w-px bg-border-subtle mx-1', className)}
    />
  )
}

export default {
  NavbarRoot,
  NavbarLeft,
  NavbarRight,
  NavbarCenter,
  NavbarLogo,
  Title: NavbarTitle,
  Links: NavbarLinks,
  Link: NavbarLink,
  SearchTrigger: NavbarSearchTrigger,
  Theme: NavbarTheme,
  Item: NavbarItem,
  Socials: NavbarSocials,
  Split: NavbarSplit,
  Content: NavbarContent,
}
