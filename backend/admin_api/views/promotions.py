"""
Admin Promotions Views
عروض العروض والحملات للإدارة

This module contains views for Banner, Story, and Coupon CRUD operations in Admin API.
هذا الملف يحتوي على عروض عمليات CRUD للبانرات والقصص والكوبونات في API الإدارة.

Endpoints:
- GET    /api/v1/admin/banners/           - List all banners
- POST   /api/v1/admin/banners/             - Create banner
- GET    /api/v1/admin/banners/{id}/        - Get banner details
- PUT    /api/v1/admin/banners/{id}/        - Update banner
- DELETE /api/v1/admin/banners/{id}/        - Delete banner
- POST   /api/v1/admin/banners/{id}/click/  - Track banner click
- POST   /api/v1/admin/banners/{id}/view/    - Track banner view

- GET    /api/v1/admin/stories/             - List all stories
- POST   /api/v1/admin/stories/              - Create story
- GET    /api/v1/admin/stories/{id}/         - Get story details
- PUT    /api/v1/admin/stories/{id}/         - Update story
- DELETE /api/v1/admin/stories/{id}/         - Delete story
- POST   /api/v1/admin/stories/{id}/view/    - Track story view

- GET    /api/v1/admin/coupons/              - List all coupons
- POST   /api/v1/admin/coupons/              - Create coupon
- GET    /api/v1/admin/coupons/{id}/         - Get coupon details
- PUT    /api/v1/admin/coupons/{id}/         - Update coupon
- DELETE /api/v1/admin/coupons/{id}/         - Delete coupon

- GET    /api/v1/admin/promotions/stats/     - Get promotion statistics

Author: Yalla Buy Team
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Count, F
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.serializers.promotions import (
    AdminBannerListSerializer,
    AdminBannerDetailSerializer,
    AdminBannerCreateSerializer,
    AdminBannerUpdateSerializer,
    AdminStoryListSerializer,
    AdminStoryDetailSerializer,
    AdminStoryCreateSerializer,
    AdminStoryUpdateSerializer,
    AdminCouponListSerializer,
    AdminCouponDetailSerializer,
    AdminCouponCreateSerializer,
    AdminCouponUpdateSerializer,
    AdminPromotionStatsSerializer,
)
from promotions.models import Banner, Story, Coupon
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Banner Views
# عروض البانرات
# =============================================================================

class AdminBannerListCreateView(APIView):
    """
    List all banners or create a new one.
    عرض جميع البانرات أو إنشاء بانر جديد.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='List Banners',
        description='Get all banners with optional filtering',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by title'),
            OpenApiParameter(name='location', type=str, description='Filter by location'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        responses={200: AdminBannerListSerializer(many=True)},
        tags=['Admin Banners'],
    )
    def get(self, request):
        """
        List all banners with filtering and pagination.
        عرض جميع البانرات مع التصفية والترقيم.
        """
        queryset = Banner.objects.all()
        
        # Search filter
        # فلتر البحث
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(title_ar__icontains=search) |
                Q(subtitle__icontains=search) |
                Q(subtitle_ar__icontains=search)
            )
        
        # Location filter
        # فلتر الموقع
        location = request.query_params.get('location')
        if location:
            queryset = queryset.filter(location=location)
        
        # Active filter
        # فلتر الحالة
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active)
        
        # Ordering
        # الترتيب
        queryset = queryset.order_by('order', '-created_at')
        
        # Pagination
        # الترقيم
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        serializer = AdminBannerListSerializer(
            paginated_queryset,
            many=True,
            context={'request': request}
        )
        
        return paginator.get_paginated_response(serializer.data)
    
    @extend_schema(
        summary='Create Banner',
        description='Create a new banner',
        request=AdminBannerCreateSerializer,
        responses={201: AdminBannerDetailSerializer},
        tags=['Admin Banners'],
    )
    def post(self, request):
        """
        Create a new banner.
        إنشاء بانر جديد.
        """
        serializer = AdminBannerCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            banner = serializer.save()
            detail_serializer = AdminBannerDetailSerializer(
                banner,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم إنشاء البانر بنجاح / Banner created successfully'),
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message=_('فشل في إنشاء البانر / Failed to create banner'),
            errors=serializer.errors
        )


