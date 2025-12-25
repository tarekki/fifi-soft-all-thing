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
]

