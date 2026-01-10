"""
Site Settings Views
عروض إعدادات الموقع

This module contains API views for site settings endpoints.
يحتوي هذا الملف على عروض API لنقاط إعدادات الموقع.

All views are public (no authentication required).
جميع العروض عامة (لا تتطلب مصادقة).
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import (
    SiteSettings,
    SocialLink,
    Language,
    NavigationItem,
    TrustSignal,
    PaymentMethod,
    ShippingMethod
)
from .serializers import (
    SiteSettingsPublicSerializer,
    SocialLinkSerializer,
    LanguageSerializer,
    NavigationItemSerializer,
    NavigationMenuSerializer,
    TrustSignalSerializer,
    PaymentMethodSerializer,
    ShippingMethodSerializer,
    AllSettingsSerializer
)


# Cache duration constants (in seconds)
# ثوابت مدة الكاش (بالثواني)
CACHE_SHORT = 60 * 1        # 1 minute - للبيانات المتغيرة (ينتهي تلقائياً كل دقيقة)
CACHE_MEDIUM = 60 * 30      # 30 minutes - للبيانات شبه الثابتة
CACHE_LONG = 60 * 60 * 24   # 24 hours - للبيانات الثابتة


# =============================================================================
# Site Settings View
# عرض إعدادات الموقع
# =============================================================================

class SiteSettingsView(APIView):
    """
    Site Settings API View
    عرض API إعدادات الموقع
    
    Returns core site settings (name, logo, contact info, etc.)
    يُرجع إعدادات الموقع الأساسية (الاسم، الشعار، معلومات الاتصال، إلخ)
    
    Endpoint: GET /api/v1/settings/site/
    
    Response includes:
    - site_name, site_name_ar: Site name in both languages
    - tagline, tagline_ar: Site tagline
    - logo_url, favicon_url: Branding images
    - meta_title, meta_description: SEO settings
    - currency_code, currency_symbol: Currency settings
    - is_maintenance_mode: Maintenance status
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get Site Settings",
        description="Returns core site configuration settings",
        tags=["Settings"],
        responses={200: SiteSettingsPublicSerializer}
    )
    @method_decorator(cache_page(CACHE_MEDIUM))
    def get(self, request):
        """
        Get site settings.
        الحصول على إعدادات الموقع.
        """
        settings = SiteSettings.get_settings()
        serializer = SiteSettingsPublicSerializer(settings)
        
        return Response({
            "success": True,
            "message": "Site settings retrieved successfully",
            "data": serializer.data,
            "errors": None
        }, status=status.HTTP_200_OK)


# =============================================================================
# Social Links View
# عرض روابط السوشيال
# =============================================================================

class SocialLinksView(APIView):
    """
    Social Links API View
    عرض API روابط السوشيال ميديا
    
    Returns list of active social media links.
    يُرجع قائمة روابط السوشيال ميديا النشطة.
    
    Endpoint: GET /api/v1/settings/social/
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get Social Links",
        description="Returns list of active social media links",
        tags=["Settings"],
        responses={200: SocialLinkSerializer(many=True)}
    )
    @method_decorator(cache_page(CACHE_LONG))
    def get(self, request):
        """
        Get social links.
        الحصول على روابط السوشيال.
        """
        links = SocialLink.objects.filter(is_active=True).order_by('order')
        serializer = SocialLinkSerializer(links, many=True)
        
        return Response({
            "success": True,
            "message": "Social links retrieved successfully",
            "data": serializer.data,
            "errors": None
        }, status=status.HTTP_200_OK)


# =============================================================================
# Languages View
# عرض اللغات
# =============================================================================

class LanguagesView(APIView):
    """
    Languages API View
    عرض API اللغات المدعومة
    
    Returns list of available languages.
    يُرجع قائمة اللغات المتاحة.
    
    Endpoint: GET /api/v1/settings/languages/
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get Available Languages",
        description="Returns list of available site languages",
        tags=["Settings"],
        responses={200: LanguageSerializer(many=True)}
    )
    @method_decorator(cache_page(CACHE_LONG))
    def get(self, request):
        """
        Get available languages.
        الحصول على اللغات المتاحة.
        """
        languages = Language.objects.filter(is_active=True).order_by('order')
        serializer = LanguageSerializer(languages, many=True)
        
        return Response({
            "success": True,
            "message": "Languages retrieved successfully",
            "data": serializer.data,
            "errors": None
        }, status=status.HTTP_200_OK)


