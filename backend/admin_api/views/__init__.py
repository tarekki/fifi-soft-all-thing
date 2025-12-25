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
]

