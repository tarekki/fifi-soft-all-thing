'use client'

/**
 * Admin Dashboard Page
 * صفحة لوحة التحكم الرئيسية
 * 
 * Overview dashboard with:
 * - KPI cards (Sales, Orders, Users, Revenue)
 * - Sales trend chart
 * - Recent orders table
 * - Recent activity log
 * 
 * لوحة تحكم شاملة مع:
 * - بطاقات المؤشرات الرئيسية (المبيعات، الطلبات، المستخدمين، الإيرادات)
 * - رسم بياني لاتجاهات المبيعات
 * - جدول آخر الطلبات
 * - سجل النشاط الأخير
 */

import { motion } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface KPICard {
  id: string
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ReactNode
  color: 'gold' | 'blue' | 'green' | 'red'
}

interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  total: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
}

interface Activity {
  id: string
  type: 'order' | 'user' | 'vendor' | 'product'
  message: string
  time: string
}

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  revenue: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  orders: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  vendors: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
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
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

// =============================================================================
// Mock Data (TODO: Replace with real API data)
// =============================================================================

const kpiCards: KPICard[] = [
  {
    id: 'revenue',
    title: 'إجمالي الإيرادات',
    value: '$45,678',
    change: 12.5,
    changeLabel: 'من الشهر الماضي',
    icon: Icons.revenue,
    color: 'gold',
  },
  {
    id: 'orders',
    title: 'الطلبات الجديدة',
    value: '1,234',
    change: 8.2,
    changeLabel: 'من الأسبوع الماضي',
    icon: Icons.orders,
    color: 'blue',
  },
  {
    id: 'users',
    title: 'المستخدمين الجدد',
    value: '456',
    change: -3.1,
    changeLabel: 'من الأسبوع الماضي',
    icon: Icons.users,
    color: 'green',
  },
  {
    id: 'vendors',
    title: 'البائعين النشطين',
    value: '89',
    change: 5.4,
    changeLabel: 'من الشهر الماضي',
    icon: Icons.vendors,
    color: 'red',
  },
]

const recentOrders: RecentOrder[] = [
  { id: '1', orderNumber: '#ORD-1234', customer: 'أحمد محمد', total: '$125.00', status: 'pending', date: 'اليوم، 10:30 ص' },
  { id: '2', orderNumber: '#ORD-1233', customer: 'سارة علي', total: '$89.50', status: 'processing', date: 'اليوم، 09:15 ص' },
  { id: '3', orderNumber: '#ORD-1232', customer: 'محمد خالد', total: '$234.00', status: 'shipped', date: 'أمس، 04:20 م' },
  { id: '4', orderNumber: '#ORD-1231', customer: 'فاطمة أحمد', total: '$67.00', status: 'delivered', date: 'أمس، 02:10 م' },
  { id: '5', orderNumber: '#ORD-1230', customer: 'علي حسن', total: '$156.00', status: 'cancelled', date: '22 ديسمبر' },
]

const recentActivities: Activity[] = [
  { id: '1', type: 'order', message: 'طلب جديد #ORD-1234 من أحمد محمد', time: 'منذ 5 دقائق' },
  { id: '2', type: 'vendor', message: 'تم الموافقة على البائع "متجر الأناقة"', time: 'منذ 15 دقيقة' },
  { id: '3', type: 'user', message: 'تسجيل مستخدم جديد: سارة علي', time: 'منذ 30 دقيقة' },
  { id: '4', type: 'product', message: 'تم إضافة 12 منتج جديد من "متجر الموضة"', time: 'منذ ساعة' },
  { id: '5', type: 'order', message: 'تم تسليم الطلب #ORD-1200 بنجاح', time: 'منذ ساعتين' },
]

const salesData = [
  { day: 'السبت', value: 4500 },
  { day: 'الأحد', value: 5200 },
  { day: 'الاثنين', value: 4800 },
  { day: 'الثلاثاء', value: 6100 },
  { day: 'الأربعاء', value: 5600 },
  { day: 'الخميس', value: 7200 },
  { day: 'الجمعة', value: 8500 },
]

// =============================================================================
// Helper Functions
// =============================================================================

const getStatusStyle = (status: RecentOrder['status']) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return styles[status]
}

const getStatusLabel = (status: RecentOrder['status']) => {
  const labels = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  }
  return labels[status]
}

const getKPIColorClasses = (color: KPICard['color']) => {
  const colors = {
    gold: {
      bg: 'bg-gradient-to-br from-historical-gold/20 to-historical-gold/5',
      icon: 'bg-historical-gold/20 text-historical-gold',
      border: 'border-historical-gold/20',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5',
      icon: 'bg-blue-500/20 text-blue-600',
      border: 'border-blue-500/10',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500/10 to-green-500/5',
      icon: 'bg-green-500/20 text-green-600',
      border: 'border-green-500/10',
    },
    red: {
      bg: 'bg-gradient-to-br from-historical-red/10 to-historical-red/5',
      icon: 'bg-historical-red/20 text-historical-red',
      border: 'border-historical-red/10',
    },
  }
  return colors[color]
}

