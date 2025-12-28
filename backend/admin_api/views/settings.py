"""
Admin Settings Views
عروض إعدادات الأدمن

This module contains all views for admin settings management.
يحتوي هذا الملف على جميع عروض إدارة إعدادات الأدمن.

Endpoints:
- GET/PUT     /api/v1/admin/settings/site/          - Site settings
- GET/POST    /api/v1/admin/settings/social/        - Social links list/create
- PUT/DELETE  /api/v1/admin/settings/social/{id}/   - Social link detail
- GET/POST    /api/v1/admin/settings/languages/     - Languages list/create
- PUT/DELETE  /api/v1/admin/settings/languages/{id}/ - Language detail
- GET/POST    /api/v1/admin/settings/navigation/    - Navigation items
- PUT/DELETE  /api/v1/admin/settings/navigation/{id}/ - Navigation item detail
- POST        /api/v1/admin/settings/navigation/bulk/ - Bulk update navigation
- GET/POST    /api/v1/admin/settings/trust-signals/ - Trust signals
- PUT/DELETE  /api/v1/admin/settings/trust-signals/{id}/ - Trust signal detail
- GET/POST    /api/v1/admin/settings/payments/      - Payment methods
- PUT/DELETE  /api/v1/admin/settings/payments/{id}/ - Payment method detail
- GET/POST    /api/v1/admin/settings/shipping/      - Shipping methods
- PUT/DELETE  /api/v1/admin/settings/shipping/{id}/ - Shipping method detail
- GET         /api/v1/admin/settings/all/           - All settings combined

@author Yalla Buy Team
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from django.utils.translation import gettext_lazy as _
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from admin_api.permissions import IsAdminUser
from admin_api.throttling import AdminUserRateThrottle
from admin_api.serializers.settings import (
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
from settings_app.models import (
    SiteSettings,
    SocialLink,
    Language,
    NavigationItem,
    TrustSignal,
    PaymentMethod,
    ShippingMethod,
)
from core.utils import success_response, error_response


# =============================================================================
# Site Settings View
# عرض إعدادات الموقع
# =============================================================================

class AdminSiteSettingsView(APIView):
    """
    Admin Site Settings View - Get/Update
    عرض إعدادات الموقع للأدمن - جلب/تحديث
    
    GET: Get current site settings
    PUT: Update site settings
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Get Site Settings',
        description='Get all site configuration settings',
        responses={200: AdminSiteSettingsSerializer},
        tags=['Admin Settings'],
    )
    def get(self, request):
        """Get site settings."""
        settings = SiteSettings.get_settings()
        serializer = AdminSiteSettingsSerializer(settings)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب إعدادات الموقع / Site settings retrieved')
        )
    
    @extend_schema(
        summary='Update Site Settings',
        description='Update site configuration settings',
        request=AdminSiteSettingsSerializer,
        responses={200: AdminSiteSettingsSerializer},
        tags=['Admin Settings'],
    )
    def put(self, request):
        """Update site settings."""
        settings = SiteSettings.get_settings()
        serializer = AdminSiteSettingsSerializer(settings, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تحديث الإعدادات / Failed to update settings'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم تحديث إعدادات الموقع / Site settings updated')
        )


# =============================================================================
# Social Links Views
# عروض روابط السوشيال
# =============================================================================

