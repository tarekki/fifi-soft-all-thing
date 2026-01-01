"""
Vendor Notifications Views
عروض إشعارات البائع

This file contains all views for vendor notifications management.
هذا الملف يحتوي على جميع views لإدارة إشعارات البائع.

Endpoints:
- GET /api/v1/vendor/notifications/              - List notifications
- GET /api/v1/vendor/notifications/unread-count/ - Get unread count
- POST /api/v1/vendor/notifications/{id}/mark-as-read/ - Mark as read
- POST /api/v1/vendor/notifications/mark-as-read/     - Mark multiple as read
- POST /api/v1/vendor/notifications/mark-all-as-read/ - Mark all as read
- GET /api/v1/vendor/notifications/stats/        - Get statistics
"""

from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from vendor_api.permissions import IsVendorUser, IsVendorOwner
from vendor_api.throttling import VendorUserRateThrottle
from notifications.models import Notification
from notifications.serializers import (
    NotificationSerializer,
    NotificationResponseSerializer,
    NotificationStatsSerializer,
    MarkAsReadPayloadSerializer,
)
from core.utils import success_response, error_response
from users.models import VendorUser


# =============================================================================
# Vendor Notification List View
# عرض قائمة إشعارات البائع
# =============================================================================

class VendorNotificationListView(APIView):
    """
    Get list of notifications for the current vendor user.
    الحصول على قائمة الإشعارات لمستخدم البائع الحالي.
    
    Returns notifications related to:
    - Orders for this vendor's products
    - Product-related notifications
    - System notifications for vendors
    
    يعيد الإشعارات المتعلقة بـ:
    - الطلبات لمنتجات هذا البائع
    - الإشعارات المتعلقة بالمنتجات
    - إشعارات النظام للبائعين
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='List Vendor Notifications',
        description='Get list of notifications for the current vendor with optional filters',
        parameters=[
            OpenApiParameter(
                name='is_read',
                type=bool,
                location=OpenApiParameter.QUERY,
                description='Filter by read status',
                required=False,
            ),
            OpenApiParameter(
                name='type',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Filter by notification type (order, product, system)',
                required=False,
            ),
            OpenApiParameter(
                name='limit',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Limit number of results (default: 20, max: 100)',
                required=False,
            ),
            OpenApiParameter(
                name='offset',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Offset for pagination',
                required=False,
            ),
        ],
        responses={
            200: NotificationResponseSerializer,
        },
        tags=['Vendor Notifications'],
    )
    def get(self, request):
        """
        Get notifications list for vendor.
        الحصول على قائمة الإشعارات للبائع.
        """
        # Get vendor user
        # الحصول على مستخدم البائع
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get filters from query parameters
        # الحصول على الفلاتر من معاملات الاستعلام
        is_read = request.query_params.get('is_read')
        notification_type = request.query_params.get('type')
        limit = request.query_params.get('limit', 20)
        offset = request.query_params.get('offset', 0)
        
        try:
            limit = int(limit)
            offset = int(offset)
            # Limit max to 100
            limit = min(limit, 100)
        except (ValueError, TypeError):
            limit = 20
            offset = 0
        
        # Build query - get notifications for this vendor user
        # بناء الاستعلام - الحصول على الإشعارات لمستخدم البائع هذا
        # Filter by:
        # 1. Notifications specifically for this user
        # 2. Notifications for vendor-related events (orders, products)
        # 3. System notifications for vendors
        # التصفية حسب:
        # 1. الإشعارات المخصصة لهذا المستخدم
        # 2. الإشعارات لأحداث متعلقة بالبائع (طلبات، منتجات)
        # 3. إشعارات النظام للبائعين
        
        queryset = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True)
        ).select_related('target_content_type', 'recipient')
        
        # Filter by vendor-related notifications only
        # تصفية إشعارات متعلقة بالبائع فقط
        # Allow: order, product, system notifications
        # السماح: إشعارات الطلبات، المنتجات، النظام
        allowed_types = ['order', 'product', 'system']
        queryset = queryset.filter(type__in=allowed_types)
        
        # Apply filters
        # تطبيق الفلاتر
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        if notification_type:
            if notification_type in allowed_types:
                queryset = queryset.filter(type=notification_type)
        
        # Get total count before pagination
        # الحصول على العدد الإجمالي قبل الترقيم
        total_count = queryset.count()
        
        # Apply pagination
        # تطبيق الترقيم
        queryset = queryset[offset:offset + limit]
        
        # Serialize notifications
        # تسلسل الإشعارات
        notifications = NotificationSerializer(queryset, many=True).data
        
        # Get unread count for this vendor user
        # الحصول على عدد غير المقروءة لمستخدم البائع هذا
        unread_count = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
            type__in=allowed_types,
            is_read=False
        ).count()
        
        # Build response
        # بناء الاستجابة
        response_data = {
            'notifications': notifications,
            'unread_count': unread_count,
            'total_count': total_count,
        }
        
        return success_response(
            data=response_data,
            message=_('تم جلب الإشعارات بنجاح / Notifications retrieved successfully')
        )


# =============================================================================
# Vendor Unread Count View
# عرض عدد الإشعارات غير المقروءة للبائع
# =============================================================================

class VendorUnreadCountView(APIView):
    """
    Get unread notifications count for the current vendor user.
    الحصول على عدد الإشعارات غير المقروءة لمستخدم البائع الحالي.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Unread Notifications Count',
        description='Get count of unread notifications for the current vendor',
        responses={
            200: OpenApiResponse(
                response={'unread_count': 0},
                description='Unread notifications count'
            ),
        },
        tags=['Vendor Notifications'],
    )
    def get(self, request):
        """
        Get unread count.
        الحصول على عدد غير المقروءة.
        """
        # Get vendor user
        # الحصول على مستخدم البائع
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get unread count for vendor-related notifications
        # الحصول على عدد غير المقروءة لإشعارات متعلقة بالبائع
        allowed_types = ['order', 'product', 'system']
        unread_count = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
            type__in=allowed_types,
            is_read=False
        ).count()
        
        return success_response(
            data={'unread_count': unread_count},
            message=_('تم جلب عدد الإشعارات غير المقروءة / Unread count retrieved')
        )


