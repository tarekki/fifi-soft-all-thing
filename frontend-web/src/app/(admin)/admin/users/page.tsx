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
 * - Create/Update/Delete users
 * - Bulk actions
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUsers } from '@/lib/admin'
import type { User, UserRole, UserCreatePayload } from '@/lib/admin/types/users'
import { useLanguage } from '@/lib/i18n/context'


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
  loader: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}


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

const getRoleStyle = (role: UserRole) => {
  const styles = {
    customer: 'bg-blue-100 text-blue-700',
    vendor: 'bg-purple-100 text-purple-700',
    admin: 'bg-historical-gold/20 text-historical-gold',
  }
  return styles[role]
}

const getRoleLabel = (role: UserRole, t: any) => {
  const labels = {
    customer: t.admin.users.role.customer,
    vendor: t.admin.users.role.vendor,
    admin: t.admin.users.role.admin,
  }
  return labels[role]
}

const getRoleIcon = (role: UserRole) => {
  const icons = {
    customer: Icons.user,
    vendor: Icons.store,
    admin: Icons.shield,
  }
  return icons[role]
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}


// =============================================================================
// Main Component
// =============================================================================

export default function UsersPage() {
  // =========================================================================
  // Hook
  // =========================================================================
  const { t, language } = useLanguage()
  const {
    users,
    selectedUser,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingDetails,
    isProcessing,
    error,
    filters,
    fetchUsers,
    fetchUserDetails,
    create,
    update,
    updateStatus,
    bulkAction,
    setFilters,
    clearSelectedUser,
    refresh,
  } = useUsers()

  // =========================================================================
  // Local State
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<UserRole | ''>('')
  const [filterStatus, setFilterStatus] = useState<boolean | ''>('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  // =========================================================================
  // Handlers
  // =========================================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters = { ...filters, search: searchQuery, page: 1 }
      if (filterRole) {
        newFilters.role = filterRole
      } else {
        delete newFilters.role
      }
      if (filterStatus !== '') {
        newFilters.is_active = filterStatus as boolean
      } else {
        delete newFilters.is_active
      }
      setFilters(newFilters)
      fetchUsers(newFilters)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, filterRole, filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleBlock = useCallback(async (userId: number, currentStatus: boolean) => {
    const success = await updateStatus(userId, { is_active: !currentStatus })
    if (success) {
      refresh()
    }
  }, [updateStatus, refresh])

  const handleSelectAll = useCallback(() => {
    // Only select non-superuser users
    // اختيار المستخدمين غير الفائقين فقط
    const selectableUsers = users.filter(u => !u.is_superuser)
    const selectableIds = selectableUsers.map(u => u.id)
    
    if (selectedUsers.length === selectableIds.length && selectableIds.length > 0) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(selectableIds)
    }
  }, [selectedUsers.length, users])

  const handleSelectUser = useCallback((id: number) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }, [])

  const handleBulkAction = useCallback(async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return
    
    const success = await bulkAction({
      user_ids: selectedUsers,
      action,
    })
    
    if (success) {
      setSelectedUsers([])
      refresh()
    }
  }, [selectedUsers, bulkAction, refresh])

  const handlePageChange = useCallback((direction: 'next' | 'prev') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    fetchUsers(newFilters)
  }, [currentPage, filters, setFilters, fetchUsers])

  // =========================================================================
  // Render
  // =========================================================================

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
          <h1 className="text-2xl font-bold text-historical-charcoal">{t.admin.users.title}</h1>
          <p className="text-historical-charcoal/50 mt-1">{t.admin.users.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors disabled:opacity-50"
          >
            {isLoading ? Icons.loader : Icons.refresh}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            {Icons.add}
            <span>{t.admin.users.addUser}</span>
          </button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/10 text-historical-gold">
              {Icons.users}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-charcoal">{stats?.total || 0}</p>
              <p className="text-xs text-historical-charcoal/50">{t.admin.users.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              {Icons.user}
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats?.customers || 0}</p>
              <p className="text-xs text-historical-charcoal/50">{t.admin.users.customers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              {Icons.store}
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats?.vendors || 0}</p>
              <p className="text-xs text-historical-charcoal/50">{t.admin.users.vendors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/20 text-historical-gold">
              {Icons.shield}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-gold">{stats?.admins || 0}</p>
              <p className="text-xs text-historical-charcoal/50">{t.admin.users.admins}</p>
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
            placeholder={t.admin.users.searchPlaceholder}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRole | '')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">{t.admin.users.all}</option>
          <option value="customer">{t.admin.users.role.customer}</option>
          <option value="vendor">{t.admin.users.role.vendor}</option>
          <option value="admin">{t.admin.users.role.admin}</option>
        </select>

        <select
          value={filterStatus === '' ? '' : filterStatus ? 'active' : 'inactive'}
          onChange={(e) => setFilterStatus(e.target.value === '' ? '' : e.target.value === 'active')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">{t.admin.users.all}</option>
          <option value="active">{t.admin.users.active}</option>
          <option value="inactive">{t.admin.users.inactive}</option>
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
              {t.admin.users.selectedCount.replace('{count}', selectedUsers.length.toString())}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                {t.admin.users.activate}
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {t.admin.users.deactivate}
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {t.admin.users.delete}
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
        {isLoading && users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            {Icons.loader}
            <span className="mr-2 text-historical-charcoal/50">{t.admin.users.loading}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-historical-charcoal/50">{t.admin.users.noUsers}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-historical-stone/50">
                <tr>
                  <th className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.filter(u => !u.is_superuser).length && users.filter(u => !u.is_superuser).length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                    />
                  </th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">{t.admin.users.user}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">{t.admin.users.phone}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">{t.admin.users.roleLabel}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">{t.admin.users.orders}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">{t.admin.users.spending}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">{t.admin.users.status}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">{t.admin.users.lastActivity}</th>
                  <th className="w-24 px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-historical-gold/5">
                {users.map((user) => (
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
                        disabled={user.is_superuser}
                        className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.is_superuser ? t.admin.users.cannotSelectSuperuser : ''}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-historical-gold to-historical-red flex items-center justify-center flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-sm">{user.full_name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-historical-charcoal truncate">{user.full_name || user.email}</p>
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
                        {getRoleLabel(user.role, t)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-historical-charcoal">{user.orders_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-historical-gold">{user.total_spent.toFixed(2)} SYP</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? t.admin.users.active : t.admin.users.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-historical-charcoal/50">
                        {formatDate(user.last_login)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={async () => {
                            setSelectedUserId(user.id)
                            await fetchUserDetails(user.id)
                            setIsViewModalOpen(true)
                          }}
                          className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
                          title={t.admin.users.view}
                        >
                          {Icons.eye}
                        </button>
                        <button
                          onClick={async () => {
                            setSelectedUserId(user.id)
                            await fetchUserDetails(user.id)
                            setIsEditModalOpen(true)
                          }}
                          className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
                          title={t.admin.users.edit}
                        >
                          {Icons.edit}
                        </button>
                        <button
                          onClick={() => handleToggleBlock(user.id, user.is_active)}
                          disabled={isProcessing}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            user.is_active
                              ? 'text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50'
                              : 'text-green-500 hover:bg-green-50'
                          }`}
                          title={user.is_active ? t.admin.users.deactivate : t.admin.users.activate}
                        >
                          {user.is_active ? Icons.block : Icons.unblock}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(hasNextPage || hasPreviousPage) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-historical-gold/10 bg-historical-stone/30">
            <p className="text-sm text-historical-charcoal/50">
              {t.admin.users.showingUsers.replace('{start}', users.length.toString()).replace('{total}', total.toString())}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange('prev')}
                disabled={!hasPreviousPage || isLoading}
                className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {Icons.chevronRight}
              </button>
              <span className="px-4 py-2 text-sm text-historical-charcoal">
                {t.admin.users.page} {currentPage}
              </span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={!hasNextPage || isLoading}
                className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {Icons.chevronLeft}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        isProcessing={isProcessing}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (data) => {
          const success = await create(data)
          if (success) {
            setIsCreateModalOpen(false)
            refresh()
          }
          return success
        }}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={isViewModalOpen}
        isLoading={isLoadingDetails}
        user={selectedUser}
        onClose={() => {
          setIsViewModalOpen(false)
          clearSelectedUser()
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        isProcessing={isProcessing}
        isLoading={isLoadingDetails}
        user={selectedUser}
        onClose={() => {
          setIsEditModalOpen(false)
          clearSelectedUser()
        }}
        onUpdate={async (data) => {
          if (!selectedUserId) return false
          const success = await update(selectedUserId, data)
          if (success) {
            setIsEditModalOpen(false)
            clearSelectedUser()
            refresh()
          }
          return success
        }}
      />
    </motion.div>
  )
}


// =============================================================================
// Create User Modal Component
// =============================================================================

interface CreateUserModalProps {
  isOpen: boolean
  isProcessing: boolean
  onClose: () => void
  onCreate: (data: UserCreatePayload) => Promise<boolean>
}

function CreateUserModal({
  isOpen,
  isProcessing,
  onClose,
  onCreate,
}: CreateUserModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<UserCreatePayload>({
    email: '',
    password: '',
    password_confirm: '',
    full_name: '',
    phone: '',
    role: 'customer',
    is_active: true,
    is_staff: false,
    address: '',
    preferred_language: 'ar',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        password_confirm: '',
        full_name: '',
        phone: '',
        role: 'customer',
        is_active: true,
        is_staff: false,
        address: '',
        preferred_language: 'ar',
      })
      setFormErrors({})
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    // Validation
    if (!formData.email) {
      setFormErrors({ email: t.admin.users.emailRequired })
      return
    }
    if (!formData.password) {
      setFormErrors({ password: t.admin.users.passwordRequired })
      return
    }
    if (formData.password.length < 8) {
      setFormErrors({ password: t.admin.users.passwordRequired })
      return
    }
    if (formData.password !== formData.password_confirm) {
      setFormErrors({ password_confirm: t.admin.users.passwordMismatch })
      return
    }
    if (!formData.phone) {
      setFormErrors({ phone: t.admin.users.phoneRequired })
      return
    }
    if (!formData.full_name) {
      setFormErrors({ full_name: t.admin.users.nameRequired })
      return
    }

    const success = await onCreate(formData)
    if (success) {
      // Form will be reset by useEffect when modal closes
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 bg-historical-stone/30">
            <h2 className="text-lg font-bold text-historical-charcoal">{t.admin.users.addNewUser}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                {t.admin.users.form.email} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                dir="ltr"
                required
              />
              {formErrors.email && (
                <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                {t.admin.users.form.password} *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                required
              />
              {formErrors.password && (
                <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Password Confirm */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                {t.admin.users.form.confirmPassword} *
              </label>
              <input
                type="password"
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                required
              />
              {formErrors.password_confirm && (
                <p className="text-sm text-red-600 mt-1">{formErrors.password_confirm}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                {t.admin.users.form.name} *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                required
              />
              {formErrors.full_name && (
                <p className="text-sm text-red-600 mt-1">{formErrors.full_name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                {t.admin.users.form.phone} *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                dir="ltr"
                required
              />
              {formErrors.phone && (
                <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                {t.admin.users.form.role}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
              >
                <option value="customer">{t.admin.users.role.customer}</option>
                <option value="vendor">{t.admin.users.role.vendor}</option>
                <option value="admin">{t.admin.users.role.admin}</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                {t.admin.users.form.address}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 resize-none"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                {t.admin.users.form.preferredLanguage}
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as 'ar' | 'en' })}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
              >
                <option value="ar">{t.admin.users.form.arabic}</option>
                <option value="en">{t.admin.users.form.english}</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                />
                <span className="text-sm text-historical-charcoal">{t.admin.users.form.isActive}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_staff}
                  onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                  className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                />
                <span className="text-sm text-historical-charcoal">{t.admin.users.form.isStaff}</span>
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-historical-gold/10 bg-historical-stone/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-historical-gold/20 text-historical-charcoal hover:bg-historical-stone/50 transition-colors"
            >
              {t.admin.users.form.cancel}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
            >
              {isProcessing ? Icons.loader : Icons.check}
              <span>{t.admin.users.form.create}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


// =============================================================================
// View User Modal Component
// =============================================================================

interface ViewUserModalProps {
  isOpen: boolean
  isLoading: boolean
  user: import('@/lib/admin/types/users').UserDetail | null
  onClose: () => void
}

function ViewUserModal({
  isOpen,
  isLoading,
  user,
  onClose,
}: ViewUserModalProps) {
  const { t } = useLanguage()
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 bg-historical-stone/30">
            <h2 className="text-lg font-bold text-historical-charcoal">تفاصيل المستخدم</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              {Icons.loader}
              <span className="mr-2 text-historical-charcoal/50">جاري تحميل التفاصيل...</span>
            </div>
          ) : !user ? (
            <div className="text-center py-12">
              <p className="text-historical-charcoal/50">المستخدم غير موجود</p>
            </div>
          ) : (
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* User Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-historical-charcoal flex items-center gap-2">
                  {Icons.user}
                  معلومات المستخدم
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.form.name}</label>
                    <p className="font-medium text-historical-charcoal">{user.full_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.form.email}</label>
                    <p className="font-medium text-historical-charcoal" dir="ltr">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.form.phone}</label>
                    <p className="font-medium text-historical-charcoal" dir="ltr">{user.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.form.role}</label>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleStyle(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role, t)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.status}</label>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? t.admin.users.active : t.admin.users.inactive}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.staff}</label>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.is_staff ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.is_staff ? t.admin.users.yes : t.admin.users.no}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              {user.profile && (
                <div className="space-y-4 border-t border-historical-gold/10 pt-4">
                  <h3 className="font-bold text-historical-charcoal">{t.admin.users.profileInfo}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {user.profile.address && (
                      <div className="col-span-2">
                        <label className="text-sm text-historical-charcoal/50">{t.admin.users.form.address}</label>
                        <p className="text-historical-charcoal">{user.profile.address}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-historical-charcoal/50">{t.admin.users.form.preferredLanguage}</label>
                      <p className="text-historical-charcoal">{user.profile.preferred_language_display}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="space-y-4 border-t border-historical-gold/10 pt-4">
                <h3 className="font-bold text-historical-charcoal">{t.admin.users.statistics}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.ordersCount}</label>
                    <p className="text-2xl font-bold text-historical-charcoal">{user.orders_count}</p>
                  </div>
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.totalSpending}</label>
                    <p className="text-2xl font-bold text-historical-gold">{user.total_spent.toFixed(2)} SYP</p>
                  </div>
                </div>
              </div>

              {/* Vendor Associations */}
              {user.vendor_associations && user.vendor_associations.length > 0 && (
                <div className="space-y-4 border-t border-historical-gold/10 pt-4">
                  <h3 className="font-bold text-historical-charcoal">{t.admin.users.vendorAssociations}</h3>
                  <div className="space-y-2">
                    {user.vendor_associations.map((assoc) => (
                      <div key={assoc.id} className="flex items-center justify-between p-3 rounded-lg bg-historical-stone/30">
                        <span className="font-medium text-historical-charcoal">{assoc.vendor_name}</span>
                        {assoc.is_owner && (
                          <span className="text-xs px-2 py-1 rounded-full bg-historical-gold/20 text-historical-gold">
                            {t.admin.users.owner}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-4 border-t border-historical-gold/10 pt-4">
                <h3 className="font-bold text-historical-charcoal">{t.admin.users.dates}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-historical-charcoal/50">{t.admin.users.createdAt}</label>
                    <p className="text-historical-charcoal">{formatDate(user.created_at)}</p>
                  </div>
                  {user.last_login && (
                    <div>
                      <label className="text-sm text-historical-charcoal/50">{t.admin.users.lastLogin}</label>
                      <p className="text-historical-charcoal">{formatDate(user.last_login)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-historical-gold/10 bg-historical-stone/20 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors"
            >
              {t.admin.users.close}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


// =============================================================================
// Edit User Modal Component
// =============================================================================

interface EditUserModalProps {
  isOpen: boolean
  isProcessing: boolean
  isLoading: boolean
  user: import('@/lib/admin/types/users').UserDetail | null
  onClose: () => void
  onUpdate: (data: import('@/lib/admin/types/users').UserUpdatePayload) => Promise<boolean>
}

function EditUserModal({
  isOpen,
  isProcessing,
  isLoading,
  user,
  onClose,
  onUpdate,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<import('@/lib/admin/types/users').UserUpdatePayload>({
    email: '',
    full_name: '',
    phone: '',
    role: 'customer',
    is_active: true,
    is_staff: false,
    address: '',
    preferred_language: 'ar',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
        address: user.profile?.address || '',
        preferred_language: (user.profile?.preferred_language as 'ar' | 'en') || 'ar',
      })
      setFormErrors({})
    }
  }, [isOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    // Validation
    if (!formData.email) {
      setFormErrors({ email: 'البريد الإلكتروني مطلوب' })
      return
    }
    if (!formData.phone) {
      setFormErrors({ phone: 'رقم الهاتف مطلوب' })
      return
    }
    if (!formData.full_name) {
      setFormErrors({ full_name: 'الاسم الكامل مطلوب' })
      return
    }

    const success = await onUpdate(formData)
    if (success) {
      // Form will be reset by useEffect when modal closes
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 bg-historical-stone/30">
            <h2 className="text-lg font-bold text-historical-charcoal">{t.admin.users.editUser}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Form */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              {Icons.loader}
              <span className="mr-2 text-historical-charcoal/50">{t.admin.users.loadingData}</span>
            </div>
          ) : !user ? (
            <div className="text-center py-12">
              <p className="text-historical-charcoal/50">المستخدم غير موجود</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-1">
                  {t.admin.users.form.email} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  dir="ltr"
                  required
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-1">
                  {t.admin.users.form.name} *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  required
                />
                {formErrors.full_name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.full_name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-1">
                  {t.admin.users.form.phone} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  dir="ltr"
                  required
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-1">
                  {t.admin.users.form.role}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                >
                  <option value="customer">{t.admin.users.role.customer}</option>
                  <option value="vendor">{t.admin.users.role.vendor}</option>
                  <option value="admin">{t.admin.users.role.admin}</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-1">
                  {t.admin.users.form.address}
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 resize-none"
                />
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-1">
                  {t.admin.users.form.preferredLanguage}
                </label>
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as 'ar' | 'en' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                >
                  <option value="ar">{t.admin.users.form.arabic}</option>
                  <option value="en">{t.admin.users.form.english}</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                  />
                  <span className="text-sm text-historical-charcoal">{t.admin.users.form.isActive}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_staff}
                    onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                    className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                  />
                  <span className="text-sm text-historical-charcoal">{t.admin.users.form.isStaff}</span>
                </label>
                {formData.is_superuser !== undefined && (
                  <label className="flex items-center gap-2 cursor-pointer opacity-50">
                    <input
                      type="checkbox"
                      checked={formData.is_superuser}
                      disabled
                      className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                    />
                    <span className="text-sm text-historical-charcoal">{t.admin.users.superuser}</span>
                  </label>
                )}
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-historical-gold/10 bg-historical-stone/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-historical-gold/20 text-historical-charcoal hover:bg-historical-stone/50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isProcessing || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
            >
              {isProcessing ? Icons.loader : Icons.check}
              <span>{t.admin.users.save}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