const getActivityIcon = (type: Activity['type']) => {
  const icons = {
    order: (
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
        {Icons.orders}
      </div>
    ),
    user: (
      <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
        {Icons.users}
      </div>
    ),
    vendor: (
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
        {Icons.vendors}
      </div>
    ),
    product: (
      <div className="w-8 h-8 rounded-lg bg-historical-gold/10 text-historical-gold flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
    ),
  }
  return icons[type]
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// =============================================================================
// Sub-Components
// =============================================================================

function KPICardComponent({ card }: { card: KPICard }) {
  const colors = getKPIColorClasses(card.color)
  const isPositive = card.change >= 0

  return (
    <motion.div
      variants={itemVariants}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-white/80 backdrop-blur-sm border ${colors.border}
        shadow-soft hover:shadow-soft-lg transition-shadow duration-300
      `}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${colors.bg} opacity-50`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.icon}`}>
            {card.icon}
          </div>
          <div className={`
            flex items-center gap-1 text-sm font-medium
            ${isPositive ? 'text-green-600' : 'text-red-500'}
          `}>
            {isPositive ? Icons.arrowUp : Icons.arrowDown}
            <span>{Math.abs(card.change)}%</span>
          </div>
        </div>

        {/* Value */}
        <p className="text-3xl font-bold text-historical-charcoal mb-1">
          {card.value}
        </p>

        {/* Title & Change Label */}
        <p className="text-sm text-historical-charcoal/60">{card.title}</p>
        <p className="text-xs text-historical-charcoal/40 mt-1">{card.changeLabel}</p>
      </div>
    </motion.div>
  )
}

function SalesChart() {
  const maxValue = Math.max(...salesData.map(d => d.value))

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 shadow-soft"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-historical-charcoal">اتجاه المبيعات</h3>
          <p className="text-sm text-historical-charcoal/50">آخر 7 أيام</p>
        </div>
        <select className="text-sm bg-historical-stone/50 border border-historical-gold/10 rounded-lg px-3 py-2 text-historical-charcoal">
          <option>أسبوعي</option>
          <option>شهري</option>
          <option>سنوي</option>
        </select>
      </div>

      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-48">
        {salesData.map((data, index) => (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(data.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full bg-gradient-to-t from-historical-gold to-historical-gold/50 rounded-t-lg relative group"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-historical-charcoal text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                  ${data.value.toLocaleString()}
                </div>
              </div>
            </motion.div>
            <span className="text-xs text-historical-charcoal/50">{data.day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function RecentOrdersTable() {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-historical-gold/10">
        <div>
          <h3 className="text-lg font-bold text-historical-charcoal">آخر الطلبات</h3>
          <p className="text-sm text-historical-charcoal/50">آخر 5 طلبات</p>
        </div>
        <button className="text-sm text-historical-gold hover:text-historical-red transition-colors font-medium">
          عرض الكل
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-historical-stone/50">
            <tr>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">رقم الطلب</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">العميل</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">المبلغ</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">الحالة</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">التاريخ</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-historical-gold/5">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-historical-gold/5 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-historical-charcoal">{order.orderNumber}</span>
                </td>
                <td className="px-6 py-4 text-sm text-historical-charcoal/70">{order.customer}</td>
                <td className="px-6 py-4 text-sm font-medium text-historical-charcoal">{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-historical-charcoal/50">{order.date}</td>
                <td className="px-6 py-4">
                  <button className="p-2 rounded-lg text-historical-charcoal/40 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors">
                    {Icons.eye}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function RecentActivityList() {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 shadow-soft h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-historical-charcoal">النشاط الأخير</h3>
          <p className="text-sm text-historical-charcoal/50">آخر التحديثات</p>
        </div>
      </div>

      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            {getActivityIcon(activity.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-historical-charcoal">{activity.message}</p>
              <p className="text-xs text-historical-charcoal/40 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 text-center text-sm text-historical-gold hover:text-historical-red transition-colors font-medium">
        عرض كل النشاط
      </button>
    </motion.div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function AdminDashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-historical-charcoal">لوحة التحكم</h1>
        <p className="text-historical-charcoal/50 mt-1">مرحباً بك في لوحة التحكم، هذه نظرة عامة على نشاط الموقع</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <KPICardComponent key={card.id} card={card} />
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <RecentActivityList />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable />
    </motion.div>
  )
}

