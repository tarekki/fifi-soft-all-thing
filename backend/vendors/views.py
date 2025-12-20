"""
Vendor Views
عروض البائعين

This module contains ViewSets for Vendor API endpoints.
هذا الملف يحتوي على ViewSets لـ endpoints البائعين
"""

from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vendor
from .serializers import VendorSerializer


class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vendor ViewSet
    ViewSet للبائعين
    
    Provides read-only access to Vendor data.
    يوفر وصول للقراءة فقط لبيانات البائعين
    
    Endpoints:
    - GET /api/vendors/          - List all vendors (with pagination)
    - GET /api/vendors/{id}/     - Retrieve specific vendor details
    
    Features:
    - Filtering by is_active status
    - Search by name
    - Pagination (24 per page)
    - Ordering by name
    """
    
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [AllowAny]  # Public API - anyone can view vendors
    filter_backends = [
        DjangoFilterBackend,      # For filtering
        filters.SearchFilter,     # For searching
        filters.OrderingFilter,   # For ordering
    ]
    
    # Filter fields - allows filtering by these fields
    # حقول الفلترة - يسمح بالفلترة حسب هذه الحقول
    filterset_fields = [
        'is_active',  # Filter by active/inactive vendors
    ]
    
    # Search fields - allows searching in these fields
    # حقول البحث - يسمح بالبحث في هذه الحقول
    search_fields = [
        'name',        # Search by vendor name
        'description', # Search in description
    ]
    
    # Ordering fields - allows ordering by these fields
    # حقول الترتيب - يسمح بالترتيب حسب هذه الحقول
    ordering_fields = [
        'name',        # Order by name (A-Z or Z-A)
        'created_at', # Order by creation date
    ]
    
    # Default ordering
    # الترتيب الافتراضي
    ordering = ['name']  # Default: alphabetical by name
    
    def get_queryset(self):
        """
        Get queryset with optional filtering
        الحصول على queryset مع فلترة اختيارية
        
        By default, returns all vendors.
        By default, can filter by is_active.
        
        Returns:
            QuerySet: Filtered vendor queryset
        """
        queryset = Vendor.objects.all()
        
        # Filter by is_active if provided (optional)
        # الفلترة حسب is_active إذا تم توفيره (اختياري)
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            # Convert string to boolean
            # تحويل النص إلى boolean
            is_active_bool = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset

