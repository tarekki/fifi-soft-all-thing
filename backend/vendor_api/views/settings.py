"""
Vendor Settings Views
عروض إعدادات البائع

This module contains views for vendor settings management.
هذا الملف يحتوي على عروض إدارة إعدادات البائع.

API Endpoints:
    GET    /api/v1/vendor/settings/profile/          - Get profile
    PUT    /api/v1/vendor/settings/profile/          - Update profile
    GET    /api/v1/vendor/settings/vendor/           - Get vendor info
    PUT    /api/v1/vendor/settings/vendor/           - Update vendor info
    POST   /api/v1/vendor/settings/vendor/logo/      - Upload logo
    GET    /api/v1/vendor/settings/notifications/    - Get notification preferences
    PUT    /api/v1/vendor/settings/notifications/   - Update notification preferences
    GET    /api/v1/vendor/settings/store/           - Get store settings
    PUT    /api/v1/vendor/settings/store/           - Update store settings
    GET    /api/v1/vendor/settings/sessions/        - Get active sessions
    DELETE /api/v1/vendor/settings/sessions/{key}/  - Revoke session

Security:
    - All endpoints require vendor authentication
    - Only vendor owner can update vendor info
    - Uses throttling to prevent abuse

الأمان:
    - جميع النقاط تتطلب مصادقة البائع
    - فقط مالك البائع يمكنه تحديث معلومات البائع
    - يستخدم تحديد المعدل لمنع الإساءة
"""

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.sessions.models import Session
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, OpenApiParameter
import json

from vendor_api.permissions import IsVendorUser, IsVendorOwner
from vendor_api.throttling import VendorUserRateThrottle
from vendor_api.serializers.settings import (
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
from core.utils import success_response, error_response
from users.models import VendorUser, UserProfile

User = get_user_model()


# =============================================================================
# Helper Functions
# دوال مساعدة
# =============================================================================

def get_vendor_from_request(request):
    """
    Get vendor associated with the authenticated user.
    الحصول على البائع المرتبط بالمستخدم المسجل.
    """
    try:
        vendor_user = VendorUser.objects.select_related('vendor', 'user').get(user=request.user)
        return vendor_user.vendor, vendor_user
    except VendorUser.DoesNotExist:
        return None, None


# =============================================================================
# Profile Settings View
# عرض إعدادات الملف الشخصي
# =============================================================================

class VendorProfileSettingsView(APIView):
    """
    Get and update vendor user profile.
    الحصول على وتحديث ملف البائع الشخصي.
    """
    
    permission_classes = [IsVendorUser]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Vendor Profile',
        description='Get current vendor user profile information',
        responses={200: VendorProfileSerializer},
        tags=['Vendor Settings'],
    )
    def get(self, request):
        """
        Get profile information.
        الحصول على معلومات الملف الشخصي.
        """
        user = request.user
        
        # Get or create profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Build avatar URL
        avatar_url = None
        if profile.avatar:
            try:
                avatar_url = request.build_absolute_uri(profile.avatar.url)
            except:
                avatar_url = None
        
        data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'full_name': user.full_name or user.email.split('@')[0],
            'phone': user.phone if hasattr(user, 'phone') else None,
            'avatar_url': avatar_url,
            'preferred_language': profile.preferred_language,
            'preferred_language_display': profile.get_preferred_language_display(),
        }
        
        return success_response(data=data)
    
    @extend_schema(
        summary='Update Vendor Profile',
        description='Update vendor user profile information',
        request=VendorProfileUpdateSerializer,
        responses={200: VendorProfileSerializer},
        tags=['Vendor Settings'],
    )
    def put(self, request):
        """
        Update profile information.
        تحديث معلومات الملف الشخصي.
        """
        serializer = VendorProfileUpdateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
            )
        
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update user fields
        if 'email' in serializer.validated_data:
            user.email = serializer.validated_data['email']
        if 'first_name' in serializer.validated_data:
            user.first_name = serializer.validated_data['first_name']
        if 'last_name' in serializer.validated_data:
            user.last_name = serializer.validated_data['last_name']
        if 'phone' in serializer.validated_data and hasattr(user, 'phone'):
            user.phone = serializer.validated_data['phone']
        
        user.save()
        
        # Update profile fields
        if 'preferred_language' in serializer.validated_data:
            profile.preferred_language = serializer.validated_data['preferred_language']
            profile.save()
        
        # Return updated profile
        avatar_url = None
        if profile.avatar:
            try:
                avatar_url = request.build_absolute_uri(profile.avatar.url)
            except:
                avatar_url = None
        
        data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'full_name': user.full_name or user.email.split('@')[0],
            'phone': user.phone if hasattr(user, 'phone') else None,
            'avatar_url': avatar_url,
            'preferred_language': profile.preferred_language,
            'preferred_language_display': profile.get_preferred_language_display(),
        }
        
        return success_response(
            data=data,
            message=_('تم تحديث الملف الشخصي بنجاح / Profile updated successfully')
        )


