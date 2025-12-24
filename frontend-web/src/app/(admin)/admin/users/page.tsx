'use client'

/**
 * Admin Users Management Page
 * صفحة إدارة المستخدمين
 * 
 * Features:
 * - Users list with filters
 * - Role management
 * - Block/Unblock users
 * - User details
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: 'customer' | 'vendor' | 'admin'
  status: 'active' | 'blocked'
  isVerified: boolean
  totalOrders: number
  totalSpent: number
  joinedAt: string
  lastActive: string
}

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  add: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  block: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  unblock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  store: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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
}

// =============================================================================
// Mock Data
// =============================================================================

const mockUsers: User[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@email.com',
    phone: '+963 912 345 678',
    avatar: '',
    role: 'customer',
    status: 'active',
    isVerified: true,
    totalOrders: 15,
    totalSpent: 2450,
    joinedAt: '2024-01-15',
    lastActive: '2024-12-24',
  },
  {
    id: '2',
    name: 'سارة علي',
    email: 'sara@email.com',
    phone: '+963 922 345 678',
    avatar: '',
    role: 'customer',
    status: 'active',
    isVerified: true,
    totalOrders: 8,
    totalSpent: 890,
    joinedAt: '2024-03-20',
    lastActive: '2024-12-23',
  },
  {
    id: '3',
    name: 'محمد خالد',
    email: 'tech@store.com',
    phone: '+963 932 345 678',
    avatar: '',
    role: 'vendor',
    status: 'active',
    isVerified: true,
    totalOrders: 0,
    totalSpent: 0,
    joinedAt: '2024-01-10',
    lastActive: '2024-12-24',
  },
  {
    id: '4',
    name: 'فاطمة أحمد',
    email: 'fatima@email.com',
    phone: '+963 942 345 678',
    avatar: '',
    role: 'customer',
    status: 'blocked',
    isVerified: false,
    totalOrders: 2,
    totalSpent: 150,
    joinedAt: '2024-06-01',
    lastActive: '2024-10-15',
  },
  {
    id: '5',
    name: 'علي حسن',
    email: 'admin@yallabuy.com',
    phone: '+963 952 345 678',
    avatar: '',
    role: 'admin',
    status: 'active',
    isVerified: true,
    totalOrders: 0,
    totalSpent: 0,
    joinedAt: '2024-01-01',
    lastActive: '2024-12-24',
  },
  {
    id: '6',
    name: 'ليلى حسين',
    email: 'layla@email.com',
    phone: '+963 962 345 678',
    avatar: '',
    role: 'customer',
    status: 'active',
    isVerified: true,
    totalOrders: 25,
    totalSpent: 4500,
    joinedAt: '2024-02-10',
    lastActive: '2024-12-22',
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

const getRoleStyle = (role: User['role']) => {
  const styles = {
    customer: 'bg-blue-100 text-blue-700',
    vendor: 'bg-purple-100 text-purple-700',
    admin: 'bg-historical-gold/20 text-historical-gold',
  }
  return styles[role]
}

const getRoleLabel = (role: User['role']) => {
  const labels = {
    customer: 'عميل',
    vendor: 'بائع',
    admin: 'مدير',
  }
  return labels[role]
}

const getRoleIcon = (role: User['role']) => {
  const icons = {
    customer: Icons.user,
    vendor: Icons.store,
    admin: Icons.shield,
  }
  return icons[role]
}

// =============================================================================
// Main Component
// =============================================================================

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10
  const totalPages = Math.ceil(users.length / itemsPerPage)

  const handleToggleBlock = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'blocked' as const : 'active' as const }
        : u
    ))
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }, [selectedUsers.length, users])

  const handleSelectUser = useCallback((id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }, [])

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
    const matchesRole = !filterRole || u.role === filterRole
    const matchesStatus = !filterStatus || u.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  // Stats
  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    vendors: users.filter(u => u.role === 'vendor').length,
    admins: users.filter(u => u.role === 'admin').length,
  }

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
          <h1 className="text-2xl font-bold text-historical-charcoal">إدارة المستخدمين</h1>
          <p className="text-historical-charcoal/50 mt-1">عرض وإدارة جميع المستخدمين</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow">
          {Icons.add}
          <span>إضافة مستخدم</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/10 text-historical-gold">
              {Icons.users}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-charcoal">{stats.total}</p>
              <p className="text-xs text-historical-charcoal/50">إجمالي المستخدمين</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              {Icons.user}
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.customers}</p>
              <p className="text-xs text-historical-charcoal/50">عملاء</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              {Icons.store}
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.vendors}</p>
              <p className="text-xs text-historical-charcoal/50">بائعين</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/20 text-historical-gold">
              {Icons.shield}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-gold">{stats.admins}</p>
              <p className="text-xs text-historical-charcoal/50">مديرين</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو البريد أو الهاتف..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">كل الأدوار</option>
          <option value="customer">عميل</option>
          <option value="vendor">بائع</option>
          <option value="admin">مدير</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="blocked">محظور</option>
        </select>
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-historical-gold/10 border border-historical-gold/20"
          >
            <span className="text-sm font-medium text-historical-charcoal">
              تم تحديد {selectedUsers.length} مستخدم
            </span>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-500/20 transition-colors">
                حظر
              </button>
              <button className="px-4 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors">
                إلغاء الحظر
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
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
                    checked={selectedUsers.length === users.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                  />
                </th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">المستخدم</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الهاتف</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الدور</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الطلبات</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الإنفاق</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الحالة</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">آخر نشاط</th>
                <th className="w-24 px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-historical-gold/5 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-historical-gold to-historical-red flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-historical-charcoal truncate">{user.name}</p>
                          {user.isVerified && (
                            <span className="text-blue-500" title="موثق">
                              {Icons.check}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-historical-charcoal/50 truncate" dir="ltr">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-historical-charcoal/70" dir="ltr">{user.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleStyle(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-historical-charcoal">{user.totalOrders}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-historical-gold">${user.totalSpent}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'نشط' : 'محظور'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-historical-charcoal/50">
                      {new Date(user.lastActive).toLocaleDateString('ar-SY')}
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
                      <button
                        onClick={() => handleToggleBlock(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'active'
                            ? 'text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50'
                            : 'text-green-500 hover:bg-green-50'
                        }`}
                        title={user.status === 'active' ? 'حظر' : 'إلغاء الحظر'}
                      >
                        {user.status === 'active' ? Icons.block : Icons.unblock}
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
            عرض {filteredUsers.length} من {users.length} مستخدم
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {Icons.chevronRight}
            </button>
            <span className="px-4 py-2 text-sm text-historical-charcoal">
              صفحة {currentPage} من {totalPages || 1}
            </span>
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

