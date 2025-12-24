'use client'

/**
 * Admin Products Management Page
 * صفحة إدارة المنتجات
 * 
 * Features:
 * - Product list with table view
 * - Filters (category, vendor, status)
 * - Search
 * - Bulk actions
 * - Quick edit
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface Product {
  id: string
  name: string
  nameAr: string
  sku: string
  image: string
  category: string
  vendor: string
  price: number
  comparePrice: number | null
  stock: number
  status: 'active' | 'draft' | 'out_of_stock'
  isFeatured: boolean
  createdAt: string
}

type SortField = 'name' | 'price' | 'stock' | 'createdAt'
type SortDirection = 'asc' | 'desc'

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  add: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  filter: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  delete: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chevronUp: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  grid: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  list: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  moreVertical: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    nameAr: 'آيفون 15 برو ماكس',
    sku: 'IPH-15-PM-256',
    image: 'https://via.placeholder.com/80',
    category: 'هواتف',
    vendor: 'متجر التقنية',
    price: 1199,
    comparePrice: 1299,
    stock: 25,
    status: 'active',
    isFeatured: true,
    createdAt: '2024-12-20',
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    nameAr: 'سامسونج جالاكسي S24 الترا',
    sku: 'SAM-S24-U-256',
    image: 'https://via.placeholder.com/80',
    category: 'هواتف',
    vendor: 'متجر التقنية',
    price: 1099,
    comparePrice: null,
    stock: 18,
    status: 'active',
    isFeatured: false,
    createdAt: '2024-12-19',
  },
  {
    id: '3',
    name: 'MacBook Pro 14"',
    nameAr: 'ماك بوك برو 14 بوصة',
    sku: 'MAC-PRO-14-M3',
    image: 'https://via.placeholder.com/80',
    category: 'لابتوبات',
    vendor: 'متجر التقنية',
    price: 1999,
    comparePrice: 2199,
    stock: 8,
    status: 'active',
    isFeatured: true,
    createdAt: '2024-12-18',
  },
  {
    id: '4',
    name: 'Nike Air Max 90',
    nameAr: 'نايك اير ماكس 90',
    sku: 'NIK-AM90-BLK',
    image: 'https://via.placeholder.com/80',
    category: 'أحذية',
    vendor: 'متجر الرياضة',
    price: 129,
    comparePrice: 159,
    stock: 45,
    status: 'active',
    isFeatured: false,
    createdAt: '2024-12-17',
  },
  {
    id: '5',
    name: 'Sony WH-1000XM5',
    nameAr: 'سوني WH-1000XM5',
    sku: 'SON-WH1000-XM5',
    image: 'https://via.placeholder.com/80',
    category: 'إكسسوارات',
    vendor: 'متجر التقنية',
    price: 349,
    comparePrice: 399,
    stock: 0,
    status: 'out_of_stock',
    isFeatured: false,
    createdAt: '2024-12-16',
  },
  {
    id: '6',
    name: 'Elegant Dress',
    nameAr: 'فستان أنيق',
    sku: 'DRS-ELG-001',
    image: 'https://via.placeholder.com/80',
    category: 'نسائي',
    vendor: 'متجر الأناقة',
    price: 89,
    comparePrice: null,
    stock: 12,
    status: 'draft',
    isFeatured: false,
    createdAt: '2024-12-15',
  },
]

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

// =============================================================================
// Helper Functions
// =============================================================================

const getStatusStyle = (status: Product['status']) => {
  const styles = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-700',
    out_of_stock: 'bg-red-100 text-red-700',
  }
  return styles[status]
}

const getStatusLabel = (status: Product['status']) => {
  const labels = {
    active: 'نشط',
    draft: 'مسودة',
    out_of_stock: 'نفذ المخزون',
  }
  return labels[status]
}

// =============================================================================
// Main Component
// =============================================================================

export default function ProductsPage() {
  const [products] = useState(mockProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const itemsPerPage = 10
  const totalPages = Math.ceil(products.length / itemsPerPage)

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }, [selectedProducts.length, products])

  const handleSelectProduct = useCallback((id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }, [])

  // Filter and sort products
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameAr.includes(searchQuery) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !filterCategory || p.category === filterCategory
      const matchesStatus = !filterStatus || p.status === filterStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1
      if (sortField === 'name') return a.name.localeCompare(b.name) * modifier
      if (sortField === 'price') return (a.price - b.price) * modifier
      if (sortField === 'stock') return (a.stock - b.stock) * modifier
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() * modifier
    })

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="mr-1 text-historical-charcoal/30">
      {sortField === field ? (
        sortDirection === 'asc' ? Icons.chevronUp : Icons.chevronDown
      ) : (
        <span className="opacity-0 group-hover:opacity-50">{Icons.chevronDown}</span>
      )}
    </span>
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-historical-charcoal">إدارة المنتجات</h1>
          <p className="text-historical-charcoal/50 mt-1">عرض وإدارة جميع المنتجات</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow">
          {Icons.add}
          <span>إضافة منتج</span>
        </button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو SKU..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">كل الفئات</option>
          <option value="هواتف">هواتف</option>
          <option value="لابتوبات">لابتوبات</option>
          <option value="إكسسوارات">إكسسوارات</option>
          <option value="أحذية">أحذية</option>
          <option value="نسائي">نسائي</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="draft">مسودة</option>
          <option value="out_of_stock">نفذ المخزون</option>
        </select>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-historical-gold/20 p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-historical-gold/20 text-historical-gold' : 'text-historical-charcoal/50'}`}
          >
            {Icons.list}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-historical-gold/20 text-historical-gold' : 'text-historical-charcoal/50'}`}
          >
            {Icons.grid}
          </button>
        </div>
      </motion.div>

      {/* Bulk Actions (when items selected) */}
      <AnimatePresence>
        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-historical-gold/10 border border-historical-gold/20"
          >
            <span className="text-sm font-medium text-historical-charcoal">
              تم تحديد {selectedProducts.length} منتج
            </span>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors">
                تفعيل
              </button>
              <button className="px-4 py-2 rounded-lg bg-gray-500/10 text-gray-600 text-sm font-medium hover:bg-gray-500/20 transition-colors">
                إلغاء التفعيل
              </button>
              <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-500/20 transition-colors">
                حذف
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-historical-stone/50">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                  />
                </th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">المنتج</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">SKU</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الفئة</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">البائع</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">
                  <button onClick={() => handleSort('price')} className="flex items-center group">
                    السعر
                    <SortIcon field="price" />
                  </button>
                </th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">
                  <button onClick={() => handleSort('stock')} className="flex items-center group">
                    المخزون
                    <SortIcon field="stock" />
                  </button>
                </th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الحالة</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5">
              {paginatedProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-historical-gold/5 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-historical-stone overflow-hidden flex-shrink-0">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-historical-charcoal truncate">{product.nameAr}</p>
                        <p className="text-xs text-historical-charcoal/50 truncate">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-historical-charcoal/70 font-mono">{product.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-historical-charcoal/70">{product.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-historical-charcoal/70">{product.vendor}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-historical-charcoal">${product.price}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-historical-charcoal/40 line-through mr-2">
                          ${product.comparePrice}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-yellow-600' : 'text-historical-charcoal'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors" title="عرض">
                        {Icons.eye}
                      </button>
                      <button className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors" title="تعديل">
                        {Icons.edit}
                      </button>
                      <button className="p-2 rounded-lg text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50 transition-colors" title="حذف">
                        {Icons.delete}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-historical-gold/10 bg-historical-stone/30">
          <p className="text-sm text-historical-charcoal/50">
            عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} من {filteredProducts.length} منتج
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {Icons.chevronRight}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-historical-gold text-white'
                    : 'text-historical-charcoal/50 hover:bg-historical-gold/10'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {Icons.chevronLeft}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

