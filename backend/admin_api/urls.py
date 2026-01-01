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
    AdminAvatarUploadView,
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
    AdminProductImageListCreateView,
    AdminProductImageDetailView,
    # Orders
    AdminOrderListView,
    AdminOrderDetailView,
    AdminOrderStatusUpdateView,
    AdminOrderBulkActionView,
    AdminOrderStatsView,
    # Vendors
    AdminVendorListCreateView,
    AdminVendorDetailView,
    AdminVendorStatusUpdateView,
    AdminVendorCommissionUpdateView,
    AdminVendorBulkActionView,
    AdminVendorStatsView,
    AdminVendorWithUserCreateView,
    # Vendor Applications
    AdminVendorApplicationListView,
    AdminVendorApplicationDetailView,
    AdminVendorApplicationApproveView,
    AdminVendorApplicationRejectView,
    AdminVendorApplicationStatsView,
    # Users
    AdminUserListView,
    AdminUserDetailView,
    AdminUserStatusUpdateView,
    AdminUserBulkActionView,
    AdminUserStatsView,
    # Promotions
    AdminBannerListCreateView,
    AdminBannerDetailView,
    AdminBannerClickView,
    AdminBannerViewView,
    AdminStoryListCreateView,
    AdminStoryDetailView,
    AdminStoryViewView,
    AdminCouponListCreateView,
    AdminCouponDetailView,
    AdminPromotionStatsView,
    # Reports
    SalesReportView,
    ProductsReportView,
    UsersReportView,
    CommissionsReportView,
    ExportReportView,
    # Notifications
    NotificationListView,
    UnreadCountView,
    MarkAsReadView,
    MarkMultipleAsReadView,
    MarkAllAsReadView,
    NotificationStatsView,
    # Settings
    AdminSiteSettingsView,
    AdminSocialLinkListCreateView,
    AdminSocialLinkDetailView,
    AdminLanguageListCreateView,
    AdminLanguageDetailView,
    AdminNavigationListCreateView,
    AdminNavigationDetailView,
    AdminNavigationBulkUpdateView,
    AdminTrustSignalListCreateView,
    AdminTrustSignalDetailView,
    AdminPaymentMethodListCreateView,
    AdminPaymentMethodDetailView,
    AdminShippingMethodListCreateView,
    AdminShippingMethodDetailView,
    AdminAllSettingsView,
    # Carts
    AdminCartListView,
    AdminCartDetailView,
    AdminCartAddItemView,
    AdminCartItemUpdateView,
    AdminCartItemDeleteView,
    AdminCartClearView,
    AdminCartStatsView,
    # Search
    AdminGlobalSearchView,
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
    
    # POST /api/v1/admin/auth/avatar/
    # رفع الصورة الشخصية
    # DELETE /api/v1/admin/auth/avatar/
    # حذف الصورة الشخصية
    path(
        'avatar/',
        AdminAvatarUploadView.as_view(),
        name='avatar'
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
    
    # GET, POST /api/v1/admin/products/{id}/images/
    # عرض وإنشاء صور المنتج
    path(
        '<int:product_pk>/images/',
        AdminProductImageListCreateView.as_view(),
        name='images-list-create'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/products/{id}/images/{image_id}/
    # تفاصيل، تحديث، حذف صورة
    path(
        '<int:product_pk>/images/<int:pk>/',
        AdminProductImageDetailView.as_view(),
        name='image-detail'
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
# Vendors URL Patterns
# أنماط URLs للبائعين
# =============================================================================
vendors_urlpatterns = [
    # GET, POST /api/v1/admin/vendors/
    # عرض قائمة البائعين وإنشاء بائع جديد
    path(
        '',
        AdminVendorListCreateView.as_view(),
        name='list-create'
    ),
    
    # POST /api/v1/admin/vendors/create-with-user/
    # إنشاء بائع مع مستخدم (إنشاء كامل)
    path(
        'create-with-user/',
        AdminVendorWithUserCreateView.as_view(),
        name='create-with-user'
    ),
    
    # GET /api/v1/admin/vendors/stats/
    # إحصائيات البائعين
    path(
        'stats/',
        AdminVendorStatsView.as_view(),
        name='stats'
    ),
    
    # POST /api/v1/admin/vendors/bulk-action/
    # عمليات مجمعة
    path(
        'bulk-action/',
        AdminVendorBulkActionView.as_view(),
        name='bulk-action'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/vendors/{id}/
    # تفاصيل، تعديل، حذف بائع
    path(
        '<int:pk>/',
        AdminVendorDetailView.as_view(),
        name='detail'
    ),
    
    # PUT /api/v1/admin/vendors/{id}/status/
    # تحديث حالة البائع
    path(
        '<int:pk>/status/',
        AdminVendorStatusUpdateView.as_view(),
        name='status-update'
    ),
    
    # PUT /api/v1/admin/vendors/{id}/commission/
    # تحديث عمولة البائع
    path(
        '<int:pk>/commission/',
        AdminVendorCommissionUpdateView.as_view(),
        name='commission-update'
    ),
]


# =============================================================================
# Vendor Applications URL Patterns
# أنماط URLs لطلبات انضمام البائعين
# =============================================================================
vendor_applications_urlpatterns = [
    # GET /api/v1/admin/vendor-applications/
    # عرض قائمة طلبات الانضمام
    path(
        '',
        AdminVendorApplicationListView.as_view(),
        name='list'
    ),
    
    # GET /api/v1/admin/vendor-applications/stats/
    # إحصائيات الطلبات
    path(
        'stats/',
        AdminVendorApplicationStatsView.as_view(),
        name='stats'
    ),
    
    # GET /api/v1/admin/vendor-applications/{id}/
    # تفاصيل الطلب
    path(
        '<int:pk>/',
        AdminVendorApplicationDetailView.as_view(),
        name='detail'
    ),
    
    # POST /api/v1/admin/vendor-applications/{id}/approve/
    # الموافقة على الطلب
    path(
        '<int:pk>/approve/',
        AdminVendorApplicationApproveView.as_view(),
        name='approve'
    ),
    
    # POST /api/v1/admin/vendor-applications/{id}/reject/
    # رفض الطلب
    path(
        '<int:pk>/reject/',
        AdminVendorApplicationRejectView.as_view(),
        name='reject'
    ),
]


# =============================================================================
# Users URL Patterns
# أنماط URLs للمستخدمين
# =============================================================================
users_urlpatterns = [
    # GET, POST /api/v1/admin/users/
    # عرض قائمة المستخدمين وإنشاء مستخدم جديد
    path(
        '',
        AdminUserListView.as_view(),
        name='list-create'
    ),
    
    # GET /api/v1/admin/users/stats/
    # إحصائيات المستخدمين
    path(
        'stats/',
        AdminUserStatsView.as_view(),
        name='stats'
    ),
    
    # POST /api/v1/admin/users/bulk-action/
    # عمليات مجمعة
    path(
        'bulk-action/',
        AdminUserBulkActionView.as_view(),
        name='bulk-action'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/users/{id}/
    # تفاصيل، تعديل، حذف مستخدم
    path(
        '<int:pk>/',
        AdminUserDetailView.as_view(),
        name='detail'
    ),
    
    # PUT /api/v1/admin/users/{id}/status/
    # تحديث حالة المستخدم
    path(
        '<int:pk>/status/',
        AdminUserStatusUpdateView.as_view(),
        name='status-update'
    ),
]


# =============================================================================
# Promotions URL Patterns
# أنماط URLs للعروض والحملات
# =============================================================================
promotions_urlpatterns = [
    # GET /api/v1/admin/promotions/stats/
    # إحصائيات العروض
    path(
        'stats/',
        AdminPromotionStatsView.as_view(),
        name='stats'
    ),
    
    # =========================================================================
    # Banners URLs
    # =========================================================================
    # GET, POST /api/v1/admin/promotions/banners/
    # عرض قائمة البانرات وإنشاء بانر جديد
    path(
        'banners/',
        AdminBannerListCreateView.as_view(),
        name='banners-list-create'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/promotions/banners/{id}/
    # تفاصيل، تعديل، حذف بانر
    path(
        'banners/<int:pk>/',
        AdminBannerDetailView.as_view(),
        name='banners-detail'
    ),
    
    # POST /api/v1/admin/promotions/banners/{id}/click/
    # تتبع نقرات البانر
    path(
        'banners/<int:pk>/click/',
        AdminBannerClickView.as_view(),
        name='banners-click'
    ),
    
    # POST /api/v1/admin/promotions/banners/{id}/view/
    # تتبع مشاهدات البانر
    path(
        'banners/<int:pk>/view/',
        AdminBannerViewView.as_view(),
        name='banners-view'
    ),
    
    # =========================================================================
    # Stories URLs
    # =========================================================================
    # GET, POST /api/v1/admin/promotions/stories/
    # عرض قائمة القصص وإنشاء قصة جديدة
    path(
        'stories/',
        AdminStoryListCreateView.as_view(),
        name='stories-list-create'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/promotions/stories/{id}/
    # تفاصيل، تعديل، حذف قصة
    path(
        'stories/<int:pk>/',
        AdminStoryDetailView.as_view(),
        name='stories-detail'
    ),
    
    # POST /api/v1/admin/promotions/stories/{id}/view/
    # تتبع مشاهدات القصة
    path(
        'stories/<int:pk>/view/',
        AdminStoryViewView.as_view(),
        name='stories-view'
    ),
    
    # =========================================================================
    # Coupons URLs
    # =========================================================================
    # GET, POST /api/v1/admin/promotions/coupons/
    # عرض قائمة الكوبونات وإنشاء كوبون جديد
    path(
        'coupons/',
        AdminCouponListCreateView.as_view(),
        name='coupons-list-create'
    ),
    
    # GET, PUT, DELETE /api/v1/admin/promotions/coupons/{id}/
    # تفاصيل، تعديل، حذف كوبون
    path(
        'coupons/<int:pk>/',
        AdminCouponDetailView.as_view(),
        name='coupons-detail'
    ),
]


# =============================================================================
# Notifications URL Patterns
# أنماط URLs للإشعارات
# =============================================================================
notifications_urlpatterns = [
    # GET /api/v1/admin/notifications/
    # عرض قائمة الإشعارات
    path(
        '',
        NotificationListView.as_view(),
        name='list'
    ),
    
    # GET /api/v1/admin/notifications/unread-count/
    # عدد الإشعارات غير المقروءة
    path(
        'unread-count/',
        UnreadCountView.as_view(),
        name='unread-count'
    ),
    
    # POST /api/v1/admin/notifications/{id}/mark-as-read/
    # تحديد إشعار كمقروء
    path(
        '<int:pk>/mark-as-read/',
        MarkAsReadView.as_view(),
        name='mark-as-read'
    ),
    
    # POST /api/v1/admin/notifications/mark-as-read/
    # تحديد عدة إشعارات كمقروءة
    path(
        'mark-as-read/',
        MarkMultipleAsReadView.as_view(),
        name='mark-multiple-as-read'
    ),
    
    # POST /api/v1/admin/notifications/mark-all-as-read/
    # تحديد جميع الإشعارات كمقروءة
    path(
        'mark-all-as-read/',
        MarkAllAsReadView.as_view(),
        name='mark-all-as-read'
    ),
    
    # GET /api/v1/admin/notifications/stats/
    # إحصائيات الإشعارات
    path(
        'stats/',
        NotificationStatsView.as_view(),
        name='stats'
    ),
]


# =============================================================================
# Settings URL Patterns
# أنماط URLs للإعدادات
# =============================================================================
settings_urlpatterns = [
    # GET /api/v1/admin/settings/all/
    # جميع الإعدادات مجمعة
    path(
        'all/',
        AdminAllSettingsView.as_view(),
        name='all'
    ),
    
    # GET, PUT /api/v1/admin/settings/site/
    # إعدادات الموقع
    path(
        'site/',
        AdminSiteSettingsView.as_view(),
        name='site'
    ),
    
    # =========================================================================
    # Social Links URLs
    # =========================================================================
    # GET, POST /api/v1/admin/settings/social/
    path(
        'social/',
        AdminSocialLinkListCreateView.as_view(),
        name='social-list-create'
    ),
    # GET, PUT, DELETE /api/v1/admin/settings/social/{id}/
    path(
        'social/<int:pk>/',
        AdminSocialLinkDetailView.as_view(),
        name='social-detail'
    ),
    
    # =========================================================================
    # Languages URLs
    # =========================================================================
    # GET, POST /api/v1/admin/settings/languages/
    path(
        'languages/',
        AdminLanguageListCreateView.as_view(),
        name='languages-list-create'
    ),
    # GET, PUT, DELETE /api/v1/admin/settings/languages/{id}/
    path(
        'languages/<int:pk>/',
        AdminLanguageDetailView.as_view(),
        name='languages-detail'
    ),
    
    # =========================================================================
    # Navigation URLs
    # =========================================================================
    # GET, POST /api/v1/admin/settings/navigation/
    path(
        'navigation/',
        AdminNavigationListCreateView.as_view(),
        name='navigation-list-create'
    ),
    # POST /api/v1/admin/settings/navigation/bulk/
    path(
        'navigation/bulk/',
        AdminNavigationBulkUpdateView.as_view(),
        name='navigation-bulk-update'
    ),
    # GET, PUT, DELETE /api/v1/admin/settings/navigation/{id}/
    path(
        'navigation/<int:pk>/',
        AdminNavigationDetailView.as_view(),
        name='navigation-detail'
    ),
    
    # =========================================================================
    # Trust Signals URLs
    # =========================================================================
    # GET, POST /api/v1/admin/settings/trust-signals/
    path(
        'trust-signals/',
        AdminTrustSignalListCreateView.as_view(),
        name='trust-signals-list-create'
    ),
    # GET, PUT, DELETE /api/v1/admin/settings/trust-signals/{id}/
    path(
        'trust-signals/<int:pk>/',
        AdminTrustSignalDetailView.as_view(),
        name='trust-signals-detail'
    ),
    
    # =========================================================================
    # Payment Methods URLs
    # =========================================================================
    # GET, POST /api/v1/admin/settings/payments/
    path(
        'payments/',
        AdminPaymentMethodListCreateView.as_view(),
        name='payments-list-create'
    ),
    # GET, PUT, DELETE /api/v1/admin/settings/payments/{id}/
    path(
        'payments/<int:pk>/',
        AdminPaymentMethodDetailView.as_view(),
        name='payments-detail'
    ),
    
    # =========================================================================
    # Shipping Methods URLs
    # =========================================================================
    # GET, POST /api/v1/admin/settings/shipping/
    path(
        'shipping/',
        AdminShippingMethodListCreateView.as_view(),
        name='shipping-list-create'
    ),
    # GET, PUT, DELETE /api/v1/admin/settings/shipping/{id}/
    path(
        'shipping/<int:pk>/',
        AdminShippingMethodDetailView.as_view(),
        name='shipping-detail'
    ),
]


# =============================================================================
# Reports URL Patterns
# أنماط URLs للتقارير
# =============================================================================
reports_urlpatterns = [
    # GET /api/v1/admin/reports/sales/
    # تقرير المبيعات
    path(
        'sales/',
        SalesReportView.as_view(),
        name='sales-report'
    ),
    
    # GET /api/v1/admin/reports/products/
    # تقرير المنتجات
    path(
        'products/',
        ProductsReportView.as_view(),
        name='products-report'
    ),
    
    # GET /api/v1/admin/reports/users/
    # تقرير المستخدمين
    path(
        'users/',
        UsersReportView.as_view(),
        name='users-report'
    ),
    
    # GET /api/v1/admin/reports/commissions/
    # تقرير العمولات
    path(
        'commissions/',
        CommissionsReportView.as_view(),
        name='commissions-report'
    ),
    
    # GET /api/v1/admin/reports/export/
    # تصدير التقرير كملف Word
    path(
        'export/',
        ExportReportView.as_view(),
        name='export-report'
    ),
]


# =============================================================================
# Carts URL Patterns
# أنماط URLs للسلل
# =============================================================================
carts_urlpatterns = [
    # GET /api/v1/admin/carts/
    # عرض قائمة السلل
    path(
        '',
        AdminCartListView.as_view(),
        name='list'
    ),
    
    # GET /api/v1/admin/carts/stats/
    # إحصائيات السلل
    path(
        'stats/',
        AdminCartStatsView.as_view(),
        name='stats'
    ),
    
    # GET, DELETE /api/v1/admin/carts/{id}/
    # تفاصيل، حذف سلة
    path(
        '<int:pk>/',
        AdminCartDetailView.as_view(),
        name='detail'
    ),
    
    # POST /api/v1/admin/carts/{id}/add_item/
    # إضافة عنصر لسلة مستخدم
    path(
        '<int:pk>/add_item/',
        AdminCartAddItemView.as_view(),
        name='add-item'
    ),
    
    # PATCH /api/v1/admin/carts/{id}/items/{item_id}/
    # تحديث عنصر في سلة مستخدم
    path(
        '<int:pk>/items/<int:item_id>/',
        AdminCartItemUpdateView.as_view(),
        name='update-item'
    ),
    
    # DELETE /api/v1/admin/carts/{id}/items/{item_id}/
    # إزالة عنصر من سلة مستخدم
    path(
        '<int:pk>/items/<int:item_id>/',
        AdminCartItemDeleteView.as_view(),
        name='delete-item'
    ),
    
    # DELETE /api/v1/admin/carts/{id}/clear/
    # مسح سلة مستخدم
    path(
        '<int:pk>/clear/',
        AdminCartClearView.as_view(),
        name='clear'
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
    
    # Vendors endpoints
    # نقاط نهاية البائعين
    path('vendors/', include((vendors_urlpatterns, 'vendors'))),
    
    # Vendor Applications endpoints
    # نقاط نهاية طلبات انضمام البائعين
    path('vendor-applications/', include((vendor_applications_urlpatterns, 'vendor-applications'))),
    
    # Users endpoints
    # نقاط نهاية المستخدمين
    path('users/', include((users_urlpatterns, 'users'))),
    
    # Promotions endpoints
    # نقاط نهاية العروض والحملات
    path('promotions/', include((promotions_urlpatterns, 'promotions'))),
    
    # Settings endpoints
    # نقاط نهاية الإعدادات
    path('settings/', include((settings_urlpatterns, 'settings'))),
    
    # Notifications endpoints
    # نقاط نهاية الإشعارات
    path('notifications/', include((notifications_urlpatterns, 'notifications'))),
    
    # Reports endpoints
    # نقاط نهاية التقارير
    path('reports/', include((reports_urlpatterns, 'reports'))),
    
    # Carts endpoints
    # نقاط نهاية السلل
    path('carts/', include((carts_urlpatterns, 'carts'))),
    
    # Global Search
    # البحث العالمي
    path('search/', AdminGlobalSearchView.as_view(), name='global-search'),
]


