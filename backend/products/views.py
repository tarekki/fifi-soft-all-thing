"""
Product Views
عروض المنتجات

This module contains ViewSets for Product API endpoints.
هذا الملف يحتوي على ViewSets لـ endpoints المنتجات
"""

from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from decimal import Decimal

from core.utils import success_response

from .models import Product, ProductVariant
from .serializers import (
    ProductSerializer,
    ProductDetailSerializer,
    ProductVariantSerializer,
)
from vendors.models import Vendor


# Custom FilterSet for advanced filtering
# مجموعة فلاتر مخصصة للفلترة المتقدمة
class ProductFilter(django_filters.FilterSet):
    """
    Product FilterSet
    مجموعة فلاتر المنتجات
    
    Allows filtering products by:
    - vendor (by ID or slug)
    - product_type (shoes/bags)
    - color (from variants)
    - size (from variants)
    - price range (min_price, max_price)
    - is_active status
    """
    
    # Filter by vendor ID
    # الفلترة حسب معرف البائع
    vendor = django_filters.NumberFilter(field_name='vendor__id')
    
    # Filter by vendor slug (e.g., "fifi", "soft")
    # الفلترة حسب slug البائع (مثل "fifi", "soft")
    vendor_slug = django_filters.CharFilter(field_name='vendor__slug', lookup_expr='iexact')
    
    # Filter by product type
    # الفلترة حسب نوع المنتج
    product_type = django_filters.ChoiceFilter(choices=Product.PRODUCT_TYPES)
    
    # Filter by color (from variants)
    # الفلترة حسب اللون (من المتغيرات)
    color = django_filters.CharFilter(field_name='variants__color', lookup_expr='iexact', distinct=True)
    
    # Filter by size (from variants)
    # الفلترة حسب المقاس (من المتغيرات)
    size = django_filters.CharFilter(field_name='variants__size', lookup_expr='iexact', distinct=True)
    
    # Price range filtering
    # الفلترة حسب نطاق السعر
    min_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = [
            'vendor',           # Filter by vendor ID
            'vendor_slug',      # Filter by vendor slug
            'product_type',     # Filter by type (shoes/bags)
            'color',            # Filter by color
            'size',             # Filter by size
            'min_price',        # Minimum price
            'max_price',        # Maximum price
            'is_active',        # Filter by active status
        ]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Product ViewSet
    ViewSet للمنتجات
    
    Provides read-only access to Product data.
    يوفر وصول للقراءة فقط لبيانات المنتجات
    
    Endpoints:
    - GET /api/products/                    - List all products (with pagination)
    - GET /api/products/{id}/               - Retrieve specific product details
    - GET /api/products/{id}/variants/       - Get all variants for a product
    
    Features:
    - Advanced filtering (vendor, type, color, size, price range)
    - Search by name and description
    - Sorting (price, newest, name)
    - Pagination (24 per page)
    """
    
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Public API - anyone can view products
    filter_backends = [
        DjangoFilterBackend,      # For custom filtering
        filters.SearchFilter,     # For searching
        filters.OrderingFilter,   # For ordering
    ]
    
    # Custom filter class
    # كلاس الفلترة المخصص
    filterset_class = ProductFilter
    
    # Search fields - allows searching in these fields
    # حقول البحث - يسمح بالبحث في هذه الحقول
    search_fields = [
        'name',           # Search by product name
        'description',    # Search in description
    ]
    
    # Ordering fields - allows ordering by these fields
    # حقول الترتيب - يسمح بالترتيب حسب هذه الحقول
    ordering_fields = [
        'base_price',     # Order by price (low to high or high to low)
        'created_at',     # Order by creation date (newest/oldest)
        'name',           # Order by name (A-Z or Z-A)
    ]
    
    # Default ordering
    # الترتيب الافتراضي
    ordering = ['-created_at']  # Default: newest first
    
    def get_queryset(self):
        """
        Get queryset with optional filtering
        الحصول على queryset مع فلترة اختيارية
        
        Applies filters and only shows active products by default.
        يطبق الفلاتر ويعرض المنتجات النشطة فقط بشكل افتراضي.
        
        Returns:
            QuerySet: Filtered product queryset
        """
        queryset = Product.objects.select_related('vendor').prefetch_related('variants').all()
        
        # Filter by is_active if provided (optional)
        # الفلترة حسب is_active إذا تم توفيره (اختياري)
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            # Convert string to boolean
            # تحويل النص إلى boolean
            is_active_bool = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active_bool)
        else:
            # Default: show only active products
            # الافتراضي: عرض المنتجات النشطة فقط
            queryset = queryset.filter(is_active=True)
        
        return queryset
    
    def get_serializer_class(self):
        """
        Return appropriate serializer class based on action
        إرجاع كلاس المسلسل المناسب حسب الإجراء
        
        - List: ProductSerializer (basic info)
        - Retrieve: ProductDetailSerializer (with variants)
        - Other: ProductSerializer
        """
        if self.action == 'retrieve':
            # For detail view, use ProductDetailSerializer (includes variants)
            # لعرض التفاصيل، استخدم ProductDetailSerializer (يتضمن المتغيرات)
            return ProductDetailSerializer
        return ProductSerializer
    
    @action(detail=True, methods=['get'], url_path='variants')
    def variants(self, request, pk=None):
        """
        Get all variants for a specific product
        الحصول على جميع المتغيرات لمنتج معين
        
        Endpoint: GET /api/products/{id}/variants/
        
        Returns:
            Response: List of all variants for the product
        """
        product = self.get_object()
        variants = product.variants.all()
        
        # Serialize variants
        # تسلسل المتغيرات
        serializer = ProductVariantSerializer(
            variants,
            many=True,
            context={'request': request}
        )
        
        return success_response(
            data={
                'product_id': product.id,
                'product_name': product.name,
                'variants': serializer.data,
                'count': variants.count(),
            },
            message='Product variants retrieved successfully.',
            status_code=status.HTTP_200_OK
        )

