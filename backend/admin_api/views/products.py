"""
Admin Product Views
عروض المنتجات للإدارة

This module contains views for managing products in the admin panel.
هذا الملف يحتوي على عروض لإدارة المنتجات في لوحة الإدارة.

API Endpoints:
    GET    /api/v1/admin/products/           - List all products (with pagination, filters)
    POST   /api/v1/admin/products/           - Create a new product
    GET    /api/v1/admin/products/{id}/      - Get product details
    PUT    /api/v1/admin/products/{id}/      - Update product
    DELETE /api/v1/admin/products/{id}/      - Delete product
    POST   /api/v1/admin/products/bulk-action/ - Bulk actions (activate, deactivate, delete)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Count
from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.serializers.products import (
    AdminProductListSerializer,
    AdminProductDetailSerializer,
    AdminProductCreateSerializer,
    AdminProductUpdateSerializer,
    AdminProductBulkActionSerializer,
    AdminProductVariantSerializer,
    AdminProductVariantCreateSerializer,
    AdminProductImageSerializer,
    AdminProductImageCreateSerializer,
)
from products.models import Product, ProductVariant, ProductImage
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Product List & Create View
# عرض قائمة وإنشاء المنتجات
# =============================================================================

class AdminProductListCreateView(APIView):
    """
    List all products or create a new one.
    عرض جميع المنتجات أو إنشاء منتج جديد.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='List Products',
        description='Get all products with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by name, SKU'),
            OpenApiParameter(name='category', type=int, description='Filter by category ID'),
            OpenApiParameter(name='vendor', type=int, description='Filter by vendor ID'),
            OpenApiParameter(name='status', type=str, description='Filter by status (active, draft, out_of_stock)'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field (name, price, stock, created_at)'),
            OpenApiParameter(name='sort_dir', type=str, description='Sort direction (asc, desc)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        responses={200: AdminProductListSerializer(many=True)},
        tags=['Admin Products'],
    )
    def get(self, request):
        """
        List all products with filtering and pagination.
        عرض جميع المنتجات مع التصفية والترقيم.
        """
        # Start with all products - Optimized queries
        queryset = Product.objects.select_related(
            'vendor',  # Optimize vendor lookups
            'category',  # Optimize category lookups
        ).prefetch_related(
            'variants',  # Optimize variant lookups
            'images',  # Optimize image lookups
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
        
        # Vendor filter
        # فلتر البائع
        vendor = request.query_params.get('vendor')
        if vendor:
            try:
                vendor_id = int(vendor)
                queryset = queryset.filter(vendor_id=vendor_id)
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
        
        # Pagination
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = AdminProductListSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return paginator.get_paginated_response(serializer.data)
        
        serializer = AdminProductListSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Create Product',
        description='Create a new product with optional variants',
        request=AdminProductCreateSerializer,
        responses={201: AdminProductDetailSerializer},
        tags=['Admin Products'],
    )
    def post(self, request):
        """
        Create a new product.
        إنشاء منتج جديد.
        """
        serializer = AdminProductCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            product = serializer.save()
            
            # Return created product with full details
            detail_serializer = AdminProductDetailSerializer(
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

class AdminProductDetailView(APIView):
    """
    Get, update, or delete a single product.
    الحصول على منتج أو تحديثه أو حذفه.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self, pk):
        """Get product by ID"""
        try:
            return Product.objects.select_related(
                'vendor', 'category'
            ).prefetch_related(
                'variants',
                'images',
            ).get(pk=pk)
        except Product.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Product Details',
        description='Get complete product details including variants',
        responses={200: AdminProductDetailSerializer},
        tags=['Admin Products'],
    )
    def get(self, request, pk):
        """
        Get product details.
        الحصول على تفاصيل المنتج.
        """
        product = self.get_object(pk)
        if not product:
            return error_response(
                message=_('المنتج غير موجود / Product not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminProductDetailSerializer(
            product,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update Product',
        description='Update an existing product',
        request=AdminProductUpdateSerializer,
        responses={200: AdminProductDetailSerializer},
        tags=['Admin Products'],
    )
    def put(self, request, pk):
        """
        Update product.
        تحديث المنتج.
        """
        product = self.get_object(pk)
        if not product:
            return error_response(
                message=_('المنتج غير موجود / Product not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminProductUpdateSerializer(
            product,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            product = serializer.save()
            
            detail_serializer = AdminProductDetailSerializer(
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
        summary='Delete Product',
        description='Delete a product and all its variants',
        responses={200: None},
        tags=['Admin Products'],
    )
    def delete(self, request, pk):
        """
        Delete product.
        حذف المنتج.
        """
        product = self.get_object(pk)
        if not product:
            return error_response(
                message=_('المنتج غير موجود / Product not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        product_name = product.name
        product.delete()
        
        return success_response(
            message=_(f'تم حذف المنتج "{product_name}" بنجاح / Product deleted successfully')
        )


# =============================================================================
# Product Bulk Action View
# عرض العمليات المجمعة للمنتجات
# =============================================================================

class AdminProductBulkActionView(APIView):
    """
    Perform bulk actions on multiple products.
    تنفيذ عمليات مجمعة على عدة منتجات.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Bulk Product Actions',
        description='Perform bulk actions (activate, deactivate, delete) on multiple products',
        request=AdminProductBulkActionSerializer,
        responses={200: None},
        tags=['Admin Products'],
    )
    @transaction.atomic
    def post(self, request):
        """
        Perform bulk action.
        تنفيذ عملية مجمعة.
        """
        serializer = AdminProductBulkActionSerializer(data=request.data)
        
        if serializer.is_valid():
            product_ids = serializer.validated_data['product_ids']
            action = serializer.validated_data['action']
            
            products = Product.objects.select_related('vendor', 'category').filter(pk__in=product_ids)
            count = products.count()
            
            if action == 'activate':
                products.update(is_active=True)
                message = _(f'تم تفعيل {count} منتج / {count} products activated')
            
            elif action == 'deactivate':
                products.update(is_active=False)
                message = _(f'تم إلغاء تفعيل {count} منتج / {count} products deactivated')
            
            elif action == 'delete':
                products.delete()
                message = _(f'تم حذف {count} منتج / {count} products deleted')
            
            return success_response(
                message=message,
                data={'affected_count': count}
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Product Variant Views
# عروض متغيرات المنتج
# =============================================================================

class AdminProductVariantListCreateView(APIView):
    """
    List or create product variants.
    عرض أو إنشاء متغيرات المنتج.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_product(self, product_pk):
        """Get product by ID - Optimized query"""
        try:
            return Product.objects.select_related('vendor', 'category').get(pk=product_pk)
        except Product.DoesNotExist:
            return None
    
    @extend_schema(
        summary='List Product Variants',
        description='Get all variants for a product',
        responses={200: AdminProductVariantSerializer(many=True)},
        tags=['Admin Products'],
    )
    def get(self, request, product_pk):
        """
        List product variants.
        عرض متغيرات المنتج.
        """
        product = self.get_product(product_pk)
        if not product:
            return error_response(
                message=_('المنتج غير موجود / Product not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        variants = product.variants.select_related('product').all()
        serializer = AdminProductVariantSerializer(
            variants,
            many=True,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Create Product Variant',
        description='Add a new variant to a product',
        request=AdminProductVariantCreateSerializer,
        responses={201: AdminProductVariantSerializer},
        tags=['Admin Products'],
    )
    def post(self, request, product_pk):
        """
        Create product variant.
        إنشاء متغير للمنتج.
        """
        product = self.get_product(product_pk)
        if not product:
            return error_response(
                message=_('المنتج غير موجود / Product not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminProductVariantCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            variant = serializer.save(product=product)
            
            detail_serializer = AdminProductVariantSerializer(
                variant,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_('تم إنشاء المتغير بنجاح / Variant created successfully'),
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class AdminProductVariantDetailView(APIView):
    """
    Get, update, or delete a product variant.
    الحصول على متغير أو تحديثه أو حذفه.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_variant(self, product_pk, pk):
        """Get variant by product ID and variant ID"""
        try:
            return ProductVariant.objects.select_related(
                'product',
                'product__vendor',
                'product__category',
            ).get(
                product_id=product_pk,
                pk=pk
            )
        except ProductVariant.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Variant Details',
        description='Get variant details',
        responses={200: AdminProductVariantSerializer},
        tags=['Admin Products'],
    )
    def get(self, request, product_pk, pk):
        """Get variant details."""
        variant = self.get_variant(product_pk, pk)
        if not variant:
            return error_response(
                message=_('المتغير غير موجود / Variant not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminProductVariantSerializer(
            variant,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update Variant',
        description='Update a product variant',
        request=AdminProductVariantCreateSerializer,
        responses={200: AdminProductVariantSerializer},
        tags=['Admin Products'],
    )
    def put(self, request, product_pk, pk):
        """Update variant."""
        variant = self.get_variant(product_pk, pk)
        if not variant:
            return error_response(
                message=_('المتغير غير موجود / Variant not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminProductVariantCreateSerializer(
            variant,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            variant = serializer.save()
            
            detail_serializer = AdminProductVariantSerializer(
                variant,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_('تم تحديث المتغير بنجاح / Variant updated successfully')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary='Delete Variant',
        description='Delete a product variant',
        responses={200: None},
        tags=['Admin Products'],
    )
    def delete(self, request, product_pk, pk):
        """Delete variant."""
        variant = self.get_variant(product_pk, pk)
        if not variant:
            return error_response(
                message=_('المتغير غير موجود / Variant not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        variant.delete()
        
        return success_response(
            message=_('تم حذف المتغير بنجاح / Variant deleted successfully')
        )


# =============================================================================
# Product Images Views
# عروض صور المنتج
# =============================================================================

class AdminProductImageListCreateView(APIView):
    """
    List all images for a product or create a new image.
    عرض جميع صور منتج أو إنشاء صورة جديدة.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_product(self, product_pk):
        """Get product by ID - Optimized query"""
        try:
            return Product.objects.select_related('vendor', 'category').get(pk=product_pk)
        except Product.DoesNotExist:
            return None
    
    @extend_schema(
        summary='List Product Images',
        description='Get all images for a product',
        responses={200: AdminProductImageSerializer(many=True)},
        tags=['Admin Products'],
    )
    def get(self, request, product_pk):
        """
        List product images.
        عرض صور المنتج.
        """
        product = self.get_product(product_pk)
        if not product:
            return error_response(
                message=_('المنتج غير موجود / Product not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        images = product.images.all().order_by('display_order', 'created_at')
        serializer = AdminProductImageSerializer(
            images,
            many=True,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Create Product Image',
        description='Add a new image to a product',
        request=AdminProductImageCreateSerializer,
        responses={201: AdminProductImageSerializer},
        tags=['Admin Products'],
    )
    def post(self, request, product_pk):
        """
        Create product image.
        إنشاء صورة للمنتج.
        """
        product = self.get_product(product_pk)
        if not product:
            return error_response(
                message=_('المنتج غير موجود / Product not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminProductImageCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            image = serializer.save(product=product)
            
            detail_serializer = AdminProductImageSerializer(
                image,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_('تم إنشاء الصورة بنجاح / Image created successfully'),
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class AdminProductImageDetailView(APIView):
    """
    Get, update, or delete a product image.
    الحصول على صورة أو تحديثها أو حذفها.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_image(self, product_pk, pk):
        """Get image by product ID and image ID"""
        try:
            return ProductImage.objects.select_related('product').get(
                product_id=product_pk,
                pk=pk
            )
        except ProductImage.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Image Details',
        description='Get image details',
        responses={200: AdminProductImageSerializer},
        tags=['Admin Products'],
    )
    def get(self, request, product_pk, pk):
        """Get image details."""
        image = self.get_image(product_pk, pk)
        if not image:
            return error_response(
                message=_('الصورة غير موجودة / Image not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminProductImageSerializer(
            image,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update Image',
        description='Update a product image',
        request=AdminProductImageCreateSerializer,
        responses={200: AdminProductImageSerializer},
        tags=['Admin Products'],
    )
    def put(self, request, product_pk, pk):
        """Update image."""
        image = self.get_image(product_pk, pk)
        if not image:
            return error_response(
                message=_('الصورة غير موجودة / Image not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminProductImageCreateSerializer(
            image,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            image = serializer.save()
            
            detail_serializer = AdminProductImageSerializer(
                image,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_('تم تحديث الصورة بنجاح / Image updated successfully')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    @extend_schema(
        summary='Delete Image',
        description='Delete a product image',
        responses={200: None},
        tags=['Admin Products'],
    )
    def delete(self, request, product_pk, pk):
        """Delete image."""
        image = self.get_image(product_pk, pk)
        if not image:
            return error_response(
                message=_('الصورة غير موجودة / Image not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        image.delete()
        
        return success_response(
            message=_('تم حذف الصورة بنجاح / Image deleted successfully')
        )

