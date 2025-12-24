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

// Hooks
// الهوكات
export { useDashboard } from './hooks/useDashboard'
export { useCategories } from './hooks/useCategories'

// Category Types
// أنواع الفئات
export type {
  Category,
  CategoryDetail,
  CategoryTreeNode,
  CategoryFormData,
  CategoryListParams,
  PaginatedCategories,
  CategoryBulkAction,
  CategoryBulkActionResponse,
} from './types/categories'

// Category API Functions
// دوال API الفئات
export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  bulkCategoryAction,
  toggleCategoryActive,
  toggleCategoryFeatured,
} from './api/categories'

