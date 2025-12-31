"""
Admin API Views
عروض API الإدارة

This package contains all views for the Admin API.
هذه الحزمة تحتوي على جميع العروض لـ API الإدارة.
"""

from .auth import (
    AdminLoginView,
    AdminLogoutView,
    AdminMeView,
    AdminTokenRefreshView,
)
from .dashboard import (
    DashboardOverviewView,
    DashboardSalesChartView,
    DashboardRecentOrdersView,
    DashboardRecentActivityView,
)
from .categories import (
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminCategoryTreeView,
    AdminCategoryBulkActionView,
)
from .products import (
    AdminProductListCreateView,
    AdminProductDetailView,
    AdminProductBulkActionView,
    AdminProductVariantListCreateView,
    AdminProductVariantDetailView,
    AdminProductImageListCreateView,
    AdminProductImageDetailView,
)
from .orders import (
    AdminOrderListView,
    AdminOrderDetailView,
    AdminOrderStatusUpdateView,
    AdminOrderBulkActionView,
    AdminOrderStatsView,
)
from .vendors import (
    AdminVendorListCreateView,
    AdminVendorDetailView,
    AdminVendorStatusUpdateView,
    AdminVendorCommissionUpdateView,
    AdminVendorBulkActionView,
    AdminVendorStatsView,
)
from .vendor_applications import (
    AdminVendorApplicationListView,
    AdminVendorApplicationDetailView,
    AdminVendorApplicationApproveView,
    AdminVendorApplicationRejectView,
    AdminVendorApplicationStatsView,
)
from .users import (
    AdminUserListView,
    AdminUserDetailView,
    AdminUserStatusUpdateView,
    AdminUserBulkActionView,
    AdminUserStatsView,
)
from .promotions import (
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
)
from .reports import (
    SalesReportView,
    ProductsReportView,
    UsersReportView,
    CommissionsReportView,
    ExportReportView,
)
from .notifications import (
    NotificationListView,
    UnreadCountView,
    MarkAsReadView,
    MarkMultipleAsReadView,
    MarkAllAsReadView,
    NotificationStatsView,
)
from .settings import (
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
)
from .carts import (
    AdminCartListView,
    AdminCartDetailView,
    AdminCartAddItemView,
    AdminCartItemUpdateView,
    AdminCartItemDeleteView,
    AdminCartClearView,
    AdminCartStatsView,
)
from .search import AdminGlobalSearchView

__all__ = [
    # Auth
    'AdminLoginView',
    'AdminLogoutView',
    'AdminMeView',
    'AdminTokenRefreshView',
    # Dashboard
    'DashboardOverviewView',
    'DashboardSalesChartView',
    'DashboardRecentOrdersView',
    'DashboardRecentActivityView',
    # Categories
    'AdminCategoryListCreateView',
    'AdminCategoryDetailView',
    'AdminCategoryTreeView',
    'AdminCategoryBulkActionView',
    # Products
    'AdminProductListCreateView',
    'AdminProductDetailView',
    'AdminProductBulkActionView',
    'AdminProductVariantListCreateView',
    'AdminProductVariantDetailView',
    'AdminProductImageListCreateView',
    'AdminProductImageDetailView',
    # Orders
    'AdminOrderListView',
    'AdminOrderDetailView',
    'AdminOrderStatusUpdateView',
    'AdminOrderBulkActionView',
    'AdminOrderStatsView',
    # Vendors
    'AdminVendorListCreateView',
    'AdminVendorDetailView',
    'AdminVendorStatusUpdateView',
    'AdminVendorCommissionUpdateView',
    'AdminVendorBulkActionView',
    'AdminVendorStatsView',
    # Vendor Applications
    'AdminVendorApplicationListView',
    'AdminVendorApplicationDetailView',
    'AdminVendorApplicationApproveView',
    'AdminVendorApplicationRejectView',
    'AdminVendorApplicationStatsView',
    # Users
    'AdminUserListView',
    'AdminUserDetailView',
    'AdminUserStatusUpdateView',
    'AdminUserBulkActionView',
    'AdminUserStatsView',
    # Promotions
    'AdminBannerListCreateView',
    'AdminBannerDetailView',
    'AdminBannerClickView',
    'AdminBannerViewView',
    'AdminStoryListCreateView',
    'AdminStoryDetailView',
    'AdminStoryViewView',
    'AdminCouponListCreateView',
    'AdminCouponDetailView',
    'AdminPromotionStatsView',
    # Reports
    'SalesReportView',
    'ProductsReportView',
    'UsersReportView',
    'CommissionsReportView',
    'ExportReportView',
    # Notifications
    'NotificationListView',
    'UnreadCountView',
    'MarkAsReadView',
    'MarkMultipleAsReadView',
    'MarkAllAsReadView',
    'NotificationStatsView',
    # Settings
    'AdminSiteSettingsView',
    'AdminSocialLinkListCreateView',
    'AdminSocialLinkDetailView',
    'AdminLanguageListCreateView',
    'AdminLanguageDetailView',
    'AdminNavigationListCreateView',
    'AdminNavigationDetailView',
    'AdminNavigationBulkUpdateView',
    'AdminTrustSignalListCreateView',
    'AdminTrustSignalDetailView',
    'AdminPaymentMethodListCreateView',
    'AdminPaymentMethodDetailView',
    'AdminShippingMethodListCreateView',
    'AdminShippingMethodDetailView',
    'AdminAllSettingsView',
    # Carts
    'AdminCartListView',
    'AdminCartDetailView',
    'AdminCartAddItemView',
    'AdminCartItemUpdateView',
    'AdminCartItemDeleteView',
    'AdminCartClearView',
    'AdminCartStatsView',
    # Search
    'AdminGlobalSearchView',
]

