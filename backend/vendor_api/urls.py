"""
Vendor API URL Configuration
إعدادات URLs لـ API البائعين

This module defines all URL patterns for Vendor API.
هذا الوحدة يعرّف جميع أنماط URL لـ API البائعين.

API Structure:
/api/v1/vendor/
  /auth/login/                - Vendor login
  /auth/refresh/              - Refresh access token (future)
  /dashboard/overview/        - Dashboard KPIs and statistics
  /dashboard/sales-chart/     - Sales chart data (future)
  /dashboard/recent-orders/   - Recent orders list (future)
"""

from django.urls import path, include
from vendor_api.views.dashboard import VendorDashboardOverviewView, VendorSalesChartView, VendorDashboardTipsView, VendorRecentOrdersView, VendorReportExportView
from vendor_api.views.auth import VendorLoginView, VendorMeView, VendorPasswordChangeView
from vendor_api.views.application import VendorApplicationView
from vendor_api.views.products import VendorProductListCreateView, VendorProductDetailView
from vendor_api.views.categories import VendorCategoryListView
from vendor_api.views.orders import VendorOrderListView, VendorOrderDetailView
from vendor_api.views.customers import VendorCustomerListView
from vendor_api.views.notifications import (
    VendorNotificationListView,
    VendorUnreadCountView,
    VendorMarkAsReadView,
    VendorMarkMultipleAsReadView,
    VendorMarkAllAsReadView,
    VendorNotificationStatsView,
)


# =============================================================================
# Authentication URL Patterns
# أنماط URLs للمصادقة
# =============================================================================

auth_urlpatterns = [
    # POST /api/v1/vendor/auth/login/
    # تسجيل دخول البائع
    path(
        'login/',
        VendorLoginView.as_view(),
        name='vendor-auth-login'
    ),
    # GET /api/v1/vendor/auth/me/
    # معلومات البائع الحالي
    path(
        'me/',
        VendorMeView.as_view(),
        name='vendor-auth-me'
    ),
    # POST /api/v1/vendor/auth/change-password/
    # تغيير كلمة مرور البائع
    path(
        'change-password/',
        VendorPasswordChangeView.as_view(),
        name='vendor-auth-change-password'
    ),
]


# =============================================================================
# Dashboard URL Patterns
# أنماط URLs للوحة التحكم
# =============================================================================

dashboard_urlpatterns = [
    # GET /api/v1/vendor/dashboard/overview/
    # نظرة عامة (KPIs)
    path(
        'overview/',
        VendorDashboardOverviewView.as_view(),
        name='vendor-dashboard-overview'
    ),
    # GET /api/v1/vendor/dashboard/sales-chart/
    # بيانات رسم بياني المبيعات
    path(
        'sales-chart/',
        VendorSalesChartView.as_view(),
        name='vendor-dashboard-sales-chart'
    ),
    # GET /api/v1/vendor/dashboard/tips/
    # نصائح لوحة التحكم
    path(
        'tips/',
        VendorDashboardTipsView.as_view(),
        name='vendor-dashboard-tips'
    ),
    # GET /api/v1/vendor/dashboard/recent-orders/
    # الطلبات الأخيرة
    path(
        'recent-orders/',
        VendorRecentOrdersView.as_view(),
        name='vendor-dashboard-recent-orders'
    ),
    # GET /api/v1/vendor/dashboard/reports/export/
    # تصدير تقرير البائع كملف Word
    path(
        'reports/export/',
        VendorReportExportView.as_view(),
        name='vendor-report-export'
    ),
]


# =============================================================================
# Categories URL Patterns
# أنماط URLs للفئات
# =============================================================================

categories_urlpatterns = [
    # GET /api/v1/vendor/categories/
    # قائمة الفئات (قراءة فقط)
    path(
        '',
        VendorCategoryListView.as_view(),
        name='vendor-categories-list'
    ),
]


# =============================================================================
# Products URL Patterns
# أنماط URLs للمنتجات
# =============================================================================