# =============================================================================
# Vendor Mark as Read View
# عرض تحديد إشعار كمقروء للبائع
# =============================================================================

class VendorMarkAsReadView(APIView):
    """
    Mark a notification as read for the current vendor user.
    تحديد إشعار كمقروء لمستخدم البائع الحالي.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Mark Notification as Read',
        description='Mark a specific notification as read',
        responses={
            200: OpenApiResponse(
                response={'success': True},
                description='Notification marked as read'
            ),
        },
        tags=['Vendor Notifications'],
    )
    def post(self, request, pk):
        """
        Mark notification as read.
        تحديد إشعار كمقروء.
        """
        # Get vendor user
        # الحصول على مستخدم البائع
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get notification
        # الحصول على الإشعار
        allowed_types = ['order', 'product', 'system']
        try:
            notification = Notification.objects.filter(
                Q(recipient=request.user) | Q(recipient__isnull=True),
                type__in=allowed_types,
                pk=pk
            ).get()
        except Notification.DoesNotExist:
            return error_response(
                message=_('الإشعار غير موجود / Notification not found'),
                status_code=404
            )
        
        # Mark as read
        # تحديد كمقروء
        notification.mark_as_read()
        
        return success_response(
            data={'success': True},
            message=_('تم تحديد الإشعار كمقروء / Notification marked as read')
        )


# =============================================================================
# Vendor Mark Multiple as Read View
# عرض تحديد عدة إشعارات كمقروءة للبائع
# =============================================================================

class VendorMarkMultipleAsReadView(APIView):
    """
    Mark multiple notifications as read for the current vendor user.
    تحديد عدة إشعارات كمقروءة لمستخدم البائع الحالي.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Mark Multiple Notifications as Read',
        description='Mark multiple notifications as read',
        request=MarkAsReadPayloadSerializer,
        responses={
            200: OpenApiResponse(
                response={'success': True, 'marked_count': 0},
                description='Notifications marked as read'
            ),
        },
        tags=['Vendor Notifications'],
    )
    def post(self, request):
        """
        Mark multiple notifications as read.
        تحديد عدة إشعارات كمقروءة.
        """
        # Get vendor user
        # الحصول على مستخدم البائع
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Validate payload
        # التحقق من البيانات
        serializer = MarkAsReadPayloadSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صحيحة / Invalid data'),
                errors=serializer.errors
            )
        
        notification_ids = serializer.validated_data['notification_ids']
        
        # Get notifications for this vendor user
        # الحصول على الإشعارات لمستخدم البائع هذا
        allowed_types = ['order', 'product', 'system']
        notifications = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
            type__in=allowed_types,
            is_read=False,
            pk__in=notification_ids
        )
        
        # Mark as read
        # تحديد كمقروء
        marked_count = 0
        for notification in notifications:
            notification.mark_as_read()
            marked_count += 1
        
        return success_response(
            data={'success': True, 'marked_count': marked_count},
            message=_('تم تحديد {count} إشعار كمقروء / {count} notifications marked as read').format(count=marked_count)
        )


