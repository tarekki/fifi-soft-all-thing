"""
Admin API URL Configuration
إعدادات URLs لـ API الإدارة

هذا الملف يحدد جميع مسارات URLs لـ API الإدارة.
This file defines all URL routes for the Admin API.

URL Structure:
    /api/v1/admin/auth/         - Authentication endpoints
    /api/v1/admin/dashboard/    - Dashboard endpoints
    /api/v1/admin/categories/   - Categories management (Coming soon)
    /api/v1/admin/products/     - Products management (Coming soon)
    /api/v1/admin/orders/       - Orders management (Coming soon)
    /api/v1/admin/vendors/      - Vendors management (Coming soon)
    /api/v1/admin/users/        - Users management (Coming soon)
    /api/v1/admin/promotions/   - Promotions management (Coming soon)
    /api/v1/admin/settings/     - Settings management (Coming soon)
    /api/v1/admin/reports/      - Reports (Coming soon)
"""

from django.urls import path, include
from admin_api.views import (
    # Auth
    AdminLoginView,
    AdminLogoutView,
    AdminMeView,
    AdminTokenRefreshView,
    # Dashboard
    DashboardOverviewView,
    DashboardSalesChartView,
    DashboardRecentOrdersView,
    DashboardRecentActivityView,
    # Categories
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminCategoryTreeView,
    AdminCategoryBulkActionView,
    # Products
    AdminProductListCreateView,
    AdminProductDetailView,
    AdminProductBulkActionView,
    AdminProductVariantListCreateView,
    AdminProductVariantDetailView,
    # Orders
    AdminOrderListView,
    AdminOrderDetailView,
    AdminOrderStatusUpdateView,
    AdminOrderBulkActionView,
    AdminOrderStatsView,
)


# =============================================================================
# App Namespace
# مساحة الاسم للتطبيق
# =============================================================================
app_name = 'admin_api'


# =============================================================================
# Auth URL Patterns
# أنماط URLs للمصادقة
# =============================================================================
auth_urlpatterns = [
    # POST /api/v1/admin/auth/login/
    # تسجيل الدخول
    path(
        'login/',
        AdminLoginView.as_view(),
        name='login'
    ),
    
    # POST /api/v1/admin/auth/logout/
    # تسجيل الخروج
    path(
        'logout/',
        AdminLogoutView.as_view(),
        name='logout'
    ),
    
    # POST /api/v1/admin/auth/refresh/
    # تجديد التوكن
    path(
        'refresh/',
        AdminTokenRefreshView.as_view(),
        name='refresh'
    ),
    
    # GET /api/v1/admin/auth/me/
    # معلومات الأدمن الحالي
    path(
        'me/',
        AdminMeView.as_view(),
        name='me'
    ),
]


# =============================================================================
# Dashboard URL Patterns
# أنماط URLs للوحة التحكم
# =============================================================================
dashboard_urlpatterns = [
    # GET /api/v1/admin/dashboard/overview/
    # نظرة عامة (KPIs)
    path(
        'overview/',
        DashboardOverviewView.as_view(),
        name='overview'
    ),
    
    # GET /api/v1/admin/dashboard/sales-chart/
    # بيانات رسم بياني المبيعات
    path(
        'sales-chart/',
        DashboardSalesChartView.as_view(),
        name='sales-chart'
    ),
    
    # GET /api/v1/admin/dashboard/recent-orders/
    # الطلبات الأخيرة
    path(
        'recent-orders/',
        DashboardRecentOrdersView.as_view(),
        name='recent-orders'
    ),
    
    # GET /api/v1/admin/dashboard/recent-activity/
    # النشاطات الأخيرة
    path(
        'recent-activity/',
        DashboardRecentActivityView.as_view(),
        name='recent-activity'
    ),
]