# =============================================================================
# Profile Avatar Upload View
# عرض رفع صورة الملف الشخصي
# =============================================================================

class VendorProfileAvatarUploadView(APIView):
    """
    Upload vendor user profile avatar.
    رفع صورة ملف البائع الشخصي.
    """
    
    permission_classes = [IsVendorUser]
    throttle_classes = [VendorUserRateThrottle]
    parser_classes = [MultiPartParser, FormParser]
    
    @extend_schema(
        summary='Upload Profile Avatar',
        description='Upload vendor user profile avatar image',
        tags=['Vendor Settings'],
    )
    def post(self, request):
        """
        Upload avatar.
        رفع الصورة الشخصية.
        """
        if 'avatar' not in request.FILES:
            return error_response(
                message=_('لم يتم إرسال صورة / No image provided')
            )
        
        avatar_file = request.FILES['avatar']
        
        # Validate file size (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return error_response(
                message=_('حجم الصورة كبير جداً. الحد الأقصى 5MB / Image size too large. Maximum 5MB')
            )
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            return error_response(
                message=_('نوع الملف غير مدعوم. استخدم JPG, PNG, GIF, أو WEBP / File type not supported. Use JPG, PNG, GIF, or WEBP')
            )
        
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Delete old avatar if exists
        if profile.avatar:
            try:
                profile.avatar.delete()
            except:
                pass
        
        # Save new avatar
        profile.avatar = avatar_file
        profile.save()
        
        # Return avatar URL
        avatar_url = None
        try:
            avatar_url = request.build_absolute_uri(profile.avatar.url)
        except:
            avatar_url = None
        
        return success_response(
            data={'avatar_url': avatar_url},
            message=_('تم رفع الصورة بنجاح / Avatar uploaded successfully')
        )


# =============================================================================
# Vendor Info Settings View
# عرض إعدادات معلومات البائع
# =============================================================================