class AdminSocialLinkListCreateView(APIView):
    """
    Admin Social Links - List and Create
    روابط السوشيال للأدمن - عرض وإنشاء
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='List Social Links',
        description='Get all social media links',
        responses={200: AdminSocialLinkSerializer(many=True)},
        tags=['Admin Settings'],
    )
    def get(self, request):
        """List all social links."""
        links = SocialLink.objects.all().order_by('order', 'name')
        serializer = AdminSocialLinkSerializer(links, many=True)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب روابط السوشيال / Social links retrieved')
        )
    
    @extend_schema(
        summary='Create Social Link',
        description='Create a new social media link',
        request=AdminSocialLinkSerializer,
        responses={201: AdminSocialLinkSerializer},
        tags=['Admin Settings'],
    )
    def post(self, request):
        """Create a new social link."""
        serializer = AdminSocialLinkSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل إنشاء الرابط / Failed to create link'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم إنشاء رابط السوشيال / Social link created'),
            status_code=status.HTTP_201_CREATED
        )


class AdminSocialLinkDetailView(APIView):
    """
    Admin Social Link Detail - Update and Delete
    تفاصيل رابط السوشيال للأدمن - تحديث وحذف
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    def get_object(self, pk):
        return get_object_or_404(SocialLink, pk=pk)
    
    @extend_schema(
        summary='Get Social Link',
        description='Get a specific social link',
        responses={200: AdminSocialLinkSerializer},
        tags=['Admin Settings'],
    )
    def get(self, request, pk):
        """Get social link details."""
        link = self.get_object(pk)
        serializer = AdminSocialLinkSerializer(link)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب رابط السوشيال / Social link retrieved')
        )
    
    @extend_schema(
        summary='Update Social Link',
        description='Update a social media link',
        request=AdminSocialLinkSerializer,
        responses={200: AdminSocialLinkSerializer},
        tags=['Admin Settings'],
    )
    def put(self, request, pk):
        """Update social link."""
        link = self.get_object(pk)
        serializer = AdminSocialLinkSerializer(link, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تحديث الرابط / Failed to update link'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم تحديث رابط السوشيال / Social link updated')
        )
    
    @extend_schema(
        summary='Delete Social Link',
        description='Delete a social media link',
        responses={200: OpenApiResponse(description='Link deleted')},
        tags=['Admin Settings'],
    )
    def delete(self, request, pk):
        """Delete social link."""
        link = self.get_object(pk)
        link.delete()
        
        return success_response(
            message=_('تم حذف رابط السوشيال / Social link deleted')
        )


# =============================================================================
# Languages Views
# عروض اللغات
# =============================================================================

