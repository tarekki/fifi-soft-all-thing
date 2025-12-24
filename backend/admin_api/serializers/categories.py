"""
Admin Categories Serializers
مسلسلات الفئات للإدارة

This module contains serializers for Category CRUD operations in Admin API.
هذا الملف يحتوي على مسلسلات عمليات CRUD للفئات في API الإدارة.
"""

from rest_framework import serializers
from products.models import Category


class AdminCategoryListSerializer(serializers.ModelSerializer):
    """
    Admin Category List Serializer
    مسلسل قائمة الفئات للإدارة
    
    Optimized for admin list view with all needed fields.
    مُحسّن لعرض القائمة في الإدارة مع جميع الحقول المطلوبة.
    """
    
    # Computed fields
    # الحقول المحسوبة
    products_count = serializers.SerializerMethodField()
    is_parent = serializers.SerializerMethodField()
    depth = serializers.SerializerMethodField()
    
    # Parent info
    # معلومات الأب
    parent_name = serializers.SerializerMethodField()
    
    # Image URL
    # رابط الصورة
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'image_url',
            'icon',
            'parent',
            'parent_name',
            'display_order',
            'is_active',
            'is_featured',
            'products_count',
            'is_parent',
            'depth',
            'created_at',
            'updated_at',
        ]
    
    def get_parent_name(self, obj) -> str | None:
        """Get parent category name"""
        if obj.parent:
            return obj.parent.name
        return None
    
    def get_image_url(self, obj) -> str | None:
        """Get full image URL"""
        if obj.image and hasattr(obj.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_products_count(self, obj) -> int:
        """Get products count from model property"""
        return obj.products_count
    
    def get_is_parent(self, obj) -> bool:
        """Get is_parent from model property"""
        return obj.is_parent
    
    def get_depth(self, obj) -> int:
        """Get depth from model property"""
        return obj.depth


class AdminCategoryDetailSerializer(serializers.ModelSerializer):
    """
    Admin Category Detail Serializer
    مسلسل تفاصيل الفئة للإدارة
    
    Complete category details including children.
    تفاصيل الفئة الكاملة بما في ذلك الأبناء.
    """
    
    # Computed fields
    products_count = serializers.SerializerMethodField()
    is_parent = serializers.SerializerMethodField()
    depth = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    # Parent info
    parent_name = serializers.SerializerMethodField()
    
    # Image URL
    image_url = serializers.SerializerMethodField()
    
    # Children categories
    # الفئات الفرعية
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'image',
            'image_url',
            'icon',
            'parent',
            'parent_name',
            'children',
            'display_order',
            'is_active',
            'is_featured',
            'products_count',
            'is_parent',
            'depth',
            'full_path',
            'created_at',
            'updated_at',
        ]
    
    def get_parent_name(self, obj) -> str | None:
        if obj.parent:
            return obj.parent.name
        return None
    
    def get_image_url(self, obj) -> str | None:
        if obj.image and hasattr(obj.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_children(self, obj) -> list:
        """Get direct children categories"""
        children = obj.children.all().order_by('display_order', 'name')
        return AdminCategoryListSerializer(
            children,
            many=True,
            context=self.context
        ).data
    
    def get_products_count(self, obj) -> int:
        """Get products count from model property"""
        return obj.products_count
    
    def get_is_parent(self, obj) -> bool:
        """Get is_parent from model property"""
        return obj.is_parent
    
    def get_depth(self, obj) -> int:
        """Get depth from model property"""
        return obj.depth
    
    def get_full_path(self, obj) -> str:
        """Get full_path from model property"""
        return obj.full_path


class AdminCategoryCreateSerializer(serializers.ModelSerializer):
    """
    Admin Category Create Serializer
    مسلسل إنشاء الفئة للإدارة
    
    Used for creating new categories.
    يُستخدم لإنشاء فئات جديدة.
    """
    
    class Meta:
        model = Category
        fields = [
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'image',
            'icon',
            'parent',
            'display_order',
            'is_active',
            'is_featured',
        ]
        extra_kwargs = {
            'slug': {'required': False},
            'description': {'required': False},
            'description_ar': {'required': False},
            'image': {'required': False},
            'icon': {'required': False},
            'parent': {'required': False},
            'display_order': {'required': False},
            'is_active': {'required': False},
            'is_featured': {'required': False},
        }
    
    def validate_parent(self, value):
        """
        Validate parent category
        التحقق من الفئة الأم
        """
        if value:
            # Check if parent is the same as current (on update)
            if self.instance and value.pk == self.instance.pk:
                raise serializers.ValidationError(
                    "A category cannot be its own parent. / لا يمكن للفئة أن تكون أباً لنفسها."
                )
            
            # Check for circular reference
            if self.instance:
                parent = value
                while parent:
                    if parent.pk == self.instance.pk:
                        raise serializers.ValidationError(
                            "Circular reference detected. / تم اكتشاف مرجع دائري."
                        )
                    parent = parent.parent
        
        return value
    
    def validate_name(self, value):
        """Validate name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Category name is required. / اسم الفئة مطلوب."
            )
        return value.strip()
    
    def validate_name_ar(self, value):
        """Validate Arabic name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Arabic category name is required. / اسم الفئة بالعربية مطلوب."
            )
        return value.strip()


class AdminCategoryUpdateSerializer(AdminCategoryCreateSerializer):
    """
    Admin Category Update Serializer
    مسلسل تحديث الفئة للإدارة
    
    Used for updating existing categories.
    يُستخدم لتحديث الفئات الموجودة.
    """
    
    class Meta(AdminCategoryCreateSerializer.Meta):
        extra_kwargs = {
            'name': {'required': False},
            'name_ar': {'required': False},
            'slug': {'required': False},
            'description': {'required': False},
            'description_ar': {'required': False},
            'image': {'required': False},
            'icon': {'required': False},
            'parent': {'required': False, 'allow_null': True},
            'display_order': {'required': False},
            'is_active': {'required': False},
            'is_featured': {'required': False},
        }


class AdminCategoryTreeSerializer(serializers.ModelSerializer):
    """
    Admin Category Tree Serializer
    مسلسل شجرة الفئات للإدارة
    
    Hierarchical tree structure for category selection.
    هيكل شجري هرمي لاختيار الفئات.
    """
    
    children = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'name_ar',
            'label',
            'slug',
            'is_active',
            'display_order',
            'children',
        ]
    
    def get_children(self, obj) -> list:
        """Get child categories recursively"""
        children = obj.children.all().order_by('display_order', 'name')
        return AdminCategoryTreeSerializer(
            children,
            many=True,
            context=self.context
        ).data
    
    def get_label(self, obj) -> str:
        """Get display label (name_ar - name)"""
        return f"{obj.name_ar} - {obj.name}"

