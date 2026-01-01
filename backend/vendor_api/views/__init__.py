"""
Vendor API Views
عروض API البائعين

This package contains all views for vendor API endpoints.
هذه الحزمة تحتوي على جميع العروض لنقاط نهاية API البائعين.
"""

from .dashboard import (
    VendorDashboardOverviewView,
    VendorSalesChartView,
    VendorDashboardTipsView,
    VendorRecentOrdersView,
    VendorReportExportView,
)
from .auth import (
    VendorLoginView,
    VendorMeView,
)
from .application import (
    VendorApplicationView,
)
from .products import (
    VendorProductListCreateView,
    VendorProductDetailView,
)
from .categories import (
    VendorCategoryListView,
)
from .orders import (
    VendorOrderListView,
    VendorOrderDetailView,
)
from .notifications import (
    VendorNotificationListView,
    VendorUnreadCountView,
    VendorMarkAsReadView,
    VendorMarkMultipleAsReadView,
    VendorMarkAllAsReadView,
    VendorNotificationStatsView,
)

__all__ = [
    'VendorDashboardOverviewView',
    'VendorSalesChartView',
    'VendorDashboardTipsView',
    'VendorRecentOrdersView',
    'VendorReportExportView',
    'VendorLoginView',
    'VendorMeView',
    'VendorApplicationView',
    'VendorProductListCreateView',
    'VendorProductDetailView',
    'VendorCategoryListView',
    'VendorOrderListView',
    'VendorOrderDetailView',
    'VendorNotificationListView',
    'VendorUnreadCountView',
    'VendorMarkAsReadView',
    'VendorMarkMultipleAsReadView',
    'VendorMarkAllAsReadView',
    'VendorNotificationStatsView',
]