# =============================================================================
# Navigation View
# عرض القوائم
# =============================================================================

class NavigationView(APIView):
    """
    Navigation API View
    عرض API قوائم التنقل
    
    Returns navigation items grouped by location.
    يُرجع عناصر التنقل مجمعة حسب الموقع.
    
    Endpoint: GET /api/v1/settings/navigation/
    Query params:
        - location: Filter by specific location (header, footer_about, etc.)
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get Navigation Menu",
        description="Returns navigation items grouped by location",
        tags=["Settings"],
        parameters=[
            OpenApiParameter(
                name='location',
                description='Filter by menu location',
                required=False,
                type=str,
                enum=['header', 'header_mobile', 'footer_about', 'footer_support', 'footer_legal', 'sidebar']
            )
        ],
        responses={200: NavigationMenuSerializer}
    )
    @method_decorator(cache_page(CACHE_MEDIUM))
    def get(self, request):
        """
        Get navigation items.
        الحصول على عناصر التنقل.
        """
        location = request.query_params.get('location')
        
        # Base queryset - only active root items (no parent)
        # الاستعلام الأساسي - فقط العناصر النشطة الجذرية (بدون أب)
        base_qs = NavigationItem.objects.filter(
            is_active=True,
            parent__isnull=True
        ).order_by('order')
        
        if location:
            # Return items for specific location
            # إرجاع العناصر لموقع محدد
            items = base_qs.filter(location=location)
            serializer = NavigationItemSerializer(items, many=True)
            
            return Response({
                "success": True,
                "message": f"Navigation items for '{location}' retrieved successfully",
                "data": serializer.data,
                "errors": None
            }, status=status.HTTP_200_OK)
        
        # Return all items grouped by location
        # إرجاع جميع العناصر مجمعة حسب الموقع
        navigation_data = {
            'header': NavigationItemSerializer(
                base_qs.filter(location='header'), many=True
            ).data,
            'header_mobile': NavigationItemSerializer(
                base_qs.filter(location='header_mobile'), many=True
            ).data,
            'footer_about': NavigationItemSerializer(
                base_qs.filter(location='footer_about'), many=True
            ).data,
            'footer_support': NavigationItemSerializer(
                base_qs.filter(location='footer_support'), many=True
            ).data,
            'footer_legal': NavigationItemSerializer(
                base_qs.filter(location='footer_legal'), many=True
            ).data,
        }
        
        return Response({
            "success": True,
            "message": "Navigation menu retrieved successfully",
            "data": navigation_data,
            "errors": None
        }, status=status.HTTP_200_OK)


# =============================================================================
# Trust Signals View
# عرض مؤشرات الثقة
# =============================================================================

class TrustSignalsView(APIView):
    """
    Trust Signals API View
    عرض API مؤشرات الثقة
    
    Returns list of active trust signals.
    يُرجع قائمة مؤشرات الثقة النشطة.
    
    Endpoint: GET /api/v1/settings/trust-signals/
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get Trust Signals",
        description="Returns list of trust indicators (free shipping, secure payment, etc.)",
        tags=["Settings"],
        responses={200: TrustSignalSerializer(many=True)}
    )
    @method_decorator(cache_page(CACHE_LONG))
    def get(self, request):
        """
        Get trust signals.
        الحصول على مؤشرات الثقة.
        """
        signals = TrustSignal.objects.filter(is_active=True).order_by('order')
        serializer = TrustSignalSerializer(signals, many=True)
        
        return Response({
            "success": True,
            "message": "Trust signals retrieved successfully",
            "data": serializer.data,
            "errors": None
        }, status=status.HTTP_200_OK)


# =============================================================================
# Payment Methods View
# عرض طرق الدفع
# =============================================================================

