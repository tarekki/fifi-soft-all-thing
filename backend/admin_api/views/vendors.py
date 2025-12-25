"""
Admin Vendor Views
عروض البائعين للإدارة

This module contains views for managing vendors in the admin panel.
هذا الملف يحتوي على عروض لإدارة البائعين في لوحة الإدارة.

API Endpoints:
    GET    /api/v1/admin/vendors/                     - List all vendors
    POST   /api/v1/admin/vendors/                     - Create new vendor
    GET    /api/v1/admin/vendors/{id}/                - Get vendor details
    PUT    /api/v1/admin/vendors/{id}/                - Update vendor
    DELETE /api/v1/admin/vendors/{id}/                - Delete vendor
    PUT    /api/v1/admin/vendors/{id}/status/         - Update vendor status
    PUT    /api/v1/admin/vendors/{id}/commission/     - Update commission rate
    POST   /api/v1/admin/vendors/bulk-action/         - Bulk actions

Security:
    - All endpoints require admin authentication
    - Commission changes are validated (0-100%)
    - Bulk actions validate each vendor

الأمان:
    - جميع النقاط تتطلب مصادقة الأدمن
    - تغييرات العمولة مُتحقق منها (0-100%)
    - العمليات المجمعة تتحقق من كل بائع

Author: Yalla Buy Team
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Count
from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.serializers.vendors import (
    AdminVendorListSerializer,
    AdminVendorDetailSerializer,
    AdminVendorCreateSerializer,
    AdminVendorUpdateSerializer,
    AdminVendorStatusUpdateSerializer,
    AdminVendorCommissionUpdateSerializer,
    AdminVendorBulkActionSerializer,
)
from vendors.models import Vendor
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Vendor List & Create View
# عرض قائمة وإنشاء البائعين
# =============================================================================

class AdminVendorListCreateView(APIView):
    """
    List all vendors or create a new one.
    عرض جميع البائعين أو إنشاء بائع جديد.
    
    GET: List with filtering, search, pagination
    POST: Create new vendor
    
    GET: قائمة مع التصفية، البحث، الترقيم
    POST: إنشاء بائع جديد
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='List Vendors',
        description='Get all vendors with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by name, slug, description'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field (name, created_at, commission_rate)'),
            OpenApiParameter(name='sort_dir', type=str, description='Sort direction (asc, desc)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        responses={200: AdminVendorListSerializer(many=True)},
        tags=['Admin Vendors'],
    )
    def get(self, request):
        """
        List all vendors with filtering and pagination.
        عرض جميع البائعين مع التصفية والترقيم.
        """
        # Start with all vendors
        # البدء بجميع البائعين
        queryset = Vendor.objects.all()
        
        # =================================================================
        # Annotate for performance
        # إضافة annotations للأداء
        # =================================================================
        from products.models import ProductVariant
        
        queryset = queryset.annotate(
            products_count_annotated=Count('products', distinct=True),
            total_stock_annotated=Sum('products__variants__stock_quantity'),
        )
        
        # =================================================================
        # Search Filter
        # فلتر البحث
        # =================================================================
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(slug__icontains=search) |
                Q(description__icontains=search)
            )
        
        # =================================================================
        # Active Filter
        # فلتر الحالة
        # =================================================================
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active_bool)
        
        # =================================================================
        # Sorting
        # الترتيب
        # =================================================================
        sort_by = request.query_params.get('sort_by', 'name')
        sort_dir = request.query_params.get('sort_dir', 'asc')
        
        sort_fields = {
            'name': 'name',
            'created_at': 'created_at',
            'commission_rate': 'commission_rate',
            'products_count': 'products_count_annotated',
        }
        
        if sort_by in sort_fields:
            order_field = sort_fields[sort_by]
            if sort_dir == 'desc':
                order_field = f'-{order_field}'
            queryset = queryset.order_by(order_field)
        else:
            queryset = queryset.order_by('name')
        
        # =================================================================
        # Pagination
        # الترقيم
        # =================================================================
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = AdminVendorListSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return paginator.get_paginated_response(serializer.data)
        
        serializer = AdminVendorListSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Create Vendor',
        description='Create a new vendor',
        request=AdminVendorCreateSerializer,
        responses={201: AdminVendorDetailSerializer},
        tags=['Admin Vendors'],
    )
    def post(self, request):
        """
        Create a new vendor.
        إنشاء بائع جديد.
        """
        serializer = AdminVendorCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            vendor = serializer.save()
            
            # Return detailed vendor info
            # إرجاع معلومات البائع المفصلة
            detail_serializer = AdminVendorDetailSerializer(
                vendor,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_('تم إنشاء البائع بنجاح / Vendor created successfully'),
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Vendor Detail View
# عرض تفاصيل البائع
# =============================================================================

class AdminVendorDetailView(APIView):
    """
    Get, update, or delete a vendor.
    الحصول على، تعديل، أو حذف بائع.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self, pk):
        """
        Get vendor by ID
        الحصول على البائع بمعرفه
        """
        try:
            return Vendor.objects.get(pk=pk)
        except Vendor.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Vendor Details',
        description='Get complete vendor details including statistics',
        responses={200: AdminVendorDetailSerializer},
        tags=['Admin Vendors'],
    )
    def get(self, request, pk):
        """
        Get vendor details.
        الحصول على تفاصيل البائع.
        """
        vendor = self.get_object(pk)
        
        if not vendor:
            return error_response(
                message=_('البائع غير موجود / Vendor not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminVendorDetailSerializer(
            vendor,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update Vendor',
        description='Update an existing vendor',
        request=AdminVendorUpdateSerializer,
        responses={200: AdminVendorDetailSerializer},
        tags=['Admin Vendors'],
    )
    def put(self, request, pk):
        """
        Update vendor.
        تعديل البائع.
        """
        vendor = self.get_object(pk)
        
        if not vendor:
            return error_response(
                message=_('البائع غير موجود / Vendor not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminVendorUpdateSerializer(
            vendor,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            vendor = serializer.save()
            
            detail_serializer = AdminVendorDetailSerializer(
                vendor,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_('تم تعديل البائع بنجاح / Vendor updated successfully')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary='Delete Vendor',
        description='Delete a vendor (only if no products)',
        responses={200: None},
        tags=['Admin Vendors'],
    )
    def delete(self, request, pk):
        """
        Delete vendor.
        حذف البائع.
        
        Security:
        - Cannot delete vendor with products
        - Use deactivate instead for vendors with products
        
        الأمان:
        - لا يمكن حذف بائع لديه منتجات
        - استخدم التعطيل بدلاً من الحذف للبائعين الذين لديهم منتجات
        """
        vendor = self.get_object(pk)
        
        if not vendor:
            return error_response(
                message=_('البائع غير موجود / Vendor not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check if vendor has products
        # التحقق من وجود منتجات للبائع
        products_count = vendor.products.count()
        if products_count > 0:
            return error_response(
                message=_(
                    f'لا يمكن حذف البائع لأنه يملك {products_count} منتج. قم بتعطيله بدلاً من ذلك. / '
                    f'Cannot delete vendor with {products_count} products. Deactivate instead.'
                ),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        vendor_name = vendor.name
        vendor.delete()
        
        return success_response(
            message=_(f'تم حذف البائع "{vendor_name}" بنجاح / Vendor "{vendor_name}" deleted successfully')
        )


# =============================================================================
# Vendor Status Update View
# عرض تحديث حالة البائع
# =============================================================================

class AdminVendorStatusUpdateView(APIView):
    """
    Update vendor active status.
    تحديث حالة نشاط البائع.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get vendor by ID"""
        try:
            return Vendor.objects.get(pk=pk)
        except Vendor.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Update Vendor Status',
        description='Activate or deactivate a vendor',
        request=AdminVendorStatusUpdateSerializer,
        responses={200: AdminVendorDetailSerializer},
        tags=['Admin Vendors'],
    )
    def put(self, request, pk):
        """
        Update vendor status.
        تحديث حالة البائع.
        """
        vendor = self.get_object(pk)
        
        if not vendor:
            return error_response(
                message=_('البائع غير موجود / Vendor not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminVendorStatusUpdateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            old_status = 'نشط' if vendor.is_active else 'غير نشط'
            serializer.update(vendor, serializer.validated_data)
            new_status = 'نشط' if vendor.is_active else 'غير نشط'
            
            detail_serializer = AdminVendorDetailSerializer(
                vendor,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_(f'تم تغيير حالة البائع من "{old_status}" إلى "{new_status}" / Status changed')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Vendor Commission Update View
# عرض تحديث عمولة البائع
# =============================================================================

class AdminVendorCommissionUpdateView(APIView):
    """
    Update vendor commission rate.
    تحديث نسبة عمولة البائع.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get vendor by ID"""
        try:
            return Vendor.objects.get(pk=pk)
        except Vendor.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Update Vendor Commission',
        description='Update vendor commission rate (0-100%)',
        request=AdminVendorCommissionUpdateSerializer,
        responses={200: AdminVendorDetailSerializer},
        tags=['Admin Vendors'],
    )
    def put(self, request, pk):
        """
        Update vendor commission rate.
        تحديث نسبة عمولة البائع.
        """
        vendor = self.get_object(pk)
        
        if not vendor:
            return error_response(
                message=_('البائع غير موجود / Vendor not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminVendorCommissionUpdateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            old_rate = vendor.commission_rate
            serializer.update(vendor, serializer.validated_data)
            new_rate = vendor.commission_rate
            
            detail_serializer = AdminVendorDetailSerializer(
                vendor,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_(f'تم تغيير نسبة العمولة من {old_rate}% إلى {new_rate}% / Commission changed')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Vendor Bulk Action View
# عرض العمليات المجمعة للبائعين
# =============================================================================

class AdminVendorBulkActionView(APIView):
    """
    Perform bulk actions on multiple vendors.
    تنفيذ عمليات مجمعة على عدة بائعين.
    
    Supported Actions:
        - activate: Activate vendors
        - deactivate: Deactivate vendors
    
    العمليات المدعومة:
        - activate: تفعيل البائعين
        - deactivate: تعطيل البائعين
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Bulk Vendor Actions',
        description='Perform bulk actions (activate, deactivate) on multiple vendors',
        request=AdminVendorBulkActionSerializer,
        responses={200: None},
        tags=['Admin Vendors'],
    )
    @transaction.atomic
    def post(self, request):
        """
        Perform bulk action on vendors.
        تنفيذ عملية مجمعة على البائعين.
        """
        serializer = AdminVendorBulkActionSerializer(data=request.data)
        
        if serializer.is_valid():
            vendor_ids = serializer.validated_data['vendor_ids']
            action = serializer.validated_data['action']
            
            # Determine new status based on action
            # تحديد الحالة الجديدة بناءً على العملية
            is_active = action == 'activate'
            
            # Update all vendors
            # تحديث جميع البائعين
            updated_count = Vendor.objects.filter(pk__in=vendor_ids).update(
                is_active=is_active,
                updated_at=timezone.now()
            )
            
            action_label = 'تفعيل' if is_active else 'تعطيل'
            
            return success_response(
                message=_(f'تم {action_label} {updated_count} بائع / {updated_count} vendors {action}d'),
                data={'affected_count': updated_count}
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Vendor Statistics View
# عرض إحصائيات البائعين
# =============================================================================

class AdminVendorStatsView(APIView):
    """
    Get vendor statistics for admin dashboard.
    الحصول على إحصائيات البائعين للوحة الإدارة.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Vendor Statistics',
        description='Get overall vendor statistics',
        responses={200: None},
        tags=['Admin Vendors'],
    )
    def get(self, request):
        """
        Get vendor statistics.
        الحصول على إحصائيات البائعين.
        """
        # Total vendors
        # إجمالي البائعين
        total_vendors = Vendor.objects.count()
        active_vendors = Vendor.objects.filter(is_active=True).count()
        inactive_vendors = total_vendors - active_vendors
        
        # Vendors with products
        # البائعون مع منتجات
        vendors_with_products = Vendor.objects.annotate(
            products_count=Count('products')
        ).filter(products_count__gt=0).count()
        
        # Average commission rate
        # متوسط نسبة العمولة
        from django.db.models import Avg
        avg_commission = Vendor.objects.aggregate(
            avg=Avg('commission_rate')
        )['avg'] or 0
        
        stats = {
            'total_vendors': total_vendors,
            'active_vendors': active_vendors,
            'inactive_vendors': inactive_vendors,
            'vendors_with_products': vendors_with_products,
            'vendors_without_products': total_vendors - vendors_with_products,
            'average_commission_rate': round(float(avg_commission), 2),
        }
        
        return success_response(data=stats)