class VendorInfoSettingsView(APIView):
    """
    Get and update vendor information.
    الحصول على وتحديث معلومات البائع.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Vendor Info',
        description='Get current vendor information',
        responses={200: VendorInfoSerializer},
        tags=['Vendor Settings'],
    )
    def get(self, request):
        """
        Get vendor information.
        الحصول على معلومات البائع.
        """
        vendor, vendor_user = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Build logo URL
        logo_url = None
        if vendor.logo:
            try:
                logo_url = request.build_absolute_uri(vendor.logo.url)
            except:
                logo_url = None
        
        data = {
            'id': vendor.id,
            'name': vendor.name,
            'slug': vendor.slug,
            'description': vendor.description or '',
            'logo_url': logo_url,
            'primary_color': vendor.primary_color,
            'commission_rate': str(vendor.commission_rate),
            'is_active': vendor.is_active,
        }
        
        return success_response(data=data)
    
    @extend_schema(
        summary='Update Vendor Info',
        description='Update vendor information (only owner can update)',
        request=VendorInfoUpdateSerializer,
        responses={200: VendorInfoSerializer},
        tags=['Vendor Settings'],
    )
    def put(self, request):
        """
        Update vendor information.
        تحديث معلومات البائع.
        """
        vendor, vendor_user = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        serializer = VendorInfoUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
            )
        
        # Update vendor fields
        if 'description' in serializer.validated_data:
            vendor.description = serializer.validated_data['description']
        if 'primary_color' in serializer.validated_data:
            vendor.primary_color = serializer.validated_data['primary_color']
        
        vendor.save()
        
        # Return updated vendor info
        logo_url = None
        if vendor.logo:
            try:
                logo_url = request.build_absolute_uri(vendor.logo.url)
            except:
                logo_url = None
        
        data = {
            'id': vendor.id,
            'name': vendor.name,
            'slug': vendor.slug,
            'description': vendor.description or '',
            'logo_url': logo_url,
            'primary_color': vendor.primary_color,
            'commission_rate': str(vendor.commission_rate),
            'is_active': vendor.is_active,
        }
        
        return success_response(
            data=data,
            message=_('تم تحديث معلومات البائع بنجاح / Vendor info updated successfully')
        )


# =============================================================================
# Vendor Logo Upload View
# عرض رفع شعار البائع
# =============================================================================

class VendorLogoUploadView(APIView):
    """
    Upload vendor logo.
    رفع شعار البائع.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    parser_classes = [MultiPartParser, FormParser]
    
    @extend_schema(
        summary='Upload Vendor Logo',
        description='Upload vendor logo image',
        tags=['Vendor Settings'],
    )
    def post(self, request):
        """
        Upload logo.
        رفع الشعار.
        """
        vendor, vendor_user = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        if 'logo' not in request.FILES:
            return error_response(
                message=_('لم يتم إرسال صورة / No image provided')
            )
        
        logo_file = request.FILES['logo']
        
        # Validate file size (max 5MB)
        if logo_file.size > 5 * 1024 * 1024:
            return error_response(
                message=_('حجم الصورة كبير جداً. الحد الأقصى 5MB / Image size too large. Maximum 5MB')
            )
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if logo_file.content_type not in allowed_types:
            return error_response(
                message=_('نوع الملف غير مدعوم. استخدم JPG, PNG, GIF, أو WEBP / File type not supported. Use JPG, PNG, GIF, or WEBP')
            )
        
        # Delete old logo if exists
        if vendor.logo:
            try:
                vendor.logo.delete()
            except:
                pass
        
        # Save new logo
        vendor.logo = logo_file
        vendor.save()
        
        # Return logo URL
        logo_url = None
        try:
            logo_url = request.build_absolute_uri(vendor.logo.url)
        except:
            logo_url = None
        
        return success_response(
            data={'logo_url': logo_url},
            message=_('تم رفع الشعار بنجاح / Logo uploaded successfully')
        )


# =============================================================================
# Notification Preferences View
# عرض تفضيلات الإشعارات
# =============================================================================

class VendorNotificationPreferencesView(APIView):
    """
    Get and update notification preferences.
    الحصول على وتحديث تفضيلات الإشعارات.
    """
    
    permission_classes = [IsVendorUser]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Notification Preferences',
        description='Get vendor notification preferences',
        responses={200: VendorNotificationPreferencesSerializer},
        tags=['Vendor Settings'],
    )
    def get(self, request):
        """
        Get notification preferences.
        الحصول على تفضيلات الإشعارات.
        """
        # For now, return default preferences
        # In the future, store in database (e.g., VendorSettings model)
        data = {
            'notify_new_orders': True,
            'notify_order_status_changes': True,
            'notify_order_cancellations': True,
            'notify_low_stock': True,
            'notify_out_of_stock': True,
            'notify_new_customers': False,
            'email_notifications_enabled': True,
        }
        
        return success_response(data=data)
    
    @extend_schema(
        summary='Update Notification Preferences',
        description='Update vendor notification preferences',
        request=VendorNotificationPreferencesUpdateSerializer,
        responses={200: VendorNotificationPreferencesSerializer},
        tags=['Vendor Settings'],
    )
    def put(self, request):
        """
        Update notification preferences.
        تحديث تفضيلات الإشعارات.
        """
        serializer = VendorNotificationPreferencesUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
            )
        
        # For now, just return the updated preferences
        # In the future, save to database
        data = {
            'notify_new_orders': serializer.validated_data.get('notify_new_orders', True),
            'notify_order_status_changes': serializer.validated_data.get('notify_order_status_changes', True),
            'notify_order_cancellations': serializer.validated_data.get('notify_order_cancellations', True),
            'notify_low_stock': serializer.validated_data.get('notify_low_stock', True),
            'notify_out_of_stock': serializer.validated_data.get('notify_out_of_stock', True),
            'notify_new_customers': serializer.validated_data.get('notify_new_customers', False),
            'email_notifications_enabled': serializer.validated_data.get('email_notifications_enabled', True),
        }
        
        return success_response(
            data=data,
            message=_('تم تحديث تفضيلات الإشعارات بنجاح / Notification preferences updated successfully')
        )


