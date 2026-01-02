"""
Vendor API Serializers
متسلسلات API البائعين

This package contains all serializers for vendor API endpoints.
هذه الحزمة تحتوي على جميع المتسلسلات لنقاط نهاية API البائعين.
"""

from .dashboard import (
    VendorDashboardOverviewSerializer,
    VendorRecentOrderSerializer,
    VendorSalesChartSerializer,
    VendorDashboardTipSerializer,
)
from .auth import (
    VendorLoginSerializer,
)
from .application import (
    VendorApplicationSerializer,
)
from .products import (
    VendorProductListSerializer,
    VendorProductDetailSerializer,
    VendorProductCreateSerializer,
    VendorProductUpdateSerializer,
    VendorProductImageSerializer,
    VendorProductImageCreateSerializer,
    VendorProductVariantSerializer,
    VendorProductVariantCreateSerializer,
)
from .customers import (
    VendorCustomerListSerializer,
)
from .analytics import (
    VendorAnalyticsOverviewSerializer,
    VendorSalesAnalyticsSerializer,
    VendorProductAnalyticsSerializer,
    VendorProductAnalyticsItemSerializer,
    VendorCustomerAnalyticsSerializer,
    VendorCustomerAnalyticsItemSerializer,
    VendorTimeAnalysisSerializer,
    VendorComparisonAnalyticsSerializer,
)
from .settings import (
    VendorProfileSerializer,
    VendorProfileUpdateSerializer,
    VendorInfoSerializer,
    VendorInfoUpdateSerializer,
    VendorNotificationPreferencesSerializer,
    VendorNotificationPreferencesUpdateSerializer,
    VendorStoreSettingsSerializer,
    VendorStoreSettingsUpdateSerializer,
    VendorActiveSessionSerializer,
)

__all__ = [
    'VendorDashboardOverviewSerializer',
    'VendorLoginSerializer',
    'VendorApplicationSerializer',
    'VendorProductListSerializer',
    'VendorProductDetailSerializer',
    'VendorProductCreateSerializer',
    'VendorProductUpdateSerializer',
    'VendorProductImageSerializer',
    'VendorProductImageCreateSerializer',
    'VendorProductVariantSerializer',
    'VendorProductVariantCreateSerializer',
    'VendorCustomerListSerializer',
    'VendorAnalyticsOverviewSerializer',
    'VendorSalesAnalyticsSerializer',
    'VendorProductAnalyticsSerializer',
    'VendorProductAnalyticsItemSerializer',
    'VendorCustomerAnalyticsSerializer',
    'VendorCustomerAnalyticsItemSerializer',
    'VendorTimeAnalysisSerializer',
    'VendorComparisonAnalyticsSerializer',
    'VendorProfileSerializer',
    'VendorProfileUpdateSerializer',
    'VendorInfoSerializer',
    'VendorInfoUpdateSerializer',
    'VendorNotificationPreferencesSerializer',
    'VendorNotificationPreferencesUpdateSerializer',
    'VendorStoreSettingsSerializer',
    'VendorStoreSettingsUpdateSerializer',
    'VendorActiveSessionSerializer',
]

