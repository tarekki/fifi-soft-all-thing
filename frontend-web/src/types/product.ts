/**
 * Product Types
 * أنواع المنتجات
 */

export type Product = {
  id: number
  name: string
  slug: string
  description: string
  base_price: string
  product_type: 'shoes' | 'bags'
  is_active: boolean
  vendor: {
    id: number
    name: string
    slug: string
  }
  created_at: string
  updated_at: string
}

export type ProductVariant = {
  id: number
  color: string
  color_hex: string
  size: string | null
  model: string | null
  sku: string
  stock_quantity: number
  price_override: string | null
  final_price: string
  is_available: boolean
  image: string | null
}

export type ProductDetail = Product & {
  variants: ProductVariant[]
}

