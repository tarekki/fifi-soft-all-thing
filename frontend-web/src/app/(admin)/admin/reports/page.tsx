'use client'

/**
 * Admin Reports Page
 * صفحة التقارير والإحصائيات
 * 
 * Features:
 * - Sales reports
 * - Revenue analytics
 * - User activity
 * - Export functionality
 */

import { useState } from 'react'
import { motion } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

type DateRange = '7days' | '30days' | '90days' | 'year' | 'custom'
type ReportType = 'sales' | 'revenue' | 'products' | 'users'

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  download: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  money: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  package: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  arrowUp: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
    </svg>
  ),
  arrowDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const summaryData = {
  totalRevenue: { value: 125890, change: 12.5 },
  totalOrders: { value: 3456, change: 8.2 },
  avgOrderValue: { value: 36.42, change: 3.1 },
  newUsers: { value: 1234, change: -2.4 },
}

const salesByCategory = [
  { category: 'إلكترونيات', sales: 45000, percentage: 35.7 },
  { category: 'أزياء', sales: 32000, percentage: 25.4 },
  { category: 'منزل وحديقة', sales: 18000, percentage: 14.3 },
  { category: 'رياضة', sales: 15000, percentage: 11.9 },
  { category: 'أخرى', sales: 15890, percentage: 12.6 },
]

const topProducts = [
  { name: 'آيفون 15 برو ماكس', sales: 156, revenue: 186844 },
  { name: 'سامسونج جالاكسي S24', sales: 134, revenue: 147266 },
  { name: 'ماك بوك برو 14', sales: 89, revenue: 177911 },
  { name: 'نايك اير ماكس 90', sales: 234, revenue: 30186 },
  { name: 'سماعات سوني WH-1000XM5', sales: 112, revenue: 39088 },
]

const dailySales = [
  { day: 'السبت', sales: 4500 },
  { day: 'الأحد', sales: 5200 },
  { day: 'الاثنين', sales: 4800 },
  { day: 'الثلاثاء', sales: 6100 },
  { day: 'الأربعاء', sales: 5600 },
  { day: 'الخميس', sales: 7200 },
  { day: 'الجمعة', sales: 8500 },
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
// Main Component
// =============================================================================

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30days')
  const [reportType, setReportType] = useState<ReportType>('sales')

  const maxSales = Math.max(...dailySales.map(d => d.sales))

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
          <h1 className="text-2xl font-bold text-historical-charcoal">التقارير والإحصائيات</h1>
          <p className="text-historical-charcoal/50 mt-1">تحليل أداء المتجر والمبيعات</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-2.5 rounded-xl border border-historical-gold/20 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          >
            <option value="7days">آخر 7 أيام</option>
            <option value="30days">آخر 30 يوم</option>
            <option value="90days">آخر 90 يوم</option>
            <option value="year">سنة كاملة</option>
          </select>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-historical-gold/10 text-historical-gold font-medium hover:bg-historical-gold/20 transition-colors">
            {Icons.download}
            <span>تصدير التقرير</span>
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-historical-gold/10 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-historical-gold/10 text-historical-gold">
              {Icons.money}
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              summaryData.totalRevenue.change >= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {summaryData.totalRevenue.change >= 0 ? Icons.arrowUp : Icons.arrowDown}
              {Math.abs(summaryData.totalRevenue.change)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-historical-charcoal">
            ${summaryData.totalRevenue.value.toLocaleString()}
          </p>
          <p className="text-sm text-historical-charcoal/50 mt-1">إجمالي الإيرادات</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
              {Icons.chart}
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              summaryData.totalOrders.change >= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {summaryData.totalOrders.change >= 0 ? Icons.arrowUp : Icons.arrowDown}
              {Math.abs(summaryData.totalOrders.change)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-historical-charcoal">
            {summaryData.totalOrders.value.toLocaleString()}
          </p>
          <p className="text-sm text-historical-charcoal/50 mt-1">إجمالي الطلبات</p>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-purple-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
              {Icons.package}
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              summaryData.avgOrderValue.change >= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {summaryData.avgOrderValue.change >= 0 ? Icons.arrowUp : Icons.arrowDown}
              {Math.abs(summaryData.avgOrderValue.change)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-historical-charcoal">
            ${summaryData.avgOrderValue.value}
          </p>
          <p className="text-sm text-historical-charcoal/50 mt-1">متوسط قيمة الطلب</p>
        </div>

        {/* New Users */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-green-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
              {Icons.users}
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              summaryData.newUsers.change >= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {summaryData.newUsers.change >= 0 ? Icons.arrowUp : Icons.arrowDown}
              {Math.abs(summaryData.newUsers.change)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-historical-charcoal">
            {summaryData.newUsers.value.toLocaleString()}
          </p>
          <p className="text-sm text-historical-charcoal/50 mt-1">المستخدمين الجدد</p>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 shadow-soft"
        >
          <h3 className="text-lg font-bold text-historical-charcoal mb-6">المبيعات اليومية</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {dailySales.map((data, index) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.sales / maxSales) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full bg-gradient-to-t from-historical-gold to-historical-gold/50 rounded-t-lg relative group cursor-pointer"
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-historical-charcoal text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                      ${data.sales.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
                <span className="text-xs text-historical-charcoal/50">{data.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sales by Category */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 shadow-soft"
        >
          <h3 className="text-lg font-bold text-historical-charcoal mb-6">المبيعات حسب الفئة</h3>
          <div className="space-y-4">
            {salesByCategory.map((cat, index) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-historical-charcoal">{cat.category}</span>
                  <span className="text-sm text-historical-charcoal/50">${cat.sales.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-historical-stone rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-l from-historical-gold to-historical-red rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-historical-gold/10">
          <h3 className="text-lg font-bold text-historical-charcoal">المنتجات الأكثر مبيعاً</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-historical-stone/50">
              <tr>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">#</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">المنتج</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">المبيعات</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">الإيرادات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5">
              {topProducts.map((product, index) => (
                <tr key={product.name} className="hover:bg-historical-gold/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-historical-gold/20 text-historical-gold' : 'bg-historical-stone text-historical-charcoal/50'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-historical-charcoal">{product.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-historical-charcoal/70">{product.sales} وحدة</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-historical-gold">${product.revenue.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

