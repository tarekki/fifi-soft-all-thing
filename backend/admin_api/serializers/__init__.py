"""
Admin API Serializers
المتسلسلات (Serializers) لـ API الإدارة

This package contains all serializers for the Admin API.
هذه الحزمة تحتوي على جميع المتسلسلات لـ API الإدارة.
"""

from .auth import (
    AdminLoginSerializer,
    AdminUserSerializer,
    AdminTokenRefreshSerializer,
)
from .dashboard import (
    DashboardOverviewSerializer,
    SalesChartSerializer,
    RecentOrderSerializer,
    RecentActivitySerializer,
)
from .categories import (
    AdminCategoryListSerializer,
    AdminCategoryDetailSerializer,
    AdminCategoryCreateSerializer,
    AdminCategoryUpdateSerializer,
    AdminCategoryTreeSerializer,
)
from .products import (
    AdminProductListSerializer,
    AdminProductDetailSerializer,
    AdminProductCreateSerializer,
    AdminProductUpdateSerializer,
    AdminProductBulkActionSerializer,
    AdminProductVariantSerializer,
    AdminProductVariantCreateSerializer,
)
from .orders import (
    AdminOrderItemSerializer,
    AdminOrderListSerializer,
    AdminOrderDetailSerializer,
    AdminOrderStatusUpdateSerializer,
    AdminOrderBulkActionSerializer,
)
from .vendors import (
    AdminVendorListSerializer,
    AdminVendorDetailSerializer,
    AdminVendorCreateSerializer,
    AdminVendorUpdateSerializer,
    AdminVendorStatusUpdateSerializer,
    AdminVendorCommissionUpdateSerializer,
    AdminVendorBulkActionSerializer,
)
from .vendor_applications import (
    AdminVendorApplicationListSerializer,
    AdminVendorApplicationDetailSerializer,
    AdminVendorApplicationApproveSerializer,
    AdminVendorApplicationRejectSerializer,
)
from .users import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    AdminUserStatusUpdateSerializer,
    AdminUserBulkActionSerializer,
    AdminUserStatsSerializer,
)
from .promotions import (
    AdminBannerListSerializer,
    AdminBannerDetailSerializer,
    AdminBannerCreateSerializer,
    AdminBannerUpdateSerializer,
    AdminStoryListSerializer,
    AdminStoryDetailSerializer,
    AdminStoryCreateSerializer,
    AdminStoryUpdateSerializer,
    AdminCouponListSerializer,
    AdminCouponDetailSerializer,
    AdminCouponCreateSerializer,
    AdminCouponUpdateSerializer,
    AdminPromotionStatsSerializer,
)
from .reports import (
    SalesReportSerializer,
    ProductsReportSerializer,
    UsersReportSerializer,
    CommissionsReportSerializer,
    DailySalesSerializer,
    TopProductSerializer,
    CategorySalesSerializer,
)
from .settings import (
    AdminSiteSettingsSerializer,
    AdminSocialLinkSerializer,
    AdminLanguageSerializer,
    AdminNavigationItemSerializer,
    AdminNavigationMenuSerializer,
    AdminNavigationBulkUpdateSerializer,
    AdminTrustSignalSerializer,
    AdminPaymentMethodSerializer,
    AdminShippingMethodSerializer,
    AdminAllSettingsSerializer,
)
from .carts import (
    AdminCartItemSerializer,
    AdminCartListSerializer,
    AdminCartDetailSerializer,
    AdminCartItemAddSerializer,
    AdminCartItemUpdateSerializer,
    AdminCartStatisticsSerializer,
)

__all__ = [
    # Auth
    'AdminLoginSerializer',
    'AdminUserSerializer',
    'AdminTokenRefreshSerializer',
    # Dashboard
    'DashboardOverviewSerializer',
    'SalesChartSerializer',
    'RecentOrderSerializer',
    'RecentActivitySerializer',
    # Categories
    'AdminCategoryListSerializer',
    'AdminCategoryDetailSerializer',
    'AdminCategoryCreateSerializer',
    'AdminCategoryUpdateSerializer',
    'AdminCategoryTreeSerializer',
    # Products
    'AdminProductListSerializer',
    'AdminProductDetailSerializer',
    'AdminProductCreateSerializer',
    'AdminProductUpdateSerializer',
    'AdminProductBulkActionSerializer',
    'AdminProductVariantSerializer',
    'AdminProductVariantCreateSerializer',
    # Orders
    'AdminOrderItemSerializer',
    'AdminOrderListSerializer',
    'AdminOrderDetailSerializer',
    'AdminOrderStatusUpdateSerializer',
    'AdminOrderBulkActionSerializer',
    # Vendors
    'AdminVendorListSerializer',
    'AdminVendorDetailSerializer',
    'AdminVendorCreateSerializer',
    'AdminVendorUpdateSerializer',
    'AdminVendorStatusUpdateSerializer',
    'AdminVendorCommissionUpdateSerializer',
    'AdminVendorBulkActionSerializer',
    # Vendor Applications
    'AdminVendorApplicationListSerializer',
    'AdminVendorApplicationDetailSerializer',
    'AdminVendorApplicationApproveSerializer',
    'AdminVendorApplicationRejectSerializer',
    # Users
    'AdminUserListSerializer',
    'AdminUserDetailSerializer',
    'AdminUserCreateSerializer',
    'AdminUserUpdateSerializer',
    'AdminUserStatusUpdateSerializer',
    'AdminUserBulkActionSerializer',
    'AdminUserStatsSerializer',
    # Promotions
    'AdminBannerListSerializer',
    'AdminBannerDetailSerializer',
    'AdminBannerCreateSerializer',
    'AdminBannerUpdateSerializer',
    'AdminStoryListSerializer',
    'AdminStoryDetailSerializer',
    'AdminStoryCreateSerializer',
    'AdminStoryUpdateSerializer',
    'AdminCouponListSerializer',
    'AdminCouponDetailSerializer',
    'AdminCouponCreateSerializer',
    'AdminCouponUpdateSerializer',
    'AdminPromotionStatsSerializer',
    # Reports
    'SalesReportSerializer',
    'ProductsReportSerializer',
    'UsersReportSerializer',
    'CommissionsReportSerializer',
    'DailySalesSerializer',
    'TopProductSerializer',
    'CategorySalesSerializer',
    # Settings
    'AdminSiteSettingsSerializer',
    'AdminSocialLinkSerializer',
    'AdminLanguageSerializer',
    'AdminNavigationItemSerializer',
    'AdminNavigationMenuSerializer',
    'AdminNavigationBulkUpdateSerializer',
    'AdminTrustSignalSerializer',
    'AdminPaymentMethodSerializer',
    'AdminShippingMethodSerializer',
    'AdminAllSettingsSerializer',
    # Carts
    'AdminCartItemSerializer',
    'AdminCartListSerializer',
    'AdminCartDetailSerializer',
    'AdminCartItemAddSerializer',
    'AdminCartItemUpdateSerializer',
    'AdminCartStatisticsSerializer',
]

