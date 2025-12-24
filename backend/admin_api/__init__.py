# =============================================================================
# Admin API Application
# تطبيق API الإدارة
# =============================================================================
# 
# هذا التطبيق يوفر واجهة برمجية (API) مخصصة للوحة تحكم الأدمن
# This app provides a dedicated API for the Admin Dashboard
#
# Features:
# - Admin Authentication (JWT-based)
# - Dashboard Statistics
# - Categories Management
# - Products Management
# - Orders Management
# - Vendors Management
# - Users Management
# - Promotions Management
# - Reports & Analytics
#
# Security:
# - All endpoints require admin authentication
# - Role-based access control (Super Admin, Admin, Moderator)
# - Activity logging for all operations
# - Rate limiting
#
# Author: Yalla Buy Development Team
# =============================================================================

default_app_config = 'admin_api.apps.AdminApiConfig'