class AdminLanguageListCreateView(APIView):
    """Admin Languages - List and Create"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='List Languages',
        description='Get all available languages',
        responses={200: AdminLanguageSerializer(many=True)},
        tags=['Admin Settings'],
    )
    def get(self, request):
        """List all languages."""
        languages = Language.objects.all().order_by('order', 'name')
        serializer = AdminLanguageSerializer(languages, many=True)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب اللغات / Languages retrieved')
        )
    
    @extend_schema(
        summary='Create Language',
        description='Create a new language',
        request=AdminLanguageSerializer,
        responses={201: AdminLanguageSerializer},
        tags=['Admin Settings'],
    )
    def post(self, request):
        """Create a new language."""
        serializer = AdminLanguageSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل إنشاء اللغة / Failed to create language'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم إنشاء اللغة / Language created'),
            status_code=status.HTTP_201_CREATED
        )


class AdminLanguageDetailView(APIView):
    """Admin Language Detail - Update and Delete"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    def get_object(self, pk):
        return get_object_or_404(Language, pk=pk)
    
    @extend_schema(
        summary='Update Language',
        description='Update a language',
        request=AdminLanguageSerializer,
        responses={200: AdminLanguageSerializer},
        tags=['Admin Settings'],
    )
    def put(self, request, pk):
        """Update language."""
        language = self.get_object(pk)
        serializer = AdminLanguageSerializer(language, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تحديث اللغة / Failed to update language'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم تحديث اللغة / Language updated')
        )
    
    @extend_schema(
        summary='Delete Language',
        description='Delete a language',
        responses={200: OpenApiResponse(description='Language deleted')},
        tags=['Admin Settings'],
    )
    def delete(self, request, pk):
        """Delete language."""
        language = self.get_object(pk)
        
        # Prevent deleting default language
        if language.is_default:
            return error_response(
                message=_('لا يمكن حذف اللغة الافتراضية / Cannot delete default language'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        language.delete()
        
        return success_response(
            message=_('تم حذف اللغة / Language deleted')
        )


# =============================================================================
# Navigation Views
# عروض التنقل
# =============================================================================

class AdminNavigationListCreateView(APIView):
    """Admin Navigation Items - List and Create"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='List Navigation Items',
        description='Get all navigation items grouped by location',
        parameters=[
            OpenApiParameter(
                name='location',
                type=str,
                description='Filter by location',
                required=False
            ),
        ],
        responses={200: AdminNavigationMenuSerializer},
        tags=['Admin Settings'],
    )
    def get(self, request):
        """List navigation items."""
        location = request.query_params.get('location')
        
        if location:
            items = NavigationItem.objects.filter(
                location=location,
                parent__isnull=True
            ).order_by('order')
            serializer = AdminNavigationItemSerializer(items, many=True)
            return success_response(
                data=serializer.data,
                message=_('تم جلب عناصر التنقل / Navigation items retrieved')
            )
        
        # Return all grouped by location
        base_qs = NavigationItem.objects.filter(parent__isnull=True).order_by('order')
        
        navigation_data = {
            'header': AdminNavigationItemSerializer(
                base_qs.filter(location='header'), many=True
            ).data,
            'header_mobile': AdminNavigationItemSerializer(
                base_qs.filter(location='header_mobile'), many=True
            ).data,
            'footer_about': AdminNavigationItemSerializer(
                base_qs.filter(location='footer_about'), many=True
            ).data,
            'footer_support': AdminNavigationItemSerializer(
                base_qs.filter(location='footer_support'), many=True
            ).data,
            'footer_legal': AdminNavigationItemSerializer(
                base_qs.filter(location='footer_legal'), many=True
            ).data,
            'sidebar': AdminNavigationItemSerializer(
                base_qs.filter(location='sidebar'), many=True
            ).data,
        }
        
        return success_response(
            data=navigation_data,
            message=_('تم جلب قوائم التنقل / Navigation menus retrieved')
        )
    
    @extend_schema(
        summary='Create Navigation Item',
        description='Create a new navigation item',
        request=AdminNavigationItemSerializer,
        responses={201: AdminNavigationItemSerializer},
        tags=['Admin Settings'],
    )
    def post(self, request):
        """Create navigation item."""
        serializer = AdminNavigationItemSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل إنشاء عنصر التنقل / Failed to create navigation item'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم إنشاء عنصر التنقل / Navigation item created'),
            status_code=status.HTTP_201_CREATED
        )


class AdminNavigationDetailView(APIView):
    """Admin Navigation Item Detail - Update and Delete"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    def get_object(self, pk):
        return get_object_or_404(NavigationItem, pk=pk)
    
    @extend_schema(
        summary='Get Navigation Item',
        description='Get a navigation item details',
        responses={200: AdminNavigationItemSerializer},
        tags=['Admin Settings'],
    )
    def get(self, request, pk):
        """Get navigation item."""
        item = self.get_object(pk)
        serializer = AdminNavigationItemSerializer(item)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب عنصر التنقل / Navigation item retrieved')
        )
    
    @extend_schema(
        summary='Update Navigation Item',
        description='Update a navigation item',
        request=AdminNavigationItemSerializer,
        responses={200: AdminNavigationItemSerializer},
        tags=['Admin Settings'],
    )
    def put(self, request, pk):
        """Update navigation item."""
        item = self.get_object(pk)
        serializer = AdminNavigationItemSerializer(item, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تحديث عنصر التنقل / Failed to update navigation item'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم تحديث عنصر التنقل / Navigation item updated')
        )
    
    @extend_schema(
        summary='Delete Navigation Item',
        description='Delete a navigation item',
        responses={200: OpenApiResponse(description='Item deleted')},
        tags=['Admin Settings'],
    )
    def delete(self, request, pk):
        """Delete navigation item."""
        item = self.get_object(pk)
        item.delete()
        
        return success_response(
            message=_('تم حذف عنصر التنقل / Navigation item deleted')
        )


class AdminNavigationBulkUpdateView(APIView):
    """Admin Navigation Bulk Update - Reorder items"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Bulk Update Navigation',
        description='Bulk update and reorder navigation items for a location',
        request=AdminNavigationBulkUpdateSerializer,
        responses={200: AdminNavigationItemSerializer(many=True)},
        tags=['Admin Settings'],
    )
    def post(self, request):
        """Bulk update navigation items."""
        serializer = AdminNavigationBulkUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تحديث عناصر التنقل / Failed to update navigation items'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        updated_items = serializer.update_items(serializer.validated_data)
        result_serializer = AdminNavigationItemSerializer(updated_items, many=True)
        
        return success_response(
            data=result_serializer.data,
            message=_('تم تحديث عناصر التنقل / Navigation items updated')
        )


# =============================================================================
# Trust Signals Views
# عروض مؤشرات الثقة
# =============================================================================

class AdminTrustSignalListCreateView(APIView):
    """Admin Trust Signals - List and Create"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='List Trust Signals',
        description='Get all trust signals',
        responses={200: AdminTrustSignalSerializer(many=True)},
        tags=['Admin Settings'],
    )
    def get(self, request):
        """List all trust signals."""
        signals = TrustSignal.objects.all().order_by('order')
        serializer = AdminTrustSignalSerializer(signals, many=True)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب مؤشرات الثقة / Trust signals retrieved')
        )
    
    @extend_schema(
        summary='Create Trust Signal',
        description='Create a new trust signal',
        request=AdminTrustSignalSerializer,
        responses={201: AdminTrustSignalSerializer},
        tags=['Admin Settings'],
    )
    def post(self, request):
        """Create trust signal."""
        serializer = AdminTrustSignalSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل إنشاء مؤشر الثقة / Failed to create trust signal'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم إنشاء مؤشر الثقة / Trust signal created'),
            status_code=status.HTTP_201_CREATED
        )


