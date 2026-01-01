"""
Vendor Categories Views
عروض فئات البائع

This module contains views for vendor category access (read-only).
هذا الملف يحتوي على عروض للوصول إلى الفئات للبائع (قراءة فقط).

Security:
- Vendors can only view categories (read-only)
- No create, update, or delete permissions

الأمان:
- البائعون يمكنهم فقط عرض الفئات (قراءة فقط)
- لا توجد صلاحيات إنشاء، تحديث، أو حذف
"""

from rest_framework import status
from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from vendor_api.permissions import IsVendorUser
from vendor_api.throttling import VendorUserRateThrottle
from products.models import Category
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Category Serializer (Simple)
# متسلسل الفئة (بسيط)
# =============================================================================

from rest_framework import serializers

class VendorCategorySerializer(serializers.ModelSerializer):
    """
    Simple category serializer for vendors (read-only)
    متسلسل فئة بسيط للبائعين (قراءة فقط)
    """
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'is_active',
        ]
        read_only_fields = fields


# =============================================================================
# Category List View
# عرض قائمة الفئات
# =============================================================================

class VendorCategoryListView(APIView):
    """
    List categories (read-only for vendors).
    عرض قائمة الفئات (قراءة فقط للبائعين).
    
    GET: List all active categories with optional filtering
    
    Security:
    - Only authenticated vendors can access
    - Read-only access (no create, update, delete)
    
    الأمان:
    - فقط البائعون المسجلون يمكنهم الوصول
    - وصول للقراءة فقط (لا إنشاء، تحديث، حذف)
    """
    
    permission_classes = [IsVendorUser]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='List Categories',
        description='Get all active categories (read-only for vendors)',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by name'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status (default: true)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        responses={200: VendorCategorySerializer(many=True)},
        tags=['Vendor Categories'],
    )
    def get(self, request):
        """
        List all categories (read-only).
        عرض جميع الفئات (قراءة فقط).
        """
        # Start with all categories
        # البدء بجميع الفئات
        queryset = Category.objects.all()
        
        # Search filter
        # فلتر البحث
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(name_ar__icontains=search) |
                Q(slug__icontains=search)
            )
        
        # Active filter (default: only active)
        # فلتر الحالة (افتراضي: فقط النشطة)
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active)
        else:
            # Default: only active categories
            # افتراضي: فقط الفئات النشطة
            queryset = queryset.filter(is_active=True)
        
        # Order by name
        # الترتيب حسب الاسم
        queryset = queryset.order_by('name')
        
        # Pagination (optional, but recommended for large systems)
        # التقسيم (اختياري، لكن موصى به للأنظمة الكبيرة)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = VendorCategorySerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = VendorCategorySerializer(queryset, many=True)
        return success_response(data=serializer.data)