class PaymentMethodsView(APIView):
    """
    Payment Methods API View
    عرض API طرق الدفع
    
    Returns list of active payment methods.
    يُرجع قائمة طرق الدفع النشطة.
    
    Endpoint: GET /api/v1/settings/payment-methods/
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get Payment Methods",
        description="Returns list of available payment methods",
        tags=["Settings"],
        responses={200: PaymentMethodSerializer(many=True)}
    )
    @method_decorator(cache_page(CACHE_MEDIUM))
    def get(self, request):
        """
        Get payment methods.
        الحصول على طرق الدفع.
        """
        methods = PaymentMethod.objects.filter(is_active=True).order_by('order')
        serializer = PaymentMethodSerializer(methods, many=True)
        
        return Response({
            "success": True,
            "message": "Payment methods retrieved successfully",
            "data": serializer.data,
            "errors": None
        }, status=status.HTTP_200_OK)


# =============================================================================
# Shipping Methods View
# عرض طرق الشحن
# =============================================================================

class ShippingMethodsView(APIView):
    """
    Shipping Methods API View
    عرض API طرق الشحن
    
    Returns list of active shipping methods.
    يُرجع قائمة طرق الشحن النشطة.
    
    Endpoint: GET /api/v1/settings/shipping-methods/
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get Shipping Methods",
        description="Returns list of available shipping methods",
        tags=["Settings"],
        responses={200: ShippingMethodSerializer(many=True)}
    )
    @method_decorator(cache_page(CACHE_MEDIUM))
    def get(self, request):
        """
        Get shipping methods.
        الحصول على طرق الشحن.
        """
        methods = ShippingMethod.objects.filter(is_active=True).order_by('order')
        serializer = ShippingMethodSerializer(methods, many=True)
        
        return Response({
            "success": True,
            "message": "Shipping methods retrieved successfully",
            "data": serializer.data,
            "errors": None
        }, status=status.HTTP_200_OK)


# =============================================================================
# All Settings View (Combined)
# عرض جميع الإعدادات (مجمعة)
# =============================================================================

class AllSettingsView(APIView):
    """
    All Settings API View
    عرض API جميع الإعدادات
    
    Returns all site settings in a single response.
    يُرجع جميع إعدادات الموقع في استجابة واحدة.
    
    This is optimized for initial page load to reduce API calls.
    محسّن للتحميل الأولي للصفحة لتقليل استدعاءات API.
    
    Endpoint: GET /api/v1/settings/all/
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Get All Settings",
        description="Returns all site settings in a single response (optimized for initial load)",
        tags=["Settings"],
        responses={200: AllSettingsSerializer}
    )
    @method_decorator(cache_page(CACHE_SHORT))
    def get(self, request):
        """
        Get all settings.
        الحصول على جميع الإعدادات.
        """
        # Get site settings
        # الحصول على إعدادات الموقع
        site_settings = SiteSettings.get_settings()
        
        # Get all active items
        # الحصول على جميع العناصر النشطة
        # Use same ordering as model: order, then name, then id for consistency
        # استخدام نفس الترتيب في الـ model: order، ثم name، ثم id للاتساق
        social_links = SocialLink.objects.filter(is_active=True).order_by('order', 'name', 'id')
        languages = Language.objects.filter(is_active=True).order_by('order')
        trust_signals = TrustSignal.objects.filter(is_active=True).order_by('order')
        payment_methods = PaymentMethod.objects.filter(is_active=True).order_by('order')
        shipping_methods = ShippingMethod.objects.filter(is_active=True).order_by('order')
        
        # Get navigation items grouped by location
        # الحصول على عناصر التنقل مجمعة حسب الموقع
        nav_base = NavigationItem.objects.filter(is_active=True, parent__isnull=True)
        navigation_data = {
            'header': NavigationItemSerializer(
                nav_base.filter(location='header').order_by('order'), many=True
            ).data,
            'header_mobile': NavigationItemSerializer(
                nav_base.filter(location='header_mobile').order_by('order'), many=True
            ).data,
            'footer_about': NavigationItemSerializer(
                nav_base.filter(location='footer_about').order_by('order'), many=True
            ).data,
            'footer_support': NavigationItemSerializer(
                nav_base.filter(location='footer_support').order_by('order'), many=True
            ).data,
            'footer_legal': NavigationItemSerializer(
                nav_base.filter(location='footer_legal').order_by('order'), many=True
            ).data,
        }
        
        # Build response data
        # بناء بيانات الاستجابة
        response_data = {
            'site': SiteSettingsPublicSerializer(site_settings).data,
            'social_links': SocialLinkSerializer(social_links, many=True).data,
            'languages': LanguageSerializer(languages, many=True).data,
            'navigation': navigation_data,
            'trust_signals': TrustSignalSerializer(trust_signals, many=True).data,
            'payment_methods': PaymentMethodSerializer(payment_methods, many=True).data,
            'shipping_methods': ShippingMethodSerializer(shipping_methods, many=True).data,
        }
        
        return Response({
            "success": True,
            "message": "All settings retrieved successfully",
            "data": response_data,
            "errors": None
        }, status=status.HTTP_200_OK)

