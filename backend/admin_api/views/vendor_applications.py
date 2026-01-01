"""
Admin Vendor Application Views
عروض طلبات انضمام البائعين للإدارة

This module contains views for managing vendor applications in the admin panel.
هذا الملف يحتوي على عروض لإدارة طلبات انضمام البائعين.

API Endpoints:
    GET    /api/v1/admin/vendor-applications/                - List applications
    GET    /api/v1/admin/vendor-applications/{id}/           - Get application details
    POST   /api/v1/admin/vendor-applications/{id}/approve/   - Approve application
    POST   /api/v1/admin/vendor-applications/{id}/reject/    - Reject application
    GET    /api/v1/admin/vendor-applications/stats/          - Get statistics

Security:
    - All endpoints require admin authentication
    - Only pending applications can be approved/rejected

الأمان:
    - جميع النقاط تتطلب مصادقة الأدمن
    - فقط الطلبات المعلقة يمكن الموافقة عليها أو رفضها

Author: Yalla Buy Team
"""

from decimal import Decimal
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.serializers.vendor_applications import (
    AdminVendorApplicationListSerializer,
    AdminVendorApplicationDetailSerializer,
    AdminVendorApplicationApproveSerializer,
    AdminVendorApplicationRejectSerializer,
)
from vendors.models import VendorApplication
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Vendor Application List View
# عرض قائمة طلبات الانضمام
# =============================================================================

