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
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from admin_api.permissions import IsAdminUser
from admin_api.serializers.vendors import (
    AdminVendorListSerializer,
    AdminVendorDetailSerializer,
    AdminVendorCreateSerializer,
    AdminVendorWithUserCreateSerializer,
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
        Delete vendor and all related data (except orders).
        حذف البائع وجميع البيانات المرتبطة (ما عدا الطلبات).
        
        Security & Business Rules:
        - Cannot delete vendor if it has orders (to preserve financial records)
        - Deletes: VendorApplication, VendorUser, Products (and related data)
        - Preserves: Orders and OrderItems (for accounting)
        
        الأمان والقواعد التجارية:
        - لا يمكن حذف بائع لديه طلبات (للحفاظ على السجلات المالية)
        - يحذف: طلبات الانضمام، VendorUser، المنتجات (والبيانات المرتبطة)
        - يحافظ على: الطلبات و OrderItems (للمحاسبة)
        """
        vendor = self.get_object(pk)
        
        if not vendor:
            return error_response(
                message=_('البائع غير موجود / Vendor not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Import models here to avoid circular imports
        # استيراد النماذج هنا لتجنب الاستيراد الدائري
        from users.models import VendorUser
        from orders.models import OrderItem
        from vendors.models import VendorApplication
        
        vendor_name = vendor.name
        
        # =================================================================
        # Step 1: Check for Orders (CRITICAL - must preserve financial records)
        # الخطوة 1: التحقق من وجود الطلبات (حرج - يجب الحفاظ على السجلات المالية)
        # =================================================================
        
        # Check if vendor has products with OrderItems
        # التحقق من وجود منتجات للبائع مع OrderItems
        order_items_count = OrderItem.objects.filter(
            product_variant__product__vendor=vendor
        ).count()
        
        if order_items_count > 0:
            # Get unique order count for better error message
            # الحصول على عدد الطلبات الفريدة لرسالة خطأ أفضل
            orders_count = OrderItem.objects.filter(
                product_variant__product__vendor=vendor
            ).values('order').distinct().count()
            
            return error_response(
                message=_(
                    f'لا يمكن حذف البائع لأنه لديه {orders_count} طلب مرتبط. '
                    f'يجب الحفاظ على السجلات المالية. قم بتعطيل البائع بدلاً من ذلك. / '
                    f'Cannot delete vendor with {orders_count} related orders. '
                    f'Financial records must be preserved. Deactivate the vendor instead.'
                ),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # =================================================================
        # Step 2: Delete in transaction (atomic operation)
        # الخطوة 2: الحذف في transaction (عملية ذرية)
        # =================================================================
        
        try:
            with transaction.atomic():
                # Step 2.1: Delete VendorApplication records linked to this vendor
                # الخطوة 2.1: حذف سجلات VendorApplication المرتبطة بهذا البائع
                applications_count = VendorApplication.objects.filter(
                    created_vendor=vendor
                ).count()
                
                if applications_count > 0:
                    VendorApplication.objects.filter(
                        created_vendor=vendor
                    ).delete()
                
                # Step 2.2: Get all VendorUser records for this vendor
                # الخطوة 2.2: الحصول على جميع سجلات VendorUser لهذا البائع
                vendor_users = VendorUser.objects.filter(vendor=vendor).select_related('user')
                vendor_users_list = list(vendor_users)  # Convert to list to avoid query issues
                
                # Step 2.3: Delete Users that are ONLY associated with this vendor
                # الخطوة 2.3: حذف المستخدمين المرتبطين فقط بهذا البائع
                users_to_delete = []
                for vendor_user in vendor_users_list:
                    user = vendor_user.user
                    # Check if user is associated with other vendors
                    # التحقق من أن المستخدم مرتبط ببائعين آخرين
                    other_vendor_users = VendorUser.objects.filter(
                        user=user
                    ).exclude(vendor=vendor)
                    
                    if not other_vendor_users.exists():
                        # User is only associated with this vendor - safe to delete
                        # المستخدم مرتبط فقط بهذا البائع - آمن للحذف
                        users_to_delete.append(user)
                
                # Delete users (if any)
                # حذف المستخدمين (إن وجدوا)
                if users_to_delete:
                    for user in users_to_delete:
                        user.delete()
                
                # Step 2.4: Delete VendorUser records (due to PROTECT constraint)
                # الخطوة 2.4: حذف سجلات VendorUser (بسبب قيد PROTECT)
                if vendor_users_list:
                    VendorUser.objects.filter(vendor=vendor).delete()
                
                # Step 2.5: Delete Vendor (this will cascade delete Products, ProductImages, ProductVariants)
                # الخطوة 2.5: حذف البائع (سيؤدي هذا إلى حذف المنتجات، صور المنتجات، متغيرات المنتجات تلقائياً)
                vendor.delete()
                
        except Exception as e:
            # Log error for debugging
            # تسجيل الخطأ للتشخيص
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error deleting vendor {vendor_name}: {str(e)}', exc_info=True)
            
            return error_response(
                message=_(
                    f'حدث خطأ أثناء حذف البائع. يرجى المحاولة مرة أخرى. / '
                    f'An error occurred while deleting the vendor. Please try again.'
                ),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # =================================================================
        # Step 3: Success response
        # الخطوة 3: استجابة النجاح
        # =================================================================
        
        return success_response(
            message=_(
                f'تم حذف البائع "{vendor_name}" وجميع البيانات المرتبطة بنجاح. / '
                f'Vendor "{vendor_name}" and all related data deleted successfully.'
            )
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


# =============================================================================
# Vendor with User Create View (Complete Vendor Creation)
# عرض إنشاء البائع مع المستخدم (إنشاء بائع كامل)
# =============================================================================

class AdminVendorWithUserCreateView(APIView):
    """
    Create vendor with user account.
    إنشاء بائع مع حساب مستخدم.
    
    This endpoint creates:
    1. Vendor
    2. User (if not exists) or links to existing user
    3. VendorUser (links User to Vendor)
    
    Security:
    - Admin authentication required
    - Validates all inputs
    - Transaction-safe (all or nothing)
    - Generates secure temporary password if creating new user
    - Returns temporary password in response (only once)
    
    هذه النقطة تنشئ:
    1. البائع
    2. المستخدم (إذا لم يكن موجوداً) أو تربط بمستخدم موجود
    3. VendorUser (يربط المستخدم بالبائع)
    
    الأمان:
    - يتطلب مصادقة الأدمن
    - يتحقق من جميع المدخلات
    - آمن للعمليات (كل شيء أو لا شيء)
    - ينشئ كلمة مرور مؤقتة آمنة عند إنشاء مستخدم جديد
    - يُرجع كلمة المرور المؤقتة في الاستجابة (مرة واحدة فقط)
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='Create Vendor with User',
        description='Create a complete vendor account with user (creates User, Vendor, and VendorUser)',
        request=AdminVendorWithUserCreateSerializer,
        responses={
            201: OpenApiResponse(
                description='Vendor created successfully',
                response={
                    'type': 'object',
                    'properties': {
                        'vendor': {'type': 'object'},
                        'user': {'type': 'object'},
                        'temp_password': {'type': 'string', 'description': 'Temporary password (only if new user created)'},
                    }
                }
            ),
            400: OpenApiResponse(description='Validation error'),
        },
        tags=['Admin Vendors'],
    )
    def post(self, request):
        """
        Create vendor with user account.
        إنشاء بائع مع حساب مستخدم.
        
        Request Body:
            - vendor_name: Vendor name (required)
            - vendor_description: Vendor description (optional)
            - vendor_logo: Vendor logo image (optional)
            - vendor_primary_color: Primary color hex (optional, default: #000000)
            - commission_rate: Commission rate 0-100 (optional, default: 10.00)
            - is_active: Vendor is active (optional, default: true)
            - user_email: User email (required)
            - user_full_name: User full name (required)
            - user_phone: User phone (required)
            - use_existing_user: Use existing user (optional, default: false)
            - user_id: Existing user ID (required if use_existing_user=true)
        
        Returns:
            - vendor: Created vendor data
            - user: Created/linked user data
            - temp_password: Temporary password (only if new user created)
        """
        serializer = AdminVendorWithUserCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create vendor with user
            # إنشاء بائع مع مستخدم
            result = serializer.save()
            
            vendor = result['vendor']
            user = result['user']
            temp_password = result.get('temp_password')
            
            # Prepare response data
            # إعداد بيانات الاستجابة
            vendor_serializer = AdminVendorDetailSerializer(
                vendor,
                context={'request': request}
            )
            
            response_data = {
                'vendor': vendor_serializer.data,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'phone': user.phone,
                    'role': user.role,
                    'is_active': user.is_active,
                },
            }
            
            # Include temporary password only if new user was created
            # تضمين كلمة المرور المؤقتة فقط إذا تم إنشاء مستخدم جديد
            if temp_password:
                response_data['temp_password'] = temp_password
                message = _(
                    f'تم إنشاء البائع "{vendor.name}" والمستخدم بنجاح. '
                    f'كلمة المرور المؤقتة: {temp_password} '
                    f'/ Vendor "{vendor.name}" and user created successfully. '
                    f'Temporary password: {temp_password}'
                )
            else:
                message = _(
                    f'تم إنشاء البائع "{vendor.name}" وربطه بالمستخدم بنجاح. '
                    f'/ Vendor "{vendor.name}" created and linked to user successfully.'
                )
            
            return success_response(
                data=response_data,
                message=message,
                status_code=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error creating vendor with user: {str(e)}', exc_info=True)
            
            return error_response(
                message=_('حدث خطأ أثناء إنشاء البائع. يرجى المحاولة مرة أخرى / An error occurred while creating vendor. Please try again'),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

