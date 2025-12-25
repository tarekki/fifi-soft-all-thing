"""
Admin User Views
عروض المستخدمين للإدارة

This module contains views for managing users in the admin panel.
هذا الملف يحتوي على عروض لإدارة المستخدمين.

API Endpoints:
    GET    /api/v1/admin/users/                - List users
    GET    /api/v1/admin/users/{id}/             - Get user details
    POST   /api/v1/admin/users/                 - Create user
    PUT    /api/v1/admin/users/{id}/             - Update user
    DELETE /api/v1/admin/users/{id}/             - Delete user
    PUT    /api/v1/admin/users/{id}/status/      - Update user status
    POST   /api/v1/admin/users/bulk-action/      - Bulk actions
    GET    /api/v1/admin/users/stats/            - Get statistics

Security:
    - All endpoints require admin authentication
    - Only superusers can delete users or modify superuser status
    - Cannot deactivate or delete superusers

الأمان:
    - جميع النقاط تتطلب مصادقة الأدمن
    - فقط المستخدمون الفائقون يمكنهم حذف المستخدمين أو تعديل حالة المستخدم الفائق
    - لا يمكن تعطيل أو حذف المستخدمين الفائقين

Author: Yalla Buy Team
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.serializers.users import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    AdminUserStatusUpdateSerializer,
    AdminUserBulkActionSerializer,
)
from users.models import User, UserProfile, EmailVerification
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# User List View
# عرض قائمة المستخدمين
# =============================================================================

class AdminUserListView(APIView):
    """
    List all users with filtering and pagination.
    عرض جميع المستخدمين مع التصفية والترقيم.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='List Users',
        description='Get all users with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by email, name, phone'),
            OpenApiParameter(name='role', type=str, description='Filter by role (customer, vendor, admin)'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status'),
            OpenApiParameter(name='is_staff', type=bool, description='Filter by staff status'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field'),
            OpenApiParameter(name='sort_dir', type=str, description='Sort direction (asc, desc)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
        ],
        responses={200: AdminUserListSerializer(many=True)},
        tags=['Admin Users'],
    )
    def get(self, request):
        """
        List all users.
        عرض جميع المستخدمين.
        """
        queryset = User.objects.select_related('profile').prefetch_related('orders')
        
        # Exclude superusers from default list (unless current user is superuser)
        # استبعاد المستخدمين الفائقين من القائمة الافتراضية (ما لم يكن المستخدم الحالي فائقاً)
        if not request.user.is_superuser:
            queryset = queryset.filter(is_superuser=False)
        
        # =================================================================
        # Search Filter
        # فلتر البحث
        # =================================================================
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(full_name__icontains=search) |
                Q(phone__icontains=search)
            )
        
        # =================================================================
        # Role Filter
        # فلتر الدور
        # =================================================================
        role = request.query_params.get('role', '').strip()
        if role and role in ['customer', 'vendor', 'admin']:
            queryset = queryset.filter(role=role)
        
        # =================================================================
        # Active Status Filter
        # فلتر حالة التفعيل
        # =================================================================
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        # =================================================================
        # Staff Status Filter
        # فلتر حالة الموظف
        # =================================================================
        is_staff = request.query_params.get('is_staff')
        if is_staff is not None:
            is_staff_bool = is_staff.lower() == 'true'
            queryset = queryset.filter(is_staff=is_staff_bool)
        
        # =================================================================
        # Sorting
        # الترتيب
        # =================================================================
        sort_by = request.query_params.get('sort_by', 'created_at')
        sort_dir = request.query_params.get('sort_dir', 'desc')
        
        sort_fields = {
            'created_at': 'created_at',
            'email': 'email',
            'full_name': 'full_name',
            'role': 'role',
            'last_login': 'last_login',
        }
        
        if sort_by in sort_fields:
            order_field = sort_fields[sort_by]
            if sort_dir == 'desc':
                order_field = f'-{order_field}'
            queryset = queryset.order_by(order_field)
        else:
            queryset = queryset.order_by('-created_at')
        
        # =================================================================
        # Pagination
        # الترقيم
        # =================================================================
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = AdminUserListSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return paginator.get_paginated_response(serializer.data)
        
        serializer = AdminUserListSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Create User',
        description='Create a new user',
        request=AdminUserCreateSerializer,
        responses={201: AdminUserDetailSerializer},
        tags=['Admin Users'],
    )
    def post(self, request):
        """
        Create a new user.
        إنشاء مستخدم جديد.
        """
        serializer = AdminUserCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.save()
            detail_serializer = AdminUserDetailSerializer(
                user,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم إنشاء المستخدم بنجاح / User created successfully'),
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# User Detail View
# عرض تفاصيل المستخدم
# =============================================================================

class AdminUserDetailView(APIView):
    """
    Get, update, or delete a specific user.
    الحصول على، تحديث، أو حذف مستخدم محدد.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get user by ID"""
        try:
            return User.objects.select_related('profile').prefetch_related(
                'vendor_users__vendor',
                'orders'
            ).get(pk=pk)
        except User.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get User Details',
        description='Get complete user details',
        responses={200: AdminUserDetailSerializer},
        tags=['Admin Users'],
    )
    def get(self, request, pk):
        """
        Get user details.
        الحصول على تفاصيل المستخدم.
        """
        user = self.get_object(pk)
        
        if not user:
            return error_response(
                message=_('المستخدم غير موجود / User not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminUserDetailSerializer(
            user,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update User',
        description='Update user information',
        request=AdminUserUpdateSerializer,
        responses={200: AdminUserDetailSerializer},
        tags=['Admin Users'],
    )
    def put(self, request, pk):
        """
        Update user.
        تحديث المستخدم.
        """
        user = self.get_object(pk)
        
        if not user:
            return error_response(
                message=_('المستخدم غير موجود / User not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions for superuser modifications
        # التحقق من الصلاحيات لتعديلات المستخدم الفائق
        if user.is_superuser and not request.user.is_superuser:
            return error_response(
                message=_('ليس لديك صلاحية لتعديل المستخدم الفائق / You do not have permission to modify superuser'),
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AdminUserUpdateSerializer(
            user,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Prevent non-superusers from modifying superuser status
            # منع غير المستخدمين الفائقين من تعديل حالة المستخدم الفائق
            if 'is_superuser' in serializer.validated_data:
                if not request.user.is_superuser:
                    return error_response(
                        message=_('ليس لديك صلاحية لتعديل حالة المستخدم الفائق / You do not have permission to modify superuser status'),
                        status_code=status.HTTP_403_FORBIDDEN
                    )
            
            updated_user = serializer.save()
            detail_serializer = AdminUserDetailSerializer(
                updated_user,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم تحديث المستخدم بنجاح / User updated successfully')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary='Delete User',
        description='Delete a user (only non-superusers)',
        responses={200: None},
        tags=['Admin Users'],
    )
    def delete(self, request, pk):
        """
        Delete user.
        حذف المستخدم.
        """
        user = self.get_object(pk)
        
        if not user:
            return error_response(
                message=_('المستخدم غير موجود / User not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent deleting superusers
        # منع حذف المستخدمين الفائقين
        if user.is_superuser:
            return error_response(
                message=_('لا يمكن حذف المستخدم الفائق / Cannot delete superuser'),
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent deleting self
        # منع حذف النفس
        if user.id == request.user.id:
            return error_response(
                message=_('لا يمكن حذف حسابك الخاص / Cannot delete your own account'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        user.delete()
        return success_response(
            message=_('تم حذف المستخدم بنجاح / User deleted successfully')
        )


# =============================================================================
# User Status Update View
# عرض تحديث حالة المستخدم
# =============================================================================

class AdminUserStatusUpdateView(APIView):
    """
    Update user active status.
    تحديث حالة تفعيل المستخدم.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get user by ID"""
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Update User Status',
        description='Update user active status',
        request=AdminUserStatusUpdateSerializer,
        responses={200: AdminUserDetailSerializer},
        tags=['Admin Users'],
    )
    def put(self, request, pk):
        """
        Update user status.
        تحديث حالة المستخدم.
        """
        user = self.get_object(pk)
        
        if not user:
            return error_response(
                message=_('المستخدم غير موجود / User not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Ensure is_active is present in request data
        # التأكد من وجود is_active في بيانات الطلب
        if 'is_active' not in request.data:
            return error_response(
                message=_('حقل is_active مطلوب / is_active field is required'),
                errors={'is_active': _('هذا الحقل مطلوب / This field is required')},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Normalize is_active to boolean if it comes as string
        # تحويل is_active إلى boolean إذا جاء كـ string
        request_data = request.data.copy()
        is_active_value = request_data.get('is_active')
        if isinstance(is_active_value, str):
            request_data['is_active'] = is_active_value.lower() in ('true', '1', 'yes', 'on')
        elif not isinstance(is_active_value, bool):
            request_data['is_active'] = bool(is_active_value)
        
        serializer = AdminUserStatusUpdateSerializer(
            data=request_data,
            context={'request': request, 'user': user}
        )
        
        if serializer.is_valid():
            user.is_active = serializer.validated_data['is_active']
            user.save(update_fields=['is_active'])
            
            detail_serializer = AdminUserDetailSerializer(
                user,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم تحديث حالة المستخدم بنجاح / User status updated successfully')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# User Bulk Action View
# عرض العمليات المجمعة
# =============================================================================

class AdminUserBulkActionView(APIView):
    """
    Perform bulk actions on multiple users.
    تنفيذ عمليات مجمعة على عدة مستخدمين.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Bulk User Actions',
        description='Perform bulk actions on selected users',
        request=AdminUserBulkActionSerializer,
        responses={200: None},
        tags=['Admin Users'],
    )
    def post(self, request):
        """
        Perform bulk action.
        تنفيذ عملية مجمعة.
        """
        # Normalize request data
        # توحيد بيانات الطلب
        request_data = request.data.copy()
        
        # Convert user_ids to integers if they come as strings
        # تحويل user_ids إلى integers إذا جاءت كـ strings
        if 'user_ids' in request_data:
            user_ids = request_data['user_ids']
            if isinstance(user_ids, list):
                try:
                    request_data['user_ids'] = [int(uid) for uid in user_ids]
                except (ValueError, TypeError):
                    return error_response(
                        message=_('user_ids يجب أن تكون قائمة من الأرقام / user_ids must be a list of numbers'),
                        errors={'user_ids': _('قيمة غير صالحة / Invalid value')},
                        status_code=status.HTTP_400_BAD_REQUEST
                    )
        
        # Log received data for debugging
        # تسجيل البيانات المستلمة للتشخيص
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Bulk action request: data={request_data}, data_type={type(request_data)}")
        
        serializer = AdminUserBulkActionSerializer(data=request_data)
        
        if not serializer.is_valid():
            logger.error(f"Bulk action validation failed: errors={serializer.errors}")
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        user_ids = serializer.validated_data['user_ids']
        action = serializer.validated_data['action']
        
        users = User.objects.filter(id__in=user_ids)
        
        if action == 'activate':
            count = users.update(is_active=True)
            message = _('تم تفعيل {} مستخدم(ين) / {} user(s) activated').format(count, count)
        elif action == 'deactivate':
            count = users.update(is_active=False)
            message = _('تم تعطيل {} مستخدم(ين) / {} user(s) deactivated').format(count, count)
        elif action == 'delete':
            # Prevent deleting self
            # منع حذف النفس
            users = users.exclude(id=request.user.id)
            count = users.count()
            users.delete()
            message = _('تم حذف {} مستخدم(ين) / {} user(s) deleted').format(count, count)
        else:
            return error_response(
                message=_('إجراء غير صالح / Invalid action'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        return success_response(message=message)


# =============================================================================
# User Statistics View
# عرض إحصائيات المستخدمين
# =============================================================================

class AdminUserStatsView(APIView):
    """
    Get user statistics.
    الحصول على إحصائيات المستخدمين.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='User Statistics',
        description='Get statistics for users',
        responses={200: None},
        tags=['Admin Users'],
    )
    def get(self, request):
        """
        Get user statistics.
        الحصول على إحصائيات المستخدمين.
        """
        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday())
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Count by status
        # العدد حسب الحالة
        total = User.objects.count()
        active = User.objects.filter(is_active=True).count()
        inactive = User.objects.filter(is_active=False).count()
        
        # Count by role
        # العدد حسب الدور
        customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        vendors = User.objects.filter(role=User.Role.VENDOR).count()
        admins = User.objects.filter(role=User.Role.ADMIN).count()
        
        # Count by time
        # العدد حسب الوقت
        this_week = User.objects.filter(created_at__gte=start_of_week).count()
        this_month = User.objects.filter(created_at__gte=start_of_month).count()
        
        # Count verified emails
        # عدد البريد الإلكتروني المُتحقق
        verified_emails = EmailVerification.objects.filter(is_verified=True).count()
        
        stats = {
            'total': total,
            'active': active,
            'inactive': inactive,
            'customers': customers,
            'vendors': vendors,
            'admins': admins,
            'this_week': this_week,
            'this_month': this_month,
            'verified_emails': verified_emails,
        }
        
        return success_response(data=stats)

