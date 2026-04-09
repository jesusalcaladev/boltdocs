import { z } from 'zod'

/**
 * Security limits for file system operations.
 */
export const MAX_PATH_LENGTH = 260
export const ALLOWED_PATH_CHARS = /^[a-zA-Z0-9\-_\/\.]+$/

/**
 * Security limits for document metadata (frontmatter).
 */
export const MAX_FRONTMATTER_SIZE = 10 * 1024 // 10KB

/**
 * Schema for strict frontmatter validation.
 */
export const FrontmatterSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  sidebarPosition: z.number().optional(),
  sidebarLabel: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  order: z.number().optional(),
  badge: z.string().max(50).optional(),
  icon: z.string().max(50).optional(),
})

export type FrontmatterData = z.infer<typeof FrontmatterSchema>
