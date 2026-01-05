"""
Vendor Product Views
عروض منتجات البائع

This module contains views for vendor product management.
هذا الملف يحتوي على عروض لإدارة منتجات البائع.

Security Features:
- Vendor isolation (vendor_id from session, not from request)
- Ownership verification (vendors can only access their own products)
- Optimized queries (select_related, prefetch_related)
- Pagination (required for large systems)

ميزات الأمان:
- عزل البائع (vendor_id من الجلسة، وليس من الطلب)
- التحقق من الملكية (البائعون يمكنهم الوصول فقط لمنتجاتهم)
- استعلامات محسّنة (select_related, prefetch_related)
- التقسيم (مطلوب للأنظمة الكبيرة)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum
from django.db import transaction
import logging
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from vendor_api.permissions import IsVendorUser, IsVendorOwner
from vendor_api.throttling import VendorUserRateThrottle
from vendor_api.serializers.products import (
    VendorProductListSerializer,
    VendorProductDetailSerializer,
    VendorProductCreateSerializer,
    VendorProductUpdateSerializer,
    VendorProductImageCreateSerializer,
    VendorProductVariantStockUpdateSerializer,
    VendorProductVariantCreateSerializer,
)
from products.models import Product, ProductImage, ProductVariant
from users.models import VendorUser
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination

logger = logging.getLogger(__name__)


# =============================================================================
# Helper Functions
# دوال مساعدة
# =============================================================================

def get_vendor_from_user(user):
    """
    Get vendor associated with user.
    Raises VendorUser.DoesNotExist if not found.
    
    الحصول على البائع المرتبط بالمستخدم.
    يرفع VendorUser.DoesNotExist إذا لم يوجد.
    """
    vendor_user = VendorUser.objects.select_related('vendor').get(user=user)
    return vendor_user.vendor


# =============================================================================
# Product List/Create View
# عرض قائمة/إنشاء المنتجات
# =============================================================================

class VendorProductListCreateView(APIView):
    """
    List all products for the authenticated vendor or create a new product.
    عرض جميع منتجات البائع المسجل أو إنشاء منتج جديد.
    
    Security:
    - Only authenticated vendors can access
    - Returns only products belonging to the authenticated vendor
    - Vendor isolation (vendor_id from session, not from request)
    
    الأمان:
    - فقط البائعون المسجلون يمكنهم الوصول
    - يعيد فقط المنتجات التي تنتمي للبائع المسجل
    - عزل البائع (vendor_id من الجلسة، وليس من الطلب)
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='List Vendor Products',
        description='Get all products for the authenticated vendor with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by name, slug'),
            OpenApiParameter(name='category', type=int, description='Filter by category ID'),
            OpenApiParameter(name='status', type=str, description='Filter by status (active, draft, out_of_stock)'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field (name, price, created_at)'),
            OpenApiParameter(name='sort_dir', type=str, description='Sort direction (asc, desc)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page (max 100)'),
        ],
        responses={200: VendorProductListSerializer(many=True)},
        tags=['Vendor Products'],
    )
    def get(self, request):
        """
        List all products for the authenticated vendor.
        عرض جميع منتجات البائع المسجل.
        """
        try:
            vendor = get_vendor_from_user(request.user)
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Start with vendor's products - Optimized queries
        # البدء بمنتجات البائع - استعلامات محسّنة
        queryset = Product.objects.select_related(
            'category',  # Optimize category lookups (vendor already known)
        ).prefetch_related(
            'variants',  # Optimize variant lookups
            'images',  # Optimize image lookups
        ).filter(
            vendor=vendor  # Vendor isolation (security)
        )
        
        # Search filter
        # فلتر البحث
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(slug__icontains=search) |
                Q(variants__sku__icontains=search)
            ).distinct()
        
        # Category filter
        # فلتر الفئة
        category = request.query_params.get('category')
        if category:
            try:
                category_id = int(category)
                queryset = queryset.filter(category_id=category_id)
            except ValueError:
                pass
        
        # Active filter
        # فلتر الحالة
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active)
        
        # Status filter (active, draft, out_of_stock)
        # فلتر الحالة
        status_filter = request.query_params.get('status')
        if status_filter:
            if status_filter == 'draft':
                queryset = queryset.filter(is_active=False)
            elif status_filter == 'out_of_stock':
                # Products with no stock in any variant
                queryset = queryset.filter(is_active=True).annotate(
                    total_stock=Sum('variants__stock_quantity')
                ).filter(Q(total_stock=0) | Q(total_stock__isnull=True))
            elif status_filter == 'active':
                queryset = queryset.filter(is_active=True).annotate(
                    total_stock=Sum('variants__stock_quantity')
                ).filter(total_stock__gt=0)
        
        # Sorting
        # الترتيب
        sort_by = request.query_params.get('sort_by', 'created_at')
        sort_dir = request.query_params.get('sort_dir', 'desc')
        
        sort_fields = {
            'name': 'name',
            'price': 'base_price',
            'created_at': 'created_at',
        }
        
        if sort_by in sort_fields:
            order_field = sort_fields[sort_by]
            if sort_dir == 'desc':
                order_field = f'-{order_field}'
            queryset = queryset.order_by(order_field)
        else:
            queryset = queryset.order_by('-created_at')
        
        # Pagination (required for large systems)
        # التقسيم (مطلوب للأنظمة الكبيرة)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = VendorProductListSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return paginator.get_paginated_response(serializer.data)
        
        serializer = VendorProductListSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Create Vendor Product',
        description='Create a new product for the authenticated vendor (vendor_id set automatically)',
        request=VendorProductCreateSerializer,
        responses={
            201: VendorProductDetailSerializer,
            400: OpenApiResponse(description='Validation error'),
        },
        tags=['Vendor Products'],
    )
    def post(self, request):
        """
        Create a new product for the authenticated vendor.
        vendor_id is set automatically from session (security).
        
        إنشاء منتج جديد للبائع المسجل.
        vendor_id يُضاف تلقائياً من الجلسة (أمان).
        """
        try:
            # Get vendor from session (security)
            # الحصول على البائع من الجلسة (أمان)
            vendor = get_vendor_from_user(request.user)
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Create serializer with vendor in context
        # إنشاء المسلسل مع البائع في السياق
        serializer = VendorProductCreateSerializer(
            data=request.data,
            context={
                'request': request,
                'vendor': vendor  # vendor_id from session (security)
            }
        )
        
        if serializer.is_valid():
            product = serializer.save()
            
            # Return created product with full details
            # إرجاع المنتج المنشأ مع التفاصيل الكاملة
            detail_serializer = VendorProductDetailSerializer(
                product,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_('تم إنشاء المنتج بنجاح / Product created successfully'),
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Product Detail View
# عرض تفاصيل المنتج
# =============================================================================

class VendorProductDetailView(APIView):
    """
    Get, update, or delete a specific product.
    الحصول على، تحديث، أو حذف منتج محدد.
    
    Security:
    - Only authenticated vendors can access
    - Vendors can only access their own products
    - Ownership verification on every request
    
    الأمان:
    - فقط البائعون المسجلون يمكنهم الوصول
    - البائعون يمكنهم الوصول فقط لمنتجاتهم
    - التحقق من الملكية في كل طلب
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self, product_pk, vendor):
        """
        Get product and verify ownership.
        Raises Product.DoesNotExist if not found or not owned by vendor.
        
        الحصول على المنتج والتحقق من الملكية.
        يرفع Product.DoesNotExist إذا لم يوجد أو لم يكن مملوكاً للبائع.
        """
        try:
            product = Product.objects.select_related(
                'category',
                'vendor',
            ).prefetch_related(
                'variants',
                'images',
            ).get(
                pk=product_pk,
                vendor=vendor  # Ownership verification (security)
            )
            return product
        except Product.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Vendor Product',
        description='Get details of a specific product (must belong to authenticated vendor)',
        responses={
            200: VendorProductDetailSerializer,
            404: OpenApiResponse(description='Product not found or not owned by vendor'),
        },
        tags=['Vendor Products'],
    )
    def get(self, request, pk):
        """
        Get product details.
        الحصول على تفاصيل المنتج.
        """
        try:
            vendor = get_vendor_from_user(request.user)
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        product = self.get_object(pk, vendor)
        if not product:
            return error_response(
                message=_('المنتج غير موجود أو لا ينتمي لهذا البائع / Product not found or not owned by this vendor'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = VendorProductDetailSerializer(
            product,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update Vendor Product',
        description='Update a product (must belong to authenticated vendor)',
        request=VendorProductUpdateSerializer,
        responses={
            200: VendorProductDetailSerializer,
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Product not found or not owned by vendor'),
        },
        tags=['Vendor Products'],
    )
    def put(self, request, pk):
        """
        Update product.
        vendor_id cannot be changed (security).
        
        تحديث المنتج.
        vendor_id لا يمكن تغييره (أمان).
        """
        try:
            vendor = get_vendor_from_user(request.user)
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        product = self.get_object(pk, vendor)
        if not product:
            return error_response(
                message=_('المنتج غير موجود أو لا ينتمي لهذا البائع / Product not found or not owned by this vendor'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = VendorProductUpdateSerializer(
            product,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Return updated product with full details
            # إرجاع المنتج المحدث مع التفاصيل الكاملة
            detail_serializer = VendorProductDetailSerializer(
                product,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_('تم تحديث المنتج بنجاح / Product updated successfully')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary='Delete Vendor Product',
        description='Delete a product (must belong to authenticated vendor)',
        responses={
            200: OpenApiResponse(description='Product deleted successfully'),
            404: OpenApiResponse(description='Product not found or not owned by vendor'),
        },
        tags=['Vendor Products'],
    )
    def delete(self, request, pk):
        """
        Delete product.
        CASCADE will delete variants and images.
        
        حذف المنتج.
        CASCADE سيحذف المتغيرات والصور.
        """
        try:
            vendor = get_vendor_from_user(request.user)
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        product = self.get_object(pk, vendor)
        if not product:
            return error_response(
                message=_('المنتج غير موجود أو لا ينتمي لهذا البائع / Product not found or not owned by this vendor'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        product_name = product.name
        
        # Delete product (CASCADE will delete variants and images)
        # حذف المنتج (CASCADE سيحذف المتغيرات والصور)
        product.delete()
        
        return success_response(
            message=_(f'تم حذف المنتج "{product_name}" بنجاح / Product "{product_name}" deleted successfully')
        )


# =============================================================================
# Product Variant Stock Update View
# عرض تحديث مخزون متغيرات المنتج
# =============================================================================

class VendorProductVariantStockUpdateView(APIView):
    """
    Bulk update stock quantities for product variants.
    تحديث كميات المخزون لعدة متغيرات دفعة واحدة.
    
    Security:
    - Only authenticated vendors can access
    - Vendors can only update variants of their own products
    - Ownership verification on every request
    
    الأمان:
    - فقط البائعون المسجلون يمكنهم الوصول
    - البائعون يمكنهم تحديث متغيرات منتجاتهم فقط
    - التحقق من الملكية في كل طلب
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Update Product Variants Stock',
        description='Bulk update stock quantities for multiple variants of a product',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'variants': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'integer'},
                                'stock_quantity': {'type': 'integer', 'minimum': 0}
                            },
                            'required': ['id', 'stock_quantity']
                        }
                    }
                },
                'required': ['variants']
            }
        },
        responses={
            200: VendorProductDetailSerializer,
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Product not found or not owned by vendor'),
        },
        tags=['Vendor Products'],
    )
    def put(self, request, product_pk):
        """
        Update stock quantities for multiple variants.
        تحديث كميات المخزون لعدة متغيرات.
        """
        try:
            vendor = get_vendor_from_user(request.user)
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Verify product ownership
        # التحقق من ملكية المنتج
        try:
            product = Product.objects.select_related('vendor').get(
                pk=product_pk,
                vendor=vendor  # Ownership verification (security)
            )
        except Product.DoesNotExist:
            return error_response(
                message=_('المنتج غير موجود أو لا ينتمي لهذا البائع / Product not found or not owned by this vendor'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Validate request data
        # التحقق من بيانات الطلب
        serializer = VendorProductVariantStockUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        variants_data = serializer.validated_data['variants']
        
        # Get all variant IDs to update
        # الحصول على جميع معرفات المتغيرات للتحديث
        variant_ids = [v['id'] for v in variants_data]
        
        # Verify all variants belong to this product
        # التحقق من أن جميع المتغيرات تنتمي لهذا المنتج
        variants_count = ProductVariant.objects.filter(
            id__in=variant_ids,
            product=product
        ).count()
        
        if variants_count != len(variant_ids):
            return error_response(
                message=_('بعض المتغيرات غير موجودة أو لا تنتمي لهذا المنتج / Some variants not found or do not belong to this product'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Update stock quantities in transaction
        # تحديث كميات المخزون في transaction
        try:
            with transaction.atomic():
                updated_variants = []
                for variant_data in variants_data:
                    variant_id = variant_data['id']
                    stock_quantity = variant_data['stock_quantity']
                    
                    variant = ProductVariant.objects.get(
                        id=variant_id,
                        product=product
                    )
                    variant.stock_quantity = stock_quantity
                    variant.save(update_fields=['stock_quantity', 'updated_at'])
                    updated_variants.append(variant)
                
                # Refresh product from database
                # تحديث المنتج من قاعدة البيانات
                product.refresh_from_db()
                
                # Return updated product with full details
                # إرجاع المنتج المحدث مع التفاصيل الكاملة
                detail_serializer = VendorProductDetailSerializer(
                    product,
                    context={'request': request}
                )
                
                return success_response(
                    data=detail_serializer.data,
                    message=_('تم تحديث المخزون بنجاح / Stock updated successfully'),
                    status_code=status.HTTP_200_OK
                )
        
        except Exception as e:
            logger.error(f'Error updating stock for product {product_pk}: {str(e)}')
            return error_response(
                message=_('حدث خطأ أثناء تحديث المخزون / Error occurred while updating stock'),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =============================================================================
# Product Variant Create View
# عرض إنشاء متغير المنتج
# =============================================================================

class VendorProductVariantCreateView(APIView):
    """
    Create a new variant for a product.
    إنشاء متغير جديد للمنتج.
    
    Security:
    - Only authenticated vendors can access
    - Vendors can only create variants for their own products
    - Ownership verification on every request
    
    الأمان:
    - فقط البائعون المسجلون يمكنهم الوصول
    - البائعون يمكنهم إنشاء متغيرات لمنتجاتهم فقط
    - التحقق من الملكية في كل طلب
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='Create Product Variant',
        description='Create a new variant for a product with stock quantity',
        request=VendorProductVariantCreateSerializer,
        responses={
            201: VendorProductDetailSerializer,
            400: OpenApiResponse(description='Validation error'),
            404: OpenApiResponse(description='Product not found or not owned by vendor'),
        },
        tags=['Vendor Products'],
    )
    def post(self, request, product_pk):
        """
        Create a new variant for a product.
        إنشاء متغير جديد للمنتج.
        """
        try:
            vendor = get_vendor_from_user(request.user)
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Verify product ownership
        # التحقق من ملكية المنتج
        try:
            product = Product.objects.select_related('vendor').get(
                pk=product_pk,
                vendor=vendor  # Ownership verification (security)
            )
        except Product.DoesNotExist:
            return error_response(
                message=_('المنتج غير موجود أو لا ينتمي لهذا البائع / Product not found or not owned by this vendor'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Validate and create variant
        # التحقق وإنشاء المتغير
        serializer = VendorProductVariantCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Create variant
                # إنشاء المتغير
                variant = serializer.save(product=product)
                
                # Refresh product from database
                # تحديث المنتج من قاعدة البيانات
                product.refresh_from_db()
                
                # Return updated product with full details
                # إرجاع المنتج المحدث مع التفاصيل الكاملة
                detail_serializer = VendorProductDetailSerializer(
                    product,
                    context={'request': request}
                )
                
                return success_response(
                    data=detail_serializer.data,
                    message=_('تم إنشاء المتغير بنجاح / Variant created successfully'),
                    status_code=status.HTTP_201_CREATED
                )
        
        except Exception as e:
            logger.error(f'Error creating variant for product {product_pk}: {str(e)}')
            return error_response(
                message=_('حدث خطأ أثناء إنشاء المتغير / Error occurred while creating variant'),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