products_urlpatterns = [
    # GET, POST /api/v1/vendor/products/
    # قائمة المنتجات وإنشاء منتج جديد
    path(
        '',
        VendorProductListCreateView.as_view(),
        name='vendor-products-list-create'
    ),
    # GET, PUT, DELETE /api/v1/vendor/products/{id}/
    # تفاصيل المنتج، تحديث، حذف
    path(
        '<int:pk>/',
        VendorProductDetailView.as_view(),
        name='vendor-products-detail'
    ),
]


# =============================================================================
# Orders URL Patterns
# أنماط URLs للطلبات
# =============================================================================

orders_urlpatterns = [
    # GET /api/v1/vendor/orders/
    # قائمة الطلبات
    path(
        '',
        VendorOrderListView.as_view(),
        name='vendor-orders-list'
    ),
    # GET /api/v1/vendor/orders/{id}/
    # تفاصيل الطلب
    path(
        '<int:pk>/',
        VendorOrderDetailView.as_view(),
        name='vendor-orders-detail'
    ),
]


# =============================================================================
# Customers URL Patterns
# أنماط URLs للزبائن
# =============================================================================

customers_urlpatterns = [
    # GET /api/v1/vendor/customers/
    # قائمة الزبائن
    path(
        '',
        VendorCustomerListView.as_view(),
        name='vendor-customers-list'
    ),
]


# =============================================================================
# Notifications URL Patterns
# أنماط URLs للإشعارات
# =============================================================================

notifications_urlpatterns = [
    # GET /api/v1/vendor/notifications/
    # عرض قائمة الإشعارات
    path(
        '',
        VendorNotificationListView.as_view(),
        name='vendor-notifications-list'
    ),
    
    # GET /api/v1/vendor/notifications/unread-count/
    # عدد الإشعارات غير المقروءة
    path(
        'unread-count/',
        VendorUnreadCountView.as_view(),
        name='vendor-notifications-unread-count'
    ),
    
    # POST /api/v1/vendor/notifications/{id}/mark-as-read/
    # تحديد إشعار كمقروء
    path(
        '<int:pk>/mark-as-read/',
        VendorMarkAsReadView.as_view(),
        name='vendor-notifications-mark-as-read'
    ),
    
    # POST /api/v1/vendor/notifications/mark-as-read/
    # تحديد عدة إشعارات كمقروءة
    path(
        'mark-as-read/',
        VendorMarkMultipleAsReadView.as_view(),
        name='vendor-notifications-mark-multiple-as-read'
    ),
    
    # POST /api/v1/vendor/notifications/mark-all-as-read/
    # تحديد جميع الإشعارات كمقروءة
    path(
        'mark-all-as-read/',
        VendorMarkAllAsReadView.as_view(),
        name='vendor-notifications-mark-all-as-read'
    ),
    
    # GET /api/v1/vendor/notifications/stats/
    # إحصائيات الإشعارات
    path(
        'stats/',
        VendorNotificationStatsView.as_view(),
        name='vendor-notifications-stats'
    ),
]


# =============================================================================
# Main URL Patterns
# أنماط URLs الرئيسية
# =============================================================================

urlpatterns = [
    # Authentication endpoints
    # نقاط نهاية المصادقة
    path('auth/', include((auth_urlpatterns, 'auth'))),
    
    # Vendor Application endpoint (public)
    # نقطة نهاية طلب انضمام البائع (عامة)
    path(
        'apply/',
        VendorApplicationView.as_view(),
        name='vendor-apply'
    ),
    
    # Dashboard endpoints
    # نقاط نهاية لوحة التحكم
    path('dashboard/', include((dashboard_urlpatterns, 'dashboard'))),
    
    # Categories endpoints (read-only)
    # نقاط نهاية الفئات (قراءة فقط)
    path('categories/', include((categories_urlpatterns, 'categories'))),
    
    # Products endpoints
    # نقاط نهاية المنتجات
    path('products/', include((products_urlpatterns, 'products'))),
    
    # Orders endpoints
    # نقاط نهاية الطلبات
    path('orders/', include((orders_urlpatterns, 'orders'))),
    
    # Customers endpoints
    # نقاط نهاية الزبائن
    path('customers/', include((customers_urlpatterns, 'customers'))),
    
    # Notifications endpoints
    # نقاط نهاية الإشعارات
    path('notifications/', include((notifications_urlpatterns, 'notifications'))),
]