class AdminBannerDetailView(APIView):
    """
    Retrieve, update, or delete a specific banner.
    استرجاع أو تحديث أو حذف بانر محدد.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self, pk):
        """Get banner by ID / الحصول على البانر بالمعرف"""
        try:
            return Banner.objects.get(pk=pk)
        except Banner.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Banner Details',
        description='Get detailed information about a banner',
        responses={200: AdminBannerDetailSerializer},
        tags=['Admin Banners'],
    )
    def get(self, request, pk):
        """Get banner details / الحصول على تفاصيل البانر"""
        banner = self.get_object(pk)
        
        if not banner:
            return error_response(
                message=_('البانر غير موجود / Banner not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminBannerDetailSerializer(
            banner,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update Banner',
        description='Update an existing banner',
        request=AdminBannerUpdateSerializer,
        responses={200: AdminBannerDetailSerializer},
        tags=['Admin Banners'],
    )
    def put(self, request, pk):
        """Update banner / تحديث البانر"""
        banner = self.get_object(pk)
        
        if not banner:
            return error_response(
                message=_('البانر غير موجود / Banner not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminBannerUpdateSerializer(
            banner,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            banner = serializer.save()
            detail_serializer = AdminBannerDetailSerializer(
                banner,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم تحديث البانر بنجاح / Banner updated successfully')
            )
        
        return error_response(
            message=_('فشل في تحديث البانر / Failed to update banner'),
            errors=serializer.errors
        )
    
    @extend_schema(
        summary='Delete Banner',
        description='Delete a banner',
        responses={204: None},
        tags=['Admin Banners'],
    )
    def delete(self, request, pk):
        """Delete banner / حذف البانر"""
        banner = self.get_object(pk)
        
        if not banner:
            return error_response(
                message=_('البانر غير موجود / Banner not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        banner.delete()
        return success_response(
            message=_('تم حذف البانر بنجاح / Banner deleted successfully'),
            status_code=status.HTTP_204_NO_CONTENT
        )


class AdminBannerClickView(APIView):
    """
    Track banner click.
    تتبع نقرات البانر.
    """
    
    permission_classes = []  # Public endpoint for tracking
    authentication_classes = []  # No authentication required
    
    @extend_schema(
        summary='Track Banner Click',
        description='Increment click count for a banner',
        responses={200: None},
        tags=['Admin Banners'],
    )
    def post(self, request, pk):
        """Track banner click / تتبع نقرات البانر"""
        try:
            banner = Banner.objects.get(pk=pk)
            banner.increment_click()
            return success_response(
                message=_('تم تسجيل النقرة / Click tracked')
            )
        except Banner.DoesNotExist:
            return error_response(
                message=_('البانر غير موجود / Banner not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )


class AdminBannerViewView(APIView):
    """
    Track banner view.
    تتبع مشاهدات البانر.
    """
    
    permission_classes = []  # Public endpoint for tracking
    authentication_classes = []  # No authentication required
    
    @extend_schema(
        summary='Track Banner View',
        description='Increment view count for a banner',
        responses={200: None},
        tags=['Admin Banners'],
    )
    def post(self, request, pk):
        """Track banner view / تتبع مشاهدات البانر"""
        try:
            banner = Banner.objects.get(pk=pk)
            banner.increment_view()
            return success_response(
                message=_('تم تسجيل المشاهدة / View tracked')
            )
        except Banner.DoesNotExist:
            return error_response(
                message=_('البانر غير موجود / Banner not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# Story Views
# عروض القصص
# =============================================================================

class AdminStoryListCreateView(APIView):
    """
    List all stories or create a new one.
    عرض جميع القصص أو إنشاء قصة جديدة.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='List Stories',
        description='Get all stories with optional filtering',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by title'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        responses={200: AdminStoryListSerializer(many=True)},
        tags=['Admin Stories'],
    )
    def get(self, request):
        """
        List all stories with filtering and pagination.
        عرض جميع القصص مع التصفية والترقيم.
        """
        queryset = Story.objects.all()
        
        # Search filter
        # فلتر البحث
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(title_ar__icontains=search)
            )
        
        # Active filter
        # فلتر الحالة
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active)
        
        # Ordering
        # الترتيب
        queryset = queryset.order_by('order', '-created_at')
        
        # Pagination
        # الترقيم
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        serializer = AdminStoryListSerializer(
            paginated_queryset,
            many=True,
            context={'request': request}
        )
        
        return paginator.get_paginated_response(serializer.data)
    
    @extend_schema(
        summary='Create Story',
        description='Create a new story',
        request=AdminStoryCreateSerializer,
        responses={201: AdminStoryDetailSerializer},
        tags=['Admin Stories'],
    )
    def post(self, request):
        """
        Create a new story.
        إنشاء قصة جديدة.
        """
        serializer = AdminStoryCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            story = serializer.save()
            detail_serializer = AdminStoryDetailSerializer(
                story,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم إنشاء القصة بنجاح / Story created successfully'),
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message=_('فشل في إنشاء القصة / Failed to create story'),
            errors=serializer.errors
        )