class AdminTrustSignalDetailView(APIView):
    """Admin Trust Signal Detail"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    def get_object(self, pk):
        return get_object_or_404(TrustSignal, pk=pk)
    
    @extend_schema(
        summary='Update Trust Signal',
        request=AdminTrustSignalSerializer,
        responses={200: AdminTrustSignalSerializer},
        tags=['Admin Settings'],
    )
    def put(self, request, pk):
        """Update trust signal."""
        signal = self.get_object(pk)
        serializer = AdminTrustSignalSerializer(signal, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تحديث مؤشر الثقة / Failed to update trust signal'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم تحديث مؤشر الثقة / Trust signal updated')
        )
    
    @extend_schema(
        summary='Delete Trust Signal',
        responses={200: OpenApiResponse(description='Signal deleted')},
        tags=['Admin Settings'],
    )
    def delete(self, request, pk):
        """Delete trust signal."""
        signal = self.get_object(pk)
        signal.delete()
        
        return success_response(
            message=_('تم حذف مؤشر الثقة / Trust signal deleted')
        )


# =============================================================================
# Payment Methods Views
# عروض طرق الدفع
# =============================================================================

class AdminPaymentMethodListCreateView(APIView):
    """Admin Payment Methods - List and Create"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='List Payment Methods',
        description='Get all payment methods',
        responses={200: AdminPaymentMethodSerializer(many=True)},
        tags=['Admin Settings'],
    )
    def get(self, request):
        """List all payment methods."""
        methods = PaymentMethod.objects.all().order_by('order')
        serializer = AdminPaymentMethodSerializer(methods, many=True)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب طرق الدفع / Payment methods retrieved')
        )
    
    @extend_schema(
        summary='Create Payment Method',
        request=AdminPaymentMethodSerializer,
        responses={201: AdminPaymentMethodSerializer},
        tags=['Admin Settings'],
    )
    def post(self, request):
        """Create payment method."""
        serializer = AdminPaymentMethodSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل إنشاء طريقة الدفع / Failed to create payment method'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم إنشاء طريقة الدفع / Payment method created'),
            status_code=status.HTTP_201_CREATED
        )


class AdminPaymentMethodDetailView(APIView):
    """Admin Payment Method Detail"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    def get_object(self, pk):
        return get_object_or_404(PaymentMethod, pk=pk)
    
    @extend_schema(
        summary='Update Payment Method',
        request=AdminPaymentMethodSerializer,
        responses={200: AdminPaymentMethodSerializer},
        tags=['Admin Settings'],
    )
    def put(self, request, pk):
        """Update payment method."""
        method = self.get_object(pk)
        serializer = AdminPaymentMethodSerializer(method, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تحديث طريقة الدفع / Failed to update payment method'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم تحديث طريقة الدفع / Payment method updated')
        )
    
    @extend_schema(
        summary='Delete Payment Method',
        responses={200: OpenApiResponse(description='Method deleted')},
        tags=['Admin Settings'],
    )
    def delete(self, request, pk):
        """Delete payment method."""
        method = self.get_object(pk)
        method.delete()
        
        return success_response(
            message=_('تم حذف طريقة الدفع / Payment method deleted')
        )


# =============================================================================
# Shipping Methods Views
# عروض طرق الشحن
# =============================================================================

class AdminShippingMethodListCreateView(APIView):
    """Admin Shipping Methods - List and Create"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='List Shipping Methods',
        description='Get all shipping methods',
        responses={200: AdminShippingMethodSerializer(many=True)},
        tags=['Admin Settings'],
    )
    def get(self, request):
        """List all shipping methods."""
        methods = ShippingMethod.objects.all().order_by('order')
        serializer = AdminShippingMethodSerializer(methods, many=True)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب طرق الشحن / Shipping methods retrieved')
        )
    
    @extend_schema(
        summary='Create Shipping Method',
        request=AdminShippingMethodSerializer,
        responses={201: AdminShippingMethodSerializer},
        tags=['Admin Settings'],
    )
    def post(self, request):
        """Create shipping method."""
        serializer = AdminShippingMethodSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل إنشاء طريقة الشحن / Failed to create shipping method'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم إنشاء طريقة الشحن / Shipping method created'),
            status_code=status.HTTP_201_CREATED
        )