# =============================================================================
# Vendor Mark All as Read View
# عرض تحديد جميع الإشعارات كمقروءة للبائع
# =============================================================================

class VendorMarkAllAsReadView(APIView):
    """
    Mark all notifications as read for the current vendor user.
    تحديد جميع الإشعارات كمقروءة لمستخدم البائع الحالي.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Mark All Notifications as Read',
        description='Mark all unread notifications as read for the current vendor',
        responses={
            200: OpenApiResponse(
                response={'success': True, 'marked_count': 0},
                description='All notifications marked as read'
            ),
        },
        tags=['Vendor Notifications'],
    )
    def post(self, request):
        """
        Mark all notifications as read.
        تحديد جميع الإشعارات كمقروءة.
        """
        # Get vendor user
        # الحصول على مستخدم البائع
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get all unread notifications for this vendor user
        # الحصول على جميع الإشعارات غير المقروءة لمستخدم البائع هذا
        allowed_types = ['order', 'product', 'system']
        notifications = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
            type__in=allowed_types,
            is_read=False
        )
        
        # Mark all as read
        # تحديد جميعها كمقروءة
        marked_count = 0
        now = timezone.now()
        for notification in notifications:
            notification.is_read = True
            notification.read_at = now
            notification.save(update_fields=['is_read', 'read_at'])
            marked_count += 1
        
        return success_response(
            data={'success': True, 'marked_count': marked_count},
            message=_('تم تحديد {count} إشعار كمقروء / {count} notifications marked as read').format(count=marked_count)
        )


# =============================================================================
# Vendor Notification Stats View
# عرض إحصائيات إشعارات البائع
# =============================================================================

class VendorNotificationStatsView(APIView):
    """
    Get notification statistics for the current vendor user.
    الحصول على إحصائيات الإشعارات لمستخدم البائع الحالي.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Notification Statistics',
        description='Get notification statistics for the current vendor',
        responses={
            200: NotificationStatsSerializer,
        },
        tags=['Vendor Notifications'],
    )
    def get(self, request):
        """
        Get notification stats.
        الحصول على إحصائيات الإشعارات.
        """
        # Get vendor user
        # الحصول على مستخدم البائع
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get stats for vendor-related notifications
        # الحصول على الإحصائيات لإشعارات متعلقة بالبائع
        allowed_types = ['order', 'product', 'system']
        base_queryset = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
            type__in=allowed_types
        )
        
        # Calculate statistics
        # حساب الإحصائيات
        total_count = base_queryset.count()
        unread_count = base_queryset.filter(is_read=False).count()
        read_count = total_count - unread_count
        
        # Count by type
        # العد حسب النوع
        type_counts = base_queryset.values('type').annotate(count=Count('id'))
        type_stats = {item['type']: item['count'] for item in type_counts}
        
        # Build response (matching NotificationStatsSerializer format)
        # بناء الاستجابة (مطابقة تنسيق NotificationStatsSerializer)
        stats_data = {
            'total': total_count,
            'unread': unread_count,
            'by_type': {
                'order': type_stats.get('order', 0),
                'product': type_stats.get('product', 0),
                'system': type_stats.get('system', 0),
                # Add other types with 0 for compatibility
                # إضافة أنواع أخرى بـ 0 للتوافق
                'user': 0,
                'vendor': 0,
                'category': 0,
            },
        }
        
        serializer = NotificationStatsSerializer(data=stats_data)
        if serializer.is_valid():
            return success_response(
                data=serializer.validated_data,
                message=_('تم جلب إحصائيات الإشعارات / Notification statistics retrieved')
            )
        else:
            return error_response(
                message=_('خطأ في البيانات / Data error'),
                errors=serializer.errors
            )