class AdminStoryDetailView(APIView):
    """
    Retrieve, update, or delete a specific story.
    استرجاع أو تحديث أو حذف قصة محددة.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self, pk):
        """Get story by ID / الحصول على القصة بالمعرف"""
        try:
            return Story.objects.get(pk=pk)
        except Story.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Story Details',
        description='Get detailed information about a story',
        responses={200: AdminStoryDetailSerializer},
        tags=['Admin Stories'],
    )
    def get(self, request, pk):
        """Get story details / الحصول على تفاصيل القصة"""
        story = self.get_object(pk)
        
        if not story:
            return error_response(
                message=_('القصة غير موجودة / Story not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminStoryDetailSerializer(
            story,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update Story',
        description='Update an existing story',
        request=AdminStoryUpdateSerializer,
        responses={200: AdminStoryDetailSerializer},
        tags=['Admin Stories'],
    )
    def put(self, request, pk):
        """Update story / تحديث القصة"""
        story = self.get_object(pk)
        
        if not story:
            return error_response(
                message=_('القصة غير موجودة / Story not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminStoryUpdateSerializer(
            story,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            story = serializer.save()
            detail_serializer = AdminStoryDetailSerializer(
                story,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم تحديث القصة بنجاح / Story updated successfully')
            )
        
        return error_response(
            message=_('فشل في تحديث القصة / Failed to update story'),
            errors=serializer.errors
        )
    
    @extend_schema(
        summary='Delete Story',
        description='Delete a story',
        responses={204: None},
        tags=['Admin Stories'],
    )
    def delete(self, request, pk):
        """Delete story / حذف القصة"""
        story = self.get_object(pk)
        
        if not story:
            return error_response(
                message=_('القصة غير موجودة / Story not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        story.delete()
        return success_response(
            message=_('تم حذف القصة بنجاح / Story deleted successfully'),
            status_code=status.HTTP_204_NO_CONTENT
        )


class AdminStoryViewView(APIView):
    """
    Track story view.
    تتبع مشاهدات القصة.
    """
    
    permission_classes = []  # Public endpoint for tracking
    authentication_classes = []  # No authentication required
    
    @extend_schema(
        summary='Track Story View',
        description='Increment view count for a story',
        responses={200: None},
        tags=['Admin Stories'],
    )
    def post(self, request, pk):
        """Track story view / تتبع مشاهدات القصة"""
        try:
            story = Story.objects.get(pk=pk)
            story.increment_view()
            return success_response(
                message=_('تم تسجيل المشاهدة / View tracked')
            )
        except Story.DoesNotExist:
            return error_response(
                message=_('القصة غير موجودة / Story not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# Coupon Views
# عروض الكوبونات
# =============================================================================

class AdminCouponListCreateView(APIView):
    """
    List all coupons or create a new one.
    عرض جميع الكوبونات أو إنشاء كوبون جديد.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='List Coupons',
        description='Get all coupons with optional filtering',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by code'),
            OpenApiParameter(name='discount_type', type=str, description='Filter by discount type'),
            OpenApiParameter(name='applicable_to', type=str, description='Filter by applicability'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        responses={200: AdminCouponListSerializer(many=True)},
        tags=['Admin Coupons'],
    )
    def get(self, request):
        """
        List all coupons with filtering and pagination.
        عرض جميع الكوبونات مع التصفية والترقيم.
        """
        queryset = Coupon.objects.all()
        
        # Search filter
        # فلتر البحث
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(code__icontains=search) |
                Q(description__icontains=search) |
                Q(description_ar__icontains=search)
            )
        
        # Discount type filter
        # فلتر نوع الخصم
        discount_type = request.query_params.get('discount_type')
        if discount_type:
            queryset = queryset.filter(discount_type=discount_type)
        
        # Applicable to filter
        # فلتر التطبيق
        applicable_to = request.query_params.get('applicable_to')
        if applicable_to:
            queryset = queryset.filter(applicable_to=applicable_to)
        
        # Active filter
        # فلتر الحالة
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active)
        
        # Ordering
        # الترتيب
        queryset = queryset.order_by('-created_at')
        
        # Pagination
        # الترقيم
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        serializer = AdminCouponListSerializer(
            paginated_queryset,
            many=True,
            context={'request': request}
        )
        
        return paginator.get_paginated_response(serializer.data)
    
    @extend_schema(
        summary='Create Coupon',
        description='Create a new coupon',
        request=AdminCouponCreateSerializer,
        responses={201: AdminCouponDetailSerializer},
        tags=['Admin Coupons'],
    )
    def post(self, request):
        """
        Create a new coupon.
        إنشاء كوبون جديد.
        """
        serializer = AdminCouponCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            coupon = serializer.save()
            detail_serializer = AdminCouponDetailSerializer(
                coupon,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم إنشاء الكوبون بنجاح / Coupon created successfully'),
                status_code=status.HTTP_201_CREATED
            )
        
        return error_response(
            message=_('فشل في إنشاء الكوبون / Failed to create coupon'),
            errors=serializer.errors
        )


