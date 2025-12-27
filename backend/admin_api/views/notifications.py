"""
Notifications Views
عروض الإشعارات

This file contains all views for notifications management.
هذا الملف يحتوي على جميع views لإدارة الإشعارات.

Endpoints:
- GET /api/v1/admin/notifications/              - List notifications
- GET /api/v1/admin/notifications/unread-count/ - Get unread count
- POST /api/v1/admin/notifications/{id}/mark-as-read/ - Mark as read
- POST /api/v1/admin/notifications/mark-as-read/     - Mark multiple as read
- POST /api/v1/admin/notifications/mark-all-as-read/ - Mark all as read
- GET /api/v1/admin/notifications/stats/        - Get statistics
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from admin_api.permissions import IsAdminUser
from admin_api.throttling import AdminUserRateThrottle
from notifications.models import Notification
from notifications.serializers import (
    NotificationSerializer,
    NotificationResponseSerializer,
    NotificationStatsSerializer,
    MarkAsReadPayloadSerializer,
)
from core.utils import success_response, error_response


# =============================================================================
# Notification List View
# عرض قائمة الإشعارات
# =============================================================================

class NotificationListView(APIView):
    """
    Get list of notifications for the current admin user
    الحصول على قائمة الإشعارات للمستخدم الإداري الحالي
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='List Notifications',
        description='Get list of notifications with optional filters',
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
                description='Filter by notification type (order, user, vendor, system, product, category)',
                required=False,
            ),
            OpenApiParameter(
                name='limit',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Limit number of results',
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
        tags=['Admin Notifications'],
    )
    def get(self, request):
        """
        Get notifications list
        الحصول على قائمة الإشعارات
        """
        # Get filters from query parameters
        is_read = request.query_params.get('is_read')
        notification_type = request.query_params.get('type')
        limit = request.query_params.get('limit', 20)
        offset = request.query_params.get('offset', 0)
        
        try:
            limit = int(limit)
            offset = int(offset)
        except (ValueError, TypeError):
            limit = 20
            offset = 0
        
        # Build query
        # بناء الاستعلام
        queryset = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True)
        )
        
        # Apply filters
        # تطبيق الفلاتر
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        if notification_type:
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
        
        # Get unread count
        # الحصول على عدد غير المقروءة
        unread_count = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
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
            message=_('Notifications retrieved successfully')
        )


# =============================================================================
# Unread Count View
# عرض عدد غير المقروءة
# =============================================================================

class UnreadCountView(APIView):
    """
    Get unread notifications count
    الحصول على عدد الإشعارات غير المقروءة
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Get Unread Count',
        description='Get count of unread notifications',
        responses={
            200: OpenApiResponse(
                response={'unread_count': 5},
                description='Unread notifications count'
            ),
        },
        tags=['Admin Notifications'],
    )
    def get(self, request):
        """
        Get unread count
        الحصول على عدد غير المقروءة
        """
        unread_count = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
            is_read=False
        ).count()
        
        return success_response(
            data={'unread_count': unread_count},
            message=_('Unread count retrieved successfully')
        )


# =============================================================================
# Mark as Read View
# عرض تحديد كمقروء
# =============================================================================

class MarkAsReadView(APIView):
    """
    Mark a single notification as read
    تحديد إشعار واحد كمقروء
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Mark Notification as Read',
        description='Mark a specific notification as read',
        responses={
            200: OpenApiResponse(
                response={'success': True},
                description='Notification marked as read'
            ),
        },
        tags=['Admin Notifications'],
    )
    def post(self, request, pk):
        """
        Mark notification as read
        تحديد الإشعار كمقروء
        """
        try:
            notification = Notification.objects.filter(
                Q(recipient=request.user) | Q(recipient__isnull=True)
            ).get(pk=pk)
            notification.mark_as_read()
            
            return success_response(
                data={'success': True},
                message=_('Notification marked as read')
            )
        except Notification.DoesNotExist:
            return error_response(
                message=_('Notification not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# Mark Multiple as Read View
# عرض تحديد عدة كمقروءة
# =============================================================================

class MarkMultipleAsReadView(APIView):
    """
    Mark multiple notifications as read
    تحديد عدة إشعارات كمقروءة
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Mark Multiple Notifications as Read',
        description='Mark multiple notifications as read',
        request=MarkAsReadPayloadSerializer,
        responses={
            200: OpenApiResponse(
                response={'success': True, 'marked_count': 5},
                description='Notifications marked as read'
            ),
        },
        tags=['Admin Notifications'],
    )
    def post(self, request):
        """
        Mark multiple notifications as read
        تحديد عدة إشعارات كمقروءة
        """
        serializer = MarkAsReadPayloadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('Invalid request data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        notification_ids = serializer.validated_data['notification_ids']
        
        # Mark notifications as read
        # تحديد الإشعارات كمقروءة
        updated = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
            id__in=notification_ids
        ).update(is_read=True, read_at=timezone.now())
        
        return success_response(
            data={
                'success': True,
                'marked_count': updated
            },
            message=_('Notifications marked as read')
        )


# =============================================================================
# Mark All as Read View
# عرض تحديد الكل كمقروء
# =============================================================================

class MarkAllAsReadView(APIView):
    """
    Mark all notifications as read
    تحديد جميع الإشعارات كمقروءة
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Mark All Notifications as Read',
        description='Mark all notifications for the current user as read',
        responses={
            200: OpenApiResponse(
                response={'success': True, 'marked_count': 10},
                description='All notifications marked as read'
            ),
        },
        tags=['Admin Notifications'],
    )
    def post(self, request):
        """
        Mark all notifications as read
        تحديد جميع الإشعارات كمقروءة
        """
        # Mark all unread notifications as read
        # تحديد جميع الإشعارات غير المقروءة كمقروءة
        updated = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True),
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return success_response(
            data={
                'success': True,
                'marked_count': updated
            },
            message=_('All notifications marked as read')
        )


# =============================================================================
# Notification Stats View
# عرض إحصائيات الإشعارات
# =============================================================================

class NotificationStatsView(APIView):
    """
    Get notification statistics
    الحصول على إحصائيات الإشعارات
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Get Notification Statistics',
        description='Get statistics about notifications',
        responses={
            200: NotificationStatsSerializer,
        },
        tags=['Admin Notifications'],
    )
    def get(self, request):
        """
        Get notification statistics
        الحصول على إحصائيات الإشعارات
        """
        # Get notifications for current user
        # الحصول على الإشعارات للمستخدم الحالي
        queryset = Notification.objects.filter(
            Q(recipient=request.user) | Q(recipient__isnull=True)
        )
        
        # Total count
        # العدد الإجمالي
        total = queryset.count()
        
        # Unread count
        # عدد غير المقروءة
        unread = queryset.filter(is_read=False).count()
        
        # Count by type
        # العد حسب النوع
        by_type = queryset.values('type').annotate(
            count=Count('id')
        )
        
        # Format by_type as dictionary
        # تنسيق by_type كقاموس
        by_type_dict = {
            'order': 0,
            'user': 0,
            'vendor': 0,
            'system': 0,
            'product': 0,
            'category': 0,
        }
        
        for item in by_type:
            by_type_dict[item['type']] = item['count']
        
        stats_data = {
            'total': total,
            'unread': unread,
            'by_type': by_type_dict,
        }
        
        serializer = NotificationStatsSerializer(data=stats_data)
        serializer.is_valid()  # This will always be valid as we're creating the data
        
        return success_response(
            data=serializer.validated_data,
            message=_('Statistics retrieved successfully')
        )

