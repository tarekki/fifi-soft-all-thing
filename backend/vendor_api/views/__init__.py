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
from .customers import (
    VendorCustomerListView,
)
from .analytics import (
    VendorAnalyticsOverviewView,
    VendorSalesAnalyticsView,
    VendorProductAnalyticsView,
    VendorCustomerAnalyticsView,
    VendorTimeAnalysisView,
    VendorComparisonAnalyticsView,
)
from .settings import (
    VendorProfileSettingsView,
    VendorProfileAvatarUploadView,
    VendorInfoSettingsView,
    VendorLogoUploadView,
    VendorNotificationPreferencesView,
    VendorStoreSettingsView,
    VendorActiveSessionsView,
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
    'VendorCustomerListView',
    'VendorAnalyticsOverviewView',
    'VendorSalesAnalyticsView',
    'VendorProductAnalyticsView',
    'VendorCustomerAnalyticsView',
    'VendorTimeAnalysisView',
    'VendorComparisonAnalyticsView',
    'VendorProfileSettingsView',
    'VendorProfileAvatarUploadView',
    'VendorInfoSettingsView',
    'VendorLogoUploadView',
    'VendorNotificationPreferencesView',
    'VendorStoreSettingsView',
    'VendorActiveSessionsView',
]

