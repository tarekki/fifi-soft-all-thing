"""
Admin Categories Views
عروض الفئات للإدارة

This module contains views for Category CRUD operations in Admin API.
هذا الملف يحتوي على عروض عمليات CRUD للفئات في API الإدارة.

Endpoints:
- GET    /api/v1/admin/categories/           - List all categories
- POST   /api/v1/admin/categories/           - Create category
- GET    /api/v1/admin/categories/{id}/      - Get category details
- PUT    /api/v1/admin/categories/{id}/      - Update category
- DELETE /api/v1/admin/categories/{id}/      - Delete category
- GET    /api/v1/admin/categories/tree/      - Get categories as tree
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.serializers.categories import (
    AdminCategoryListSerializer,
    AdminCategoryDetailSerializer,
    AdminCategoryCreateSerializer,
    AdminCategoryUpdateSerializer,
    AdminCategoryTreeSerializer,
)
from products.models import Category
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Category List & Create View
# عرض قائمة وإنشاء الفئات
# =============================================================================

class AdminCategoryListCreateView(APIView):
    """
    List all categories or create a new one.
    عرض جميع الفئات أو إنشاء فئة جديدة.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @extend_schema(
        summary='List Categories',
        description='Get all categories with optional filtering',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by name'),
            OpenApiParameter(name='is_active', type=bool, description='Filter by active status'),
            OpenApiParameter(name='is_featured', type=bool, description='Filter by featured status'),
            OpenApiParameter(name='parent', type=int, description='Filter by parent ID (null for root)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        responses={200: AdminCategoryListSerializer(many=True)},
        tags=['Admin Categories'],
    )
    def get(self, request):
        """
        List all categories with filtering and pagination.
        عرض جميع الفئات مع التصفية والترقيم.
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
        
        # Active filter
        # فلتر الحالة
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active)
        
        # Featured filter
        # فلتر المميز
        is_featured = request.query_params.get('is_featured')
        if is_featured is not None:
            is_featured = is_featured.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_featured=is_featured)
        
        # Parent filter
        # فلتر الأب
        parent = request.query_params.get('parent')
        if parent is not None:
            if parent.lower() in ('null', 'none', ''):
                queryset = queryset.filter(parent__isnull=True)
            else:
                try:
                    parent_id = int(parent)
                    queryset = queryset.filter(parent_id=parent_id)
                except ValueError:
                    pass
        
        # Order by display_order and name
        # ترتيب حسب ترتيب العرض والاسم
        queryset = queryset.order_by('display_order', 'name')
        
        # Pagination
        # الترقيم
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = AdminCategoryListSerializer(
                page,
                many=True,
                context={'request': request}
            )
            # Return in format expected by frontend
            # إرجاع بالتنسيق المتوقع من الـ Frontend
            return success_response(
                data={
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': serializer.data,
                },
                message=_('تم جلب الفئات بنجاح / Categories retrieved successfully')
            )
        
        # No pagination (all results)
        serializer = AdminCategoryListSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        
        return success_response(
            data={
                'count': queryset.count(),
                'next': None,
                'previous': None,
                'results': serializer.data,
            },
            message=_('تم جلب الفئات بنجاح / Categories retrieved successfully')
        )
    
    @extend_schema(
        summary='Create Category',
        description='Create a new category',
        request=AdminCategoryCreateSerializer,
        responses={201: AdminCategoryDetailSerializer},
        tags=['Admin Categories'],
    )
    def post(self, request):
        """
        Create a new category.
        إنشاء فئة جديدة.
        """
        serializer = AdminCategoryCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Save the category
        # حفظ الفئة
        category = serializer.save()
        
        # Return full details
        # إرجاع التفاصيل الكاملة
        detail_serializer = AdminCategoryDetailSerializer(
            category,
            context={'request': request}
        )
        
        return success_response(
            data=detail_serializer.data,
            message=_('تم إنشاء الفئة بنجاح / Category created successfully'),
            status_code=status.HTTP_201_CREATED
        )


# =============================================================================
# Category Detail View
# عرض تفاصيل الفئة
# =============================================================================

class AdminCategoryDetailView(APIView):
    """
    Retrieve, update or delete a category.
    استرجاع أو تحديث أو حذف فئة.
    """
    
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self, pk):
        """Get category by ID"""
        try:
            return Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Category Details',
        description='Get detailed information about a specific category',
        responses={200: AdminCategoryDetailSerializer},
        tags=['Admin Categories'],
    )
    def get(self, request, pk):
        """
        Get category details.
        الحصول على تفاصيل الفئة.
        """
        category = self.get_object(pk)
        
        if not category:
            return error_response(
                message=_('الفئة غير موجودة / Category not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminCategoryDetailSerializer(
            category,
            context={'request': request}
        )
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب تفاصيل الفئة / Category details retrieved')
        )
    
    @extend_schema(
        summary='Update Category',
        description='Update an existing category',
        request=AdminCategoryUpdateSerializer,
        responses={200: AdminCategoryDetailSerializer},
        tags=['Admin Categories'],
    )
    def put(self, request, pk):
        """
        Update a category.
        تحديث فئة.
        """
        category = self.get_object(pk)
        
        if not category:
            return error_response(
                message=_('الفئة غير موجودة / Category not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminCategoryUpdateSerializer(
            category,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Save updates
        # حفظ التحديثات
        category = serializer.save()
        
        # Return full details
        detail_serializer = AdminCategoryDetailSerializer(
            category,
            context={'request': request}
        )
        
        return success_response(
            data=detail_serializer.data,
            message=_('تم تحديث الفئة بنجاح / Category updated successfully')
        )
    
    @extend_schema(
        summary='Delete Category',
        description='Delete a category (products will be unassigned)',
        responses={204: None},
        tags=['Admin Categories'],
    )
    def delete(self, request, pk):
        """
        Delete a category.
        حذف فئة.
        
        Note: Products in this category will have their category set to null.
        ملاحظة: المنتجات في هذه الفئة ستصبح بدون فئة.
        """
        category = self.get_object(pk)
        
        if not category:
            return error_response(
                message=_('الفئة غير موجودة / Category not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check if category has children
        # التحقق من وجود فئات فرعية
        if category.children.exists():
            return error_response(
                message=_(
                    'لا يمكن حذف فئة لها فئات فرعية. احذف الفئات الفرعية أولاً. / '
                    'Cannot delete category with subcategories. Delete subcategories first.'
                ),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Store name for response
        category_name = category.name
        
        # Delete category
        # حذف الفئة
        category.delete()
        
        return success_response(
            data={'deleted': category_name},
            message=_('تم حذف الفئة بنجاح / Category deleted successfully')
        )


# =============================================================================
# Category Tree View
# عرض شجرة الفئات
# =============================================================================

class AdminCategoryTreeView(APIView):
    """
    Get categories as a hierarchical tree.
    الحصول على الفئات كشجرة هرمية.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Get Category Tree',
        description='Get categories as a hierarchical tree structure',
        parameters=[
            OpenApiParameter(name='active_only', type=bool, description='Only active categories'),
        ],
        responses={200: AdminCategoryTreeSerializer(many=True)},
        tags=['Admin Categories'],
    )
    def get(self, request):
        """
        Get category tree.
        الحصول على شجرة الفئات.
        """
        # Start with root categories (no parent)
        # البدء بالفئات الجذرية (بدون أب)
        queryset = Category.objects.filter(parent__isnull=True)
        
        # Active only filter
        # فلتر النشط فقط
        active_only = request.query_params.get('active_only')
        if active_only and active_only.lower() in ('true', '1', 'yes'):
            queryset = queryset.filter(is_active=True)
        
        # Order by display_order and name
        queryset = queryset.order_by('display_order', 'name')
        
        serializer = AdminCategoryTreeSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب شجرة الفئات / Category tree retrieved')
        )


