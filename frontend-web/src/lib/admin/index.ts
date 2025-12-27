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

// Notification Types
export type {
  Notification,
  NotificationType,
  NotificationFilters,
  NotificationStats,
  NotificationResponse,
  MarkAsReadPayload,
} from './types/notifications'

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
export { useProducts } from './hooks/useProducts'
export { useOrders } from './hooks/useOrders'
export { useVendors } from './hooks/useVendors'
export { useVendorApplications } from './hooks/useVendorApplications'
export { useUsers } from './hooks/useUsers'
export { useBanners, useStories, useCoupons, usePromotionStats } from './hooks/usePromotions'
export { useNotifications } from './hooks/useNotifications'

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

// Product Types
// أنواع المنتجات
export type {
  Product,
  ProductDetail,
  ProductVariant,
  ProductStatus,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductFilters,
  ProductBulkAction,
  ProductBulkActionPayload,
  ProductVariantCreatePayload,
  ProductListResponse,
} from './types/products'

// Product API Functions
// دوال API المنتجات
export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkProductAction,
  getProductVariants,
  getProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from './api/products'

// Order Types
// أنواع الطلبات
export type {
  Order,
  OrderDetail,
  OrderItem,
  OrderStatus,
  OrderType,
  OrderFilters,
  OrderStatusUpdatePayload,
  OrderBulkAction,
  OrderBulkActionPayload,
  OrderStats,
  StatusOption,
} from './types/orders'

// Order API Functions
// دوال API الطلبات
export {
  getOrders,
  getOrder,
  updateOrderStatus,
  bulkOrderAction,
  getOrderStats,
} from './api/orders'

// Vendor Types
// أنواع البائعين
export type {
  Vendor,
  VendorDetail,
  VendorFilters,
  VendorCreatePayload,
  VendorUpdatePayload,
  VendorStatusUpdatePayload,
  VendorCommissionUpdatePayload,
  VendorBulkAction,
  VendorBulkActionPayload,
  VendorStats,
} from './types/vendors'

// Vendor API Functions
// دوال API البائعين
export {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
  updateVendorCommission,
  bulkVendorAction,
  getVendorStats,
} from './api/vendors'

// Vendor Application Types
// أنواع طلبات انضمام البائعين
export type {
  VendorApplication,
  VendorApplicationDetail,
  VendorApplicationFilters,
  VendorApplicationApprovePayload,
  VendorApplicationRejectPayload,
  VendorApplicationStats,
  VendorApplicationStatus,
  VendorApplicationBusinessType,
} from './types/vendorApplications'

// Vendor Application API Functions
// دوال API طلبات انضمام البائعين
export {
  getVendorApplications,
  getVendorApplication,
  approveVendorApplication,
  rejectVendorApplication,
  getVendorApplicationStats,
} from './api/vendorApplications'

// User Types
// أنواع المستخدمين
export type {
  User,
  UserDetail,
  UserFilters,
  UserCreatePayload,
  UserUpdatePayload,
  UserStatusUpdatePayload,
  UserBulkActionPayload,
  UserStats,
  UserRole,
} from './types/users'

// User API Functions
// دوال API المستخدمين
export {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkUserAction,
  getUserStats,
} from './api/users'

// Promotion Types
// أنواع العروض والحملات
export type {
  Banner,
  BannerDetail,
  BannerPayload,
  BannerFilters,
  PaginatedBanners,
  BannerLocation,
  BannerLinkType,
  Story,
  StoryDetail,
  StoryPayload,
  StoryFilters,
  PaginatedStories,
  StoryLinkType,
  Coupon,
  CouponDetail,
  CouponPayload,
  CouponFilters,
  PaginatedCoupons,
  CouponDiscountType,
  CouponApplicableTo,
  PromotionStats,
} from './types/promotions'

// Promotion API Functions
// دوال API العروض والحملات
export {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  trackBannerClick,
  trackBannerView,
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  trackStoryView,
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getPromotionStats,
} from './api/promotions'

// Notification API Functions
// دوال API الإشعارات
export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  getNotificationStats,
} from './api/notifications'

