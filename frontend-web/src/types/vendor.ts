/**
 * Vendor Types
 * أنواع البائعين
 */

export type Vendor = {
  id: number
  name: string
  slug: string
  logo: string | null
  description: string
  primary_color: string
  commission_rate: string
  is_active: boolean
  created_at: string
  updated_at: string
}