class AdminVendorApplicationListView(APIView):
    """
    List all vendor applications with filtering and pagination.
    عرض جميع طلبات الانضمام مع التصفية والترقيم.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='List Vendor Applications',
        description='Get all vendor applications with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by store name, applicant name, email'),
            OpenApiParameter(name='status', type=str, description='Filter by status (pending, approved, rejected)'),
            OpenApiParameter(name='business_type', type=str, description='Filter by business type'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field'),
            OpenApiParameter(name='sort_dir', type=str, description='Sort direction (asc, desc)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
        ],
        responses={200: AdminVendorApplicationListSerializer(many=True)},
        tags=['Admin Vendor Applications'],
    )
    def get(self, request):
        """
        List all vendor applications.
        عرض جميع طلبات الانضمام.
        """
        queryset = VendorApplication.objects.all()
        
        # =================================================================
        # Search Filter
        # فلتر البحث
        # =================================================================
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(store_name__icontains=search) |
                Q(applicant_name__icontains=search) |
                Q(applicant_email__icontains=search) |
                Q(applicant_phone__icontains=search)
            )
        
        # =================================================================
        # Status Filter
        # فلتر الحالة
        # =================================================================
        status_filter = request.query_params.get('status', '').strip()
        if status_filter and status_filter in ['pending', 'approved', 'rejected']:
            queryset = queryset.filter(status=status_filter)
        
        # =================================================================
        # Business Type Filter
        # فلتر نوع النشاط
        # =================================================================
        business_type = request.query_params.get('business_type', '').strip()
        if business_type:
            queryset = queryset.filter(business_type=business_type)
        
        # =================================================================
        # Sorting
        # الترتيب
        # =================================================================
        sort_by = request.query_params.get('sort_by', 'created_at')
        sort_dir = request.query_params.get('sort_dir', 'desc')
        
        sort_fields = {
            'created_at': 'created_at',
            'store_name': 'store_name',
            'applicant_name': 'applicant_name',
            'status': 'status',
            'reviewed_at': 'reviewed_at',
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
            serializer = AdminVendorApplicationListSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return paginator.get_paginated_response(serializer.data)
        
        serializer = AdminVendorApplicationListSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return success_response(data=serializer.data)


# =============================================================================
# Vendor Application Detail View
# عرض تفاصيل طلب الانضمام
# =============================================================================

class AdminVendorApplicationDetailView(APIView):
    """
    Get vendor application details.
    الحصول على تفاصيل طلب الانضمام.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get application by ID"""
        try:
            return VendorApplication.objects.select_related(
                'user', 'reviewed_by', 'created_vendor'
            ).get(pk=pk)
        except VendorApplication.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Vendor Application Details',
        description='Get complete vendor application details',
        responses={200: AdminVendorApplicationDetailSerializer},
        tags=['Admin Vendor Applications'],
    )
    def get(self, request, pk):
        """
        Get application details.
        الحصول على تفاصيل الطلب.
        """
        application = self.get_object(pk)
        
        if not application:
            return error_response(
                message=_('طلب الانضمام غير موجود / Application not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminVendorApplicationDetailSerializer(
            application,
            context={'request': request}
        )
        return success_response(data=serializer.data)


# =============================================================================
# Vendor Application Approve View
# عرض الموافقة على طلب الانضمام
# =============================================================================

class AdminVendorApplicationApproveView(APIView):
    """
    Approve a vendor application.
    الموافقة على طلب انضمام.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get application by ID"""
        try:
            return VendorApplication.objects.get(pk=pk)
        except VendorApplication.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Approve Vendor Application',
        description='Approve a pending vendor application and create a vendor',
        request=AdminVendorApplicationApproveSerializer,
        responses={200: AdminVendorApplicationDetailSerializer},
        tags=['Admin Vendor Applications'],
    )
    def post(self, request, pk):
        """
        Approve vendor application.
        الموافقة على طلب الانضمام.
        """
        application = self.get_object(pk)
        
        if not application:
            return error_response(
                message=_('طلب الانضمام غير موجود / Application not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminVendorApplicationApproveSerializer(
            data=request.data,
            context={'request': request, 'application': application}
        )
        
        if serializer.is_valid():
            try:
                # Approve and create vendor
                # الموافقة وإنشاء البائع
                commission_rate = serializer.validated_data.get('commission_rate', Decimal("10.00"))
                admin_notes = serializer.validated_data.get('admin_notes', '')
                
                result = application.approve(
                    admin_user=request.user,
                    commission_rate=commission_rate
                )
                
                # Handle both old and new return format (backward compatibility)
                # معالجة كلا التنسيقين القديم والجديد (للتوافق مع الكود القديم)
                if isinstance(result, tuple):
                    vendor, temp_password = result
                else:
                    vendor = result
                    temp_password = None
                
                # Debug logging
                # تسجيل للتشخيص
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f'Vendor application approved: vendor_id={vendor.id}, temp_password={"***" if temp_password else None}')
                
                if admin_notes:
                    application.admin_notes = admin_notes
                    application.save(update_fields=['admin_notes'])
                
                # Return updated application with temp_password if available
                # إرجاع الطلب المحدث مع temp_password إذا كان متاحاً
                detail_serializer = AdminVendorApplicationDetailSerializer(
                    application,
                    context={
                        'request': request,
                        'temp_password': temp_password  # Pass temp_password via context
                    }
                )
                
                response_data = detail_serializer.data
                logger.info(f'Response data temp_password: {response_data.get("temp_password")}')
                
                return success_response(
                    data=response_data,
                    message=_(f'تمت الموافقة على الطلب وإنشاء البائع "{vendor.name}" / Application approved')
                )
                
            except ValueError as e:
                return error_response(
                    message=str(e),
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Vendor Application Reject View
# عرض رفض طلب الانضمام
# =============================================================================

class AdminVendorApplicationRejectView(APIView):
    """
    Reject a vendor application.
    رفض طلب انضمام.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get application by ID"""
        try:
            return VendorApplication.objects.get(pk=pk)
        except VendorApplication.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Reject Vendor Application',
        description='Reject a pending vendor application',
        request=AdminVendorApplicationRejectSerializer,
        responses={200: AdminVendorApplicationDetailSerializer},
        tags=['Admin Vendor Applications'],
    )
    def post(self, request, pk):
        """
        Reject vendor application.
        رفض طلب الانضمام.
        """
        application = self.get_object(pk)
        
        if not application:
            return error_response(
                message=_('طلب الانضمام غير موجود / Application not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminVendorApplicationRejectSerializer(
            data=request.data,
            context={'request': request, 'application': application}
        )
        
        if serializer.is_valid():
            try:
                # Reject application
                # رفض الطلب
                rejection_reason = serializer.validated_data['rejection_reason']
                admin_notes = serializer.validated_data.get('admin_notes', '')
                
                application.reject(
                    admin_user=request.user,
                    reason=rejection_reason
                )
                
                if admin_notes:
                    application.admin_notes = admin_notes
                    application.save(update_fields=['admin_notes'])
                
                # Return updated application
                detail_serializer = AdminVendorApplicationDetailSerializer(
                    application,
                    context={'request': request}
                )
                
                return success_response(
                    data=detail_serializer.data,
                    message=_('تم رفض الطلب / Application rejected')
                )
                
            except ValueError as e:
                return error_response(
                    message=str(e),
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Vendor Application Stats View
# عرض إحصائيات طلبات الانضمام
# =============================================================================

class AdminVendorApplicationStatsView(APIView):
    """
    Get vendor application statistics.
    الحصول على إحصائيات طلبات الانضمام.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Vendor Application Statistics',
        description='Get statistics for vendor applications',
        responses={200: None},
        tags=['Admin Vendor Applications'],
    )
    def get(self, request):
        """
        Get application statistics.
        الحصول على إحصائيات الطلبات.
        """
        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday())
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Count by status
        # العدد حسب الحالة
        total = VendorApplication.objects.count()
        pending = VendorApplication.objects.filter(status='pending').count()
        approved = VendorApplication.objects.filter(status='approved').count()
        rejected = VendorApplication.objects.filter(status='rejected').count()
        
        # Count by time
        # العدد حسب الوقت
        this_week = VendorApplication.objects.filter(
            created_at__gte=start_of_week
        ).count()
        this_month = VendorApplication.objects.filter(
            created_at__gte=start_of_month
        ).count()
        
        stats = {
            'total': total,
            'pending': pending,
            'approved': approved,
            'rejected': rejected,
            'this_week': this_week,
            'this_month': this_month,
        }
        
        return success_response(data=stats)