class AdminCouponDetailView(APIView):
    """
    Retrieve, update, or delete a specific coupon.
    استرجاع أو تحديث أو حذف كوبون محدد.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self, pk):
        """Get coupon by ID / الحصول على الكوبون بالمعرف"""
        try:
            return Coupon.objects.get(pk=pk)
        except Coupon.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Coupon Details',
        description='Get detailed information about a coupon',
        responses={200: AdminCouponDetailSerializer},
        tags=['Admin Coupons'],
    )
    def get(self, request, pk):
        """Get coupon details / الحصول على تفاصيل الكوبون"""
        coupon = self.get_object(pk)
        
        if not coupon:
            return error_response(
                message=_('الكوبون غير موجود / Coupon not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminCouponDetailSerializer(
            coupon,
            context={'request': request}
        )
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Update Coupon',
        description='Update an existing coupon',
        request=AdminCouponUpdateSerializer,
        responses={200: AdminCouponDetailSerializer},
        tags=['Admin Coupons'],
    )
    def put(self, request, pk):
        """Update coupon / تحديث الكوبون"""
        coupon = self.get_object(pk)
        
        if not coupon:
            return error_response(
                message=_('الكوبون غير موجود / Coupon not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminCouponUpdateSerializer(
            coupon,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            coupon = serializer.save()
            detail_serializer = AdminCouponDetailSerializer(
                coupon,
                context={'request': request}
            )
            return success_response(
                data=detail_serializer.data,
                message=_('تم تحديث الكوبون بنجاح / Coupon updated successfully')
            )
        
        return error_response(
            message=_('فشل في تحديث الكوبون / Failed to update coupon'),
            errors=serializer.errors
        )
    
    @extend_schema(
        summary='Delete Coupon',
        description='Delete a coupon',
        responses={204: None},
        tags=['Admin Coupons'],
    )
    def delete(self, request, pk):
        """Delete coupon / حذف الكوبون"""
        coupon = self.get_object(pk)
        
        if not coupon:
            return error_response(
                message=_('الكوبون غير موجود / Coupon not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        coupon.delete()
        return success_response(
            message=_('تم حذف الكوبون بنجاح / Coupon deleted successfully'),
            status_code=status.HTTP_204_NO_CONTENT
        )


# =============================================================================
# Promotion Stats View
# عرض إحصائيات العروض
# =============================================================================

class AdminPromotionStatsView(APIView):
    """
    Get aggregated statistics for all promotion types.
    الحصول على إحصائيات مجمعة لجميع أنواع العروض.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Get Promotion Statistics',
        description='Get aggregated statistics for banners, stories, and coupons',
        responses={200: AdminPromotionStatsSerializer},
        tags=['Admin Promotions'],
    )
    def get(self, request):
        """
        Get promotion statistics.
        الحصول على إحصائيات العروض.
        """
        now = timezone.now()
        
        # Banner stats
        # إحصائيات البانرات
        banners_total = Banner.objects.count()
        banners_active = Banner.objects.filter(
            is_active=True,
            start_date__lte=now
        ).exclude(
            end_date__lt=now
        ).count() if Banner.objects.filter(is_active=True).exists() else 0
        banners_inactive = banners_total - banners_active
        banners_total_views = Banner.objects.aggregate(
            total=Sum('views')
        )['total'] or 0
        banners_total_clicks = Banner.objects.aggregate(
            total=Sum('clicks')
        )['total'] or 0
        
        # Story stats
        # إحصائيات القصص
        stories_total = Story.objects.count()
        stories_active = Story.objects.filter(
            is_active=True,
            expires_at__gt=now
        ).count()
        stories_inactive = Story.objects.filter(is_active=False).count()
        stories_expired = Story.objects.filter(expires_at__lte=now).count()
        stories_total_views = Story.objects.aggregate(
            total=Sum('views')
        )['total'] or 0
        
        # Coupon stats
        # إحصائيات الكوبونات
        coupons_total = Coupon.objects.count()
        coupons_active = Coupon.objects.filter(
            is_active=True,
            start_date__lte=now
        ).exclude(
            end_date__lt=now
        ).filter(
            Q(usage_limit__isnull=True) | Q(used_count__lt=F('usage_limit'))
        ).count()
        coupons_inactive = Coupon.objects.filter(is_active=False).count()
        coupons_expired = Coupon.objects.filter(
            Q(end_date__lt=now) | Q(usage_limit__isnull=False, used_count__gte=F('usage_limit'))
        ).count()
        coupons_total_used = Coupon.objects.aggregate(
            total=Sum('used_count')
        )['total'] or 0
        # Note: Total discount would require Order integration
        # ملاحظة: إجمالي الخصم يتطلب تكامل مع الطلبات
        coupons_total_discount = 0
        
        stats = {
            'banners_total': banners_total,
            'banners_active': banners_active,
            'banners_inactive': banners_inactive,
            'banners_total_views': banners_total_views,
            'banners_total_clicks': banners_total_clicks,
            'stories_total': stories_total,
            'stories_active': stories_active,
            'stories_inactive': stories_inactive,
            'stories_expired': stories_expired,
            'stories_total_views': stories_total_views,
            'coupons_total': coupons_total,
            'coupons_active': coupons_active,
            'coupons_inactive': coupons_inactive,
            'coupons_expired': coupons_expired,
            'coupons_total_used': coupons_total_used,
            'coupons_total_discount': coupons_total_discount,
        }
        
        serializer = AdminPromotionStatsSerializer(stats)
        return success_response(data=serializer.data)