# =============================================================================
# Category Bulk Actions View
# عرض العمليات المجمعة للفئات
# =============================================================================

class AdminCategoryBulkActionView(APIView):
    """
    Perform bulk actions on categories.
    تنفيذ عمليات مجمعة على الفئات.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Bulk Category Actions',
        description='Perform bulk actions: activate, deactivate, delete',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'action': {'type': 'string', 'enum': ['activate', 'deactivate', 'delete']},
                    'ids': {'type': 'array', 'items': {'type': 'integer'}},
                },
                'required': ['action', 'ids'],
            }
        },
        tags=['Admin Categories'],
    )
    def post(self, request):
        """
        Execute bulk action.
        تنفيذ عملية مجمعة.
        """
        action = request.data.get('action')
        ids = request.data.get('ids', [])
        
        if not action:
            return error_response(
                message=_('الإجراء مطلوب / Action is required'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if not ids or not isinstance(ids, list):
            return error_response(
                message=_('معرفات الفئات مطلوبة / Category IDs are required'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Get categories
        categories = Category.objects.filter(id__in=ids)
        count = categories.count()
        
        if count == 0:
            return error_response(
                message=_('لم يتم العثور على فئات / No categories found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Execute action
        # تنفيذ الإجراء
        if action == 'activate':
            categories.update(is_active=True)
            message = _(f'تم تفعيل {count} فئة / {count} categories activated')
        
        elif action == 'deactivate':
            categories.update(is_active=False)
            message = _(f'تم تعطيل {count} فئة / {count} categories deactivated')
        
        elif action == 'delete':
            # Check for categories with children
            with_children = categories.filter(children__isnull=False).distinct()
            if with_children.exists():
                return error_response(
                    message=_(
                        'بعض الفئات لها فئات فرعية ولا يمكن حذفها / '
                        'Some categories have subcategories and cannot be deleted'
                    ),
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            categories.delete()
            message = _(f'تم حذف {count} فئة / {count} categories deleted')
        
        else:
            return error_response(
                message=_('إجراء غير صالح / Invalid action'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        return success_response(
            data={'affected': count, 'action': action},
            message=message
        )