class AdminShippingMethodDetailView(APIView):
    """Admin Shipping Method Detail"""
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    def get_object(self, pk):
        return get_object_or_404(ShippingMethod, pk=pk)
    
    @extend_schema(
        summary='Update Shipping Method',
        request=AdminShippingMethodSerializer,
        responses={200: AdminShippingMethodSerializer},
        tags=['Admin Settings'],
    )
    def put(self, request, pk):
        """Update shipping method."""
        method = self.get_object(pk)
        serializer = AdminShippingMethodSerializer(method, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تحديث طريقة الشحن / Failed to update shipping method'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message=_('تم تحديث طريقة الشحن / Shipping method updated')
        )
    
    @extend_schema(
        summary='Delete Shipping Method',
        responses={200: OpenApiResponse(description='Method deleted')},
        tags=['Admin Settings'],
    )
    def delete(self, request, pk):
        """Delete shipping method."""
        method = self.get_object(pk)
        method.delete()
        
        return success_response(
            message=_('تم حذف طريقة الشحن / Shipping method deleted')
        )


# =============================================================================
# All Settings View
# عرض جميع الإعدادات
# =============================================================================

class AdminAllSettingsView(APIView):
    """
    Get all admin settings combined.
    جلب جميع إعدادات الأدمن مجمعة.
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Get All Settings',
        description='Get all site settings in one response',
        responses={200: AdminAllSettingsSerializer},
        tags=['Admin Settings'],
    )
    def get(self, request):
        """Get all settings."""
        # Site settings
        site_settings = SiteSettings.get_settings()
        
        # All other settings
        social_links = SocialLink.objects.all().order_by('order')
        languages = Language.objects.all().order_by('order')
        trust_signals = TrustSignal.objects.all().order_by('order')
        payment_methods = PaymentMethod.objects.all().order_by('order')
        shipping_methods = ShippingMethod.objects.all().order_by('order')
        
        # Navigation grouped by location
        nav_base = NavigationItem.objects.filter(parent__isnull=True).order_by('order')
        navigation_data = {
            'header': AdminNavigationItemSerializer(
                nav_base.filter(location='header'), many=True
            ).data,
            'header_mobile': AdminNavigationItemSerializer(
                nav_base.filter(location='header_mobile'), many=True
            ).data,
            'footer_about': AdminNavigationItemSerializer(
                nav_base.filter(location='footer_about'), many=True
            ).data,
            'footer_support': AdminNavigationItemSerializer(
                nav_base.filter(location='footer_support'), many=True
            ).data,
            'footer_legal': AdminNavigationItemSerializer(
                nav_base.filter(location='footer_legal'), many=True
            ).data,
            'sidebar': AdminNavigationItemSerializer(
                nav_base.filter(location='sidebar'), many=True
            ).data,
        }
        
        response_data = {
            'site': AdminSiteSettingsSerializer(site_settings).data,
            'social_links': AdminSocialLinkSerializer(social_links, many=True).data,
            'languages': AdminLanguageSerializer(languages, many=True).data,
            'navigation': navigation_data,
            'trust_signals': AdminTrustSignalSerializer(trust_signals, many=True).data,
            'payment_methods': AdminPaymentMethodSerializer(payment_methods, many=True).data,
            'shipping_methods': AdminShippingMethodSerializer(shipping_methods, many=True).data,
        }
        
        return success_response(
            data=response_data,
            message=_('تم جلب جميع الإعدادات / All settings retrieved')
        )

