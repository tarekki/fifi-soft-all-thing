"""
Site Settings URLs
مسارات إعدادات الموقع

This module defines URL patterns for site settings API endpoints.
يحدد هذا الملف مسارات URL لنقاط API إعدادات الموقع.

All endpoints are public (no authentication required).
جميع النقاط عامة (لا تتطلب مصادقة).

Endpoints:
    GET /api/v1/settings/site/           - Site settings (name, logo, contact)
    GET /api/v1/settings/social/         - Social media links
    GET /api/v1/settings/languages/      - Available languages
    GET /api/v1/settings/navigation/     - Navigation menus
    GET /api/v1/settings/trust-signals/  - Trust signals
    GET /api/v1/settings/payment-methods/ - Payment methods
    GET /api/v1/settings/shipping-methods/ - Shipping methods
    GET /api/v1/settings/all/            - All settings combined
"""

from django.urls import path
from .views import (
    SiteSettingsView,
    SocialLinksView,
    LanguagesView,
    NavigationView,
    TrustSignalsView,
    PaymentMethodsView,
    ShippingMethodsView,
    AllSettingsView
)

app_name = 'settings_app'

urlpatterns = [
    # ==========================================================================
    # Site Settings Endpoint
    # نقطة إعدادات الموقع
    # ==========================================================================
    # GET /api/v1/settings/site/
    # Returns: site_name, logo, contact info, SEO, currency, maintenance status
    path('site/', SiteSettingsView.as_view(), name='site-settings'),
    
    # ==========================================================================
    # Social Links Endpoint
    # نقطة روابط السوشيال
    # ==========================================================================
    # GET /api/v1/settings/social/
    # Returns: list of social media links with icons
    path('social/', SocialLinksView.as_view(), name='social-links'),
    
    # ==========================================================================
    # Languages Endpoint
    # نقطة اللغات
    # ==========================================================================
    # GET /api/v1/settings/languages/
    # Returns: list of available languages
    path('languages/', LanguagesView.as_view(), name='languages'),
    
    # ==========================================================================
    # Navigation Endpoint
    # نقطة القوائم
    # ==========================================================================
    # GET /api/v1/settings/navigation/
    # GET /api/v1/settings/navigation/?location=header
    # Returns: navigation items grouped by location
    path('navigation/', NavigationView.as_view(), name='navigation'),
    
    # ==========================================================================
    # Trust Signals Endpoint
    # نقطة مؤشرات الثقة
    # ==========================================================================
    # GET /api/v1/settings/trust-signals/
    # Returns: list of trust indicators
    path('trust-signals/', TrustSignalsView.as_view(), name='trust-signals'),
    
    # ==========================================================================
    # Payment Methods Endpoint
    # نقطة طرق الدفع
    # ==========================================================================
    # GET /api/v1/settings/payment-methods/
    # Returns: list of available payment methods
    path('payment-methods/', PaymentMethodsView.as_view(), name='payment-methods'),
    
    # ==========================================================================
    # Shipping Methods Endpoint
    # نقطة طرق الشحن
    # ==========================================================================
    # GET /api/v1/settings/shipping-methods/
    # Returns: list of available shipping methods
    path('shipping-methods/', ShippingMethodsView.as_view(), name='shipping-methods'),
    
    # ==========================================================================
    # All Settings Endpoint (Combined)
    # نقطة جميع الإعدادات (مجمعة)
    # ==========================================================================
    # GET /api/v1/settings/all/
    # Returns: all settings in a single response (optimized for initial load)
    path('all/', AllSettingsView.as_view(), name='all-settings'),
]