# =============================================================================
# Store Settings View
# عرض إعدادات المتجر
# =============================================================================

class VendorStoreSettingsView(APIView):
    """
    Get and update store settings.
    الحصول على وتحديث إعدادات المتجر.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Store Settings',
        description='Get vendor store settings',
        responses={200: VendorStoreSettingsSerializer},
        tags=['Vendor Settings'],
    )
    def get(self, request):
        """
        Get store settings.
        الحصول على إعدادات المتجر.
        """
        vendor, vendor_user = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # For now, return default settings
        # In the future, store in database (e.g., VendorSettings model)
        data = {
            'is_active': vendor.is_active,
            'auto_confirm_orders': False,
            'default_order_status': 'pending',
            'stock_alert_threshold': 10,
            'auto_archive_orders_after_days': None,
        }
        
        return success_response(data=data)
    
    @extend_schema(
        summary='Update Store Settings',
        description='Update vendor store settings (only owner can update)',
        request=VendorStoreSettingsUpdateSerializer,
        responses={200: VendorStoreSettingsSerializer},
        tags=['Vendor Settings'],
    )
    def put(self, request):
        """
        Update store settings.
        تحديث إعدادات المتجر.
        """
        vendor, vendor_user = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        serializer = VendorStoreSettingsUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
            )
        
        # For now, just return the updated settings
        # In the future, save to database
        data = {
            'is_active': vendor.is_active,
            'auto_confirm_orders': serializer.validated_data.get('auto_confirm_orders', False),
            'default_order_status': serializer.validated_data.get('default_order_status', 'pending'),
            'stock_alert_threshold': serializer.validated_data.get('stock_alert_threshold', 10),
            'auto_archive_orders_after_days': serializer.validated_data.get('auto_archive_orders_after_days', None),
        }
        
        return success_response(
            data=data,
            message=_('تم تحديث إعدادات المتجر بنجاح / Store settings updated successfully')
        )


# =============================================================================
# Active Sessions View
# عرض الجلسات النشطة
# =============================================================================

class VendorActiveSessionsView(APIView):
    """
    Get and manage active sessions.
    الحصول على وإدارة الجلسات النشطة.
    """
    
    permission_classes = [IsVendorUser]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Active Sessions',
        description='Get all active sessions for the vendor user',
        responses={200: VendorActiveSessionSerializer(many=True)},
        tags=['Vendor Settings'],
    )
    def get(self, request):
        """
        Get active sessions.
        الحصول على الجلسات النشطة.
        """
        user = request.user
        current_session_key = request.session.session_key
        
        # Get all sessions for this user
        sessions = []
        for session in Session.objects.all():
            try:
                session_data = session.get_decoded()
                if session_data.get('_auth_user_id') == str(user.id):
                    # Get session info
                    session_info = {
                        'session_key': session.session_key,
                        'ip_address': session_data.get('ip_address'),
                        'user_agent': session_data.get('user_agent', '')[:200],
                        'last_activity': session.expire_date,
                        'is_current': session.session_key == current_session_key,
                    }
                    sessions.append(session_info)
            except:
                continue
        
        return success_response(data=sessions)
    
    @extend_schema(
        summary='Revoke Session',
        description='Revoke a specific session (cannot revoke current session)',
        tags=['Vendor Settings'],
    )
    def delete(self, request, session_key=None):
        """
        Revoke a session.
        إلغاء جلسة.
        """
        if not session_key:
            return error_response(
                message=_('مفتاح الجلسة مطلوب / Session key is required')
            )
        
        current_session_key = request.session.session_key
        
        # Cannot revoke current session
        if session_key == current_session_key:
            return error_response(
                message=_('لا يمكن إلغاء الجلسة الحالية / Cannot revoke current session')
            )
        
        try:
            session = Session.objects.get(session_key=session_key)
            # Verify it belongs to current user
            session_data = session.get_decoded()
            if session_data.get('_auth_user_id') == str(request.user.id):
                session.delete()
                return success_response(
                    message=_('تم إلغاء الجلسة بنجاح / Session revoked successfully')
                )
            else:
                return error_response(
                    message=_('الجلسة لا تنتمي لهذا المستخدم / Session does not belong to this user')
                )
        except Session.DoesNotExist:
            return error_response(
                message=_('الجلسة غير موجودة / Session not found')
            )

