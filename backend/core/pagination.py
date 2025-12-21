"""
Custom Pagination Classes - Unified for Web and Mobile
فئات التقسيم المخصصة - موحدة للويب والموبايل

This module defines custom pagination classes that work for both
web (page-based) and mobile (cursor-based) applications.

هذا الوحدة يعرّف فئات تقسيم مخصصة تعمل لكل من
الويب (مبني على الصفحات) والموبايل (مبني على المؤشر).
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


# ============================================================================
# Standard Pagination (Page-based)
# التقسيم القياسي (مبني على الصفحات)
# ============================================================================

class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class for API responses
    فئة تقسيم قياسية لاستجابات API
    
    Works for both Web and Mobile applications.
    يعمل لكل من تطبيقات الويب والموبايل.
    
    Features:
    - Page-based pagination
    - Configurable page size
    - Standard response format with metadata
    
    الميزات:
    - تقسيم مبني على الصفحات
    - حجم صفحة قابل للتكوين
    - تنسيق استجابة قياسي مع metadata
    """
    
    # Page size: number of items per page
    # حجم الصفحة: عدد العناصر في كل صفحة
    page_size = 24
    
    # Page size query parameter name
    # اسم معامل حجم الصفحة في الـ query string
    page_size_query_param = 'page_size'
    
    # Maximum page size (to prevent abuse)
    # الحد الأقصى لحجم الصفحة (لمنع الإساءة)
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Return a paginated style Response object
        إرجاع كائن Response بتنسيق التقسيم
        
        Standard format:
        {
            "success": true,
            "data": {
                "results": [...],
                "pagination": {
                    "count": 100,
                    "next": "http://...?page=2",
                    "previous": null,
                    "page": 1,
                    "page_size": 24,
                    "total_pages": 5
                }
            },
            "message": "Success",
            "errors": null
        }
        """
        return Response({
            "success": True,
            "data": {
                "results": data,
                "pagination": {
                    "count": self.page.paginator.count,
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                    "page": self.page.number,
                    "page_size": self.page_size,
                    "total_pages": self.page.paginator.num_pages,
                }
            },
            "message": "Success",
            "errors": None,
        })


# ============================================================================
# Large Results Set Pagination (for Admin/Reports)
# تقسيم لمجموعات نتائج كبيرة (للإدارة/التقارير)
# ============================================================================

class LargeResultsSetPagination(PageNumberPagination):
    """
    Pagination for large result sets (Admin, Reports)
    تقسيم لمجموعات نتائج كبيرة (الإدارة، التقارير)
    
    Larger page size for administrative interfaces.
    حجم صفحة أكبر لواجهات إدارية.
    """
    
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500