# =============================================================================
# Categories URL Patterns
# أنماط URLs للفئات
# =============================================================================
categories_urlpatterns = [
    # GET, POST /api/v1/admin/categories/
    # عرض القائمة وإنشاء فئة جديدة
    path(
        '',
        AdminCategoryListCreateView.as_view(),
        name='list-create'
    ),
    
    # GET /api/v1/admin/categories/tree/
    # شجرة الفئات
    path(
        'tree/',
        AdminCategoryTreeView.as_view(),
        name='tree'
    ),
    
    # POST /api/v1/admin/categories/bulk-action/
    # عمليات مجمعة
    path(
        'bulk-action/',
        AdminCategoryBulkActionView.as_view(),
        name='bulk-action'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/categories/{id}/
    # تفاصيل، تحديث، حذف
    path(
        '<int:pk>/',
        AdminCategoryDetailView.as_view(),
        name='detail'
    ),
]


# =============================================================================
# Products URL Patterns
# أنماط URLs للمنتجات
# =============================================================================
products_urlpatterns = [
    # GET, POST /api/v1/admin/products/
    # عرض القائمة وإنشاء منتج جديد
    path(
        '',
        AdminProductListCreateView.as_view(),
        name='list-create'
    ),
    
    # POST /api/v1/admin/products/bulk-action/
    # عمليات مجمعة
    path(
        'bulk-action/',
        AdminProductBulkActionView.as_view(),
        name='bulk-action'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/products/{id}/
    # تفاصيل، تحديث، حذف
    path(
        '<int:pk>/',
        AdminProductDetailView.as_view(),
        name='detail'
    ),
    
    # GET, POST /api/v1/admin/products/{id}/variants/
    # عرض وإنشاء متغيرات المنتج
    path(
        '<int:product_pk>/variants/',
        AdminProductVariantListCreateView.as_view(),
        name='variants-list-create'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/products/{id}/variants/{variant_id}/
    # تفاصيل، تحديث، حذف متغير
    path(
        '<int:product_pk>/variants/<int:pk>/',
        AdminProductVariantDetailView.as_view(),
        name='variant-detail'
    ),
]


# =============================================================================
# Orders URL Patterns
# أنماط URLs للطلبات
# =============================================================================
orders_urlpatterns = [
    # GET /api/v1/admin/orders/
    # عرض قائمة الطلبات
    path(
        '',
        AdminOrderListView.as_view(),
        name='list'
    ),
    
    # GET /api/v1/admin/orders/stats/
    # إحصائيات الطلبات
    path(
        'stats/',
        AdminOrderStatsView.as_view(),
        name='stats'
    ),
    
    # POST /api/v1/admin/orders/bulk-action/
    # عمليات مجمعة
    path(
        'bulk-action/',
        AdminOrderBulkActionView.as_view(),
        name='bulk-action'
    ),
    
    # GET /api/v1/admin/orders/{id}/
    # تفاصيل الطلب
    path(
        '<int:pk>/',
        AdminOrderDetailView.as_view(),
        name='detail'
    ),
    
    # PUT /api/v1/admin/orders/{id}/status/
    # تحديث حالة الطلب
    path(
        '<int:pk>/status/',
        AdminOrderStatusUpdateView.as_view(),
        name='status-update'
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
    
    # Dashboard endpoints
    # نقاط نهاية لوحة التحكم
    path('dashboard/', include((dashboard_urlpatterns, 'dashboard'))),
    
    # Categories endpoints
    # نقاط نهاية الفئات
    path('categories/', include((categories_urlpatterns, 'categories'))),
    
    # Products endpoints
    # نقاط نهاية المنتجات
    path('products/', include((products_urlpatterns, 'products'))),
    
    # Orders endpoints
    # نقاط نهاية الطلبات
    path('orders/', include((orders_urlpatterns, 'orders'))),
    
    # TODO: Add more endpoints as they are implemented
    # سيتم إضافة المزيد من النقاط عند تنفيذها
    
    # Orders Management
    # path('orders/', include('admin_api.urls.orders')),
    
    # Vendors Management
    # path('vendors/', include('admin_api.urls.vendors')),
    
    # Users Management
    # path('users/', include('admin_api.urls.users')),
    
    # Promotions Management
    # path('promotions/', include('admin_api.urls.promotions')),
    
    # Settings Management
    # path('settings/', include('admin_api.urls.settings')),
    
    # Reports
    # path('reports/', include('admin_api.urls.reports')),
]

