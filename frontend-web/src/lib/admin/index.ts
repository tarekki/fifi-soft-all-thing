/**
 * Admin Module Exports
 * تصديرات وحدة الإدارة
 * 
 * Central export file for all admin-related functionality.
 * ملف تصدير مركزي لجميع وظائف الإدارة.
 */

// Types
// الأنواع
export type {
  AdminRole,
  AdminPermission,
  AdminUser,
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminAuthState,
  DashboardOverview,
  SalesChartData,
  RecentOrder,
  RecentActivity,
  ApiResponse,
} from './types'

// Context & Provider
// السياق والمزود
export {
  AdminAuthProvider,
  useAdminAuth,
  ProtectedRoute,
} from './context'

// API Functions
// دوال الـ API
export {
  // Auth
  adminLogin,
  adminLogout,
  getAdminMe,
  
  // Dashboard
  getDashboardOverview,
  getSalesChart,
  getRecentOrders,
  getRecentActivity,
  
  // Token Management
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  isTokenExpired,
  
  // Permission Helpers
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from './api'

