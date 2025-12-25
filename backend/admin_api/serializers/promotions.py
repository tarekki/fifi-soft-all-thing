"""
Admin Promotions Serializers
مسلسلات العروض والحملات للإدارة

This module contains serializers for Banner, Story, and Coupon CRUD operations in Admin API.
هذا الملف يحتوي على مسلسلات عمليات CRUD للبانرات والقصص والكوبونات في API الإدارة.

Author: Yalla Buy Team
"""

from rest_framework import serializers
from promotions.models import Banner, Story, Coupon
from products.models import Category, Product
from users.models import User


# =============================================================================
# Banner Serializers
# مسلسلات البانرات
# =============================================================================

class AdminBannerListSerializer(serializers.ModelSerializer):
    """
    Admin Banner List Serializer
    مسلسل قائمة البانرات للإدارة
    
    Optimized for admin list view with essential fields.
    مُحسّن لعرض القائمة في الإدارة مع الحقول الأساسية.
    """
    
    # Computed fields
    # الحقول المحسوبة
    image_url = serializers.SerializerMethodField()
    is_currently_active = serializers.SerializerMethodField()
    location_display = serializers.CharField(source='get_location_display', read_only=True)
    link_type_display = serializers.CharField(source='get_link_type_display', read_only=True)
    
    class Meta:
        model = Banner
        fields = [
            'id',
            'title',
            'title_ar',
            'subtitle',
            'subtitle_ar',
            'image_url',
            'link_type',
            'link_type_display',
            'link',
            'location',
            'location_display',
            'order',
            'start_date',
            'end_date',
            'is_active',
            'is_currently_active',
            'views',
            'clicks',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['views', 'clicks', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get full image URL / الحصول على رابط الصورة الكامل"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_is_currently_active(self, obj):
        """Check if banner is currently active / التحقق من أن البانر نشط حالياً"""
        return obj.is_currently_active()


class AdminBannerDetailSerializer(serializers.ModelSerializer):
    """
    Admin Banner Detail Serializer
    مسلسل تفاصيل البانر للإدارة
    
    Comprehensive serializer with all fields for detail view.
    مسلسل شامل مع جميع الحقول لعرض التفاصيل.
    """
    
    image_url = serializers.SerializerMethodField()
    is_currently_active = serializers.SerializerMethodField()
    location_display = serializers.CharField(source='get_location_display', read_only=True)
    link_type_display = serializers.CharField(source='get_link_type_display', read_only=True)
    
    class Meta:
        model = Banner
        fields = [
            'id',
            'title',
            'title_ar',
            'subtitle',
            'subtitle_ar',
            'image',
            'image_url',
            'link_type',
            'link_type_display',
            'link',
            'location',
            'location_display',
            'order',
            'start_date',
            'end_date',
            'is_active',
            'is_currently_active',
            'views',
            'clicks',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['views', 'clicks', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get full image URL / الحصول على رابط الصورة الكامل"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_is_currently_active(self, obj):
        """Check if banner is currently active / التحقق من أن البانر نشط حالياً"""
        return obj.is_currently_active()


class AdminBannerCreateSerializer(serializers.ModelSerializer):
    """
    Admin Banner Create Serializer
    مسلسل إنشاء البانر للإدارة
    
    Used for creating new banners.
    يُستخدم لإنشاء بانرات جديدة.
    """
    
    class Meta:
        model = Banner
        fields = [
            'title',
            'title_ar',
            'subtitle',
            'subtitle_ar',
            'image',
            'link_type',
            'link',
            'location',
            'order',
            'start_date',
            'end_date',
            'is_active',
        ]
    
    def validate(self, data):
        """Validate banner data / التحقق من بيانات البانر"""
        # Validate dates / التحقق من التواريخ
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError({
                    'end_date': 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء / End date must be after start date'
                })
        return data


class AdminBannerUpdateSerializer(serializers.ModelSerializer):
    """
    Admin Banner Update Serializer
    مسلسل تحديث البانر للإدارة
    
    Used for updating existing banners.
    يُستخدم لتحديث البانرات الموجودة.
    """
    
    class Meta:
        model = Banner
        fields = [
            'title',
            'title_ar',
            'subtitle',
            'subtitle_ar',
            'image',
            'link_type',
            'link',
            'location',
            'order',
            'start_date',
            'end_date',
            'is_active',
        ]
    
    def validate(self, data):
        """Validate banner data / التحقق من بيانات البانر"""
        # Validate dates / التحقق من التواريخ
        start_date = data.get('start_date', self.instance.start_date if self.instance else None)
        end_date = data.get('end_date', self.instance.end_date if self.instance else None)
        
        if end_date and start_date:
            if end_date < start_date:
                raise serializers.ValidationError({
                    'end_date': 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء / End date must be after start date'
                })
        return data


# =============================================================================
# Story Serializers
# مسلسلات القصص
# =============================================================================

class AdminStoryListSerializer(serializers.ModelSerializer):
    """
    Admin Story List Serializer
    مسلسل قائمة القصص للإدارة
    
    Optimized for admin list view with essential fields.
    مُحسّن لعرض القائمة في الإدارة مع الحقول الأساسية.
    """
    
    image_url = serializers.SerializerMethodField()
    is_currently_active = serializers.SerializerMethodField()
    link_type_display = serializers.CharField(source='get_link_type_display', read_only=True)
    
    class Meta:
        model = Story
        fields = [
            'id',
            'title',
            'title_ar',
            'image_url',
            'link_type',
            'link_type_display',
            'link',
            'expires_at',
            'is_active',
            'is_currently_active',
            'order',
            'views',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['views', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get full image URL / الحصول على رابط الصورة الكامل"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_is_currently_active(self, obj):
        """Check if story is currently active / التحقق من أن القصة نشطة حالياً"""
        return obj.is_currently_active()


class AdminStoryDetailSerializer(serializers.ModelSerializer):
    """
    Admin Story Detail Serializer
    مسلسل تفاصيل القصة للإدارة
    
    Comprehensive serializer with all fields for detail view.
    مسلسل شامل مع جميع الحقول لعرض التفاصيل.
    """
    
    image_url = serializers.SerializerMethodField()
    is_currently_active = serializers.SerializerMethodField()
    link_type_display = serializers.CharField(source='get_link_type_display', read_only=True)
    
    class Meta:
        model = Story
        fields = [
            'id',
            'title',
            'title_ar',
            'image',
            'image_url',
            'link_type',
            'link_type_display',
            'link',
            'expires_at',
            'is_active',
            'is_currently_active',
            'order',
            'views',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['views', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get full image URL / الحصول على رابط الصورة الكامل"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_is_currently_active(self, obj):
        """Check if story is currently active / التحقق من أن القصة نشطة حالياً"""
        return obj.is_currently_active()


class AdminStoryCreateSerializer(serializers.ModelSerializer):
    """
    Admin Story Create Serializer
    مسلسل إنشاء القصة للإدارة
    
    Used for creating new stories.
    يُستخدم لإنشاء قصص جديدة.
    """
    
    class Meta:
        model = Story
        fields = [
            'title',
            'title_ar',
            'image',
            'link_type',
            'link',
            'expires_at',
            'is_active',
            'order',
        ]
    
    def validate_expires_at(self, value):
        """Validate expiration date / التحقق من تاريخ الانتهاء"""
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError(
                'تاريخ الانتهاء يجب أن يكون في المستقبل / Expiration date must be in the future'
            )
        return value


class AdminStoryUpdateSerializer(serializers.ModelSerializer):
    """
    Admin Story Update Serializer
    مسلسل تحديث القصة للإدارة
    
    Used for updating existing stories.
    يُستخدم لتحديث القصص الموجودة.
    """
    
    class Meta:
        model = Story
        fields = [
            'title',
            'title_ar',
            'image',
            'link_type',
            'link',
            'expires_at',
            'is_active',
            'order',
        ]
    
    def validate_expires_at(self, value):
        """Validate expiration date / التحقق من تاريخ الانتهاء"""
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError(
                'تاريخ الانتهاء يجب أن يكون في المستقبل / Expiration date must be in the future'
            )
        return value


# =============================================================================
# Coupon Serializers
# مسلسلات الكوبونات
# =============================================================================

class AdminCouponListSerializer(serializers.ModelSerializer):
    """
    Admin Coupon List Serializer
    مسلسل قائمة الكوبونات للإدارة
    
    Optimized for admin list view with essential fields.
    مُحسّن لعرض القائمة في الإدارة مع الحقول الأساسية.
    """
    
    is_currently_valid = serializers.SerializerMethodField()
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)
    applicable_to_display = serializers.CharField(source='get_applicable_to_display', read_only=True)
    
    # Counts for Many-to-Many relationships
    # عدد العلاقات Many-to-Many
    applicable_categories_count = serializers.SerializerMethodField()
    applicable_products_count = serializers.SerializerMethodField()
    applicable_users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'description',
            'description_ar',
            'discount_type',
            'discount_type_display',
            'discount_value',
            'min_order',
            'max_discount',
            'usage_limit',
            'used_count',
            'applicable_to',
            'applicable_to_display',
            'applicable_categories_count',
            'applicable_products_count',
            'applicable_users_count',
            'start_date',
            'end_date',
            'is_active',
            'is_currently_valid',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['used_count', 'created_at', 'updated_at']
    
    def get_is_currently_valid(self, obj):
        """Check if coupon is currently valid / التحقق من أن الكوبون صالح حالياً"""
        return obj.is_currently_valid()
    
    def get_applicable_categories_count(self, obj):
        """Get count of applicable categories / الحصول على عدد الفئات القابلة للتطبيق"""
        return obj.applicable_categories.count()
    
    def get_applicable_products_count(self, obj):
        """Get count of applicable products / الحصول على عدد المنتجات القابلة للتطبيق"""
        return obj.applicable_products.count()
    
    def get_applicable_users_count(self, obj):
        """Get count of applicable users / الحصول على عدد المستخدمين القابلين للتطبيق"""
        return obj.applicable_users.count()


class AdminCouponDetailSerializer(serializers.ModelSerializer):
    """
    Admin Coupon Detail Serializer
    مسلسل تفاصيل الكوبون للإدارة
    
    Comprehensive serializer with all fields including Many-to-Many relationships.
    مسلسل شامل مع جميع الحقول بما في ذلك علاقات Many-to-Many.
    """
    
    is_currently_valid = serializers.SerializerMethodField()
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)
    applicable_to_display = serializers.CharField(source='get_applicable_to_display', read_only=True)
    
    # Many-to-Many relationships with IDs
    # علاقات Many-to-Many مع المعرفات
    applicable_categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        required=False
    )
    applicable_products = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        required=False
    )
    applicable_users = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False
    )
    
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'description',
            'description_ar',
            'discount_type',
            'discount_type_display',
            'discount_value',
            'min_order',
            'max_discount',
            'usage_limit',
            'used_count',
            'applicable_to',
            'applicable_to_display',
            'applicable_categories',
            'applicable_products',
            'applicable_users',
            'start_date',
            'end_date',
            'is_active',
            'is_currently_valid',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['used_count', 'created_at', 'updated_at']
    
    def get_is_currently_valid(self, obj):
        """Check if coupon is currently valid / التحقق من أن الكوبون صالح حالياً"""
        return obj.is_currently_valid()


class AdminCouponCreateSerializer(serializers.ModelSerializer):
    """
    Admin Coupon Create Serializer
    مسلسل إنشاء الكوبون للإدارة
    
    Used for creating new coupons.
    يُستخدم لإنشاء كوبونات جديدة.
    """
    
    # Many-to-Many relationships
    # علاقات Many-to-Many
    applicable_categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        required=False
    )
    applicable_products = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        required=False
    )
    applicable_users = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False
    )
    
    class Meta:
        model = Coupon
        fields = [
            'code',
            'description',
            'description_ar',
            'discount_type',
            'discount_value',
            'min_order',
            'max_discount',
            'usage_limit',
            'applicable_to',
            'applicable_categories',
            'applicable_products',
            'applicable_users',
            'start_date',
            'end_date',
            'is_active',
        ]
    
    def validate(self, data):
        """Validate coupon data / التحقق من بيانات الكوبون"""
        # Validate discount value / التحقق من قيمة الخصم
        discount_type = data.get('discount_type')
        discount_value = data.get('discount_value')
        
        if discount_type == 'percentage':
            if discount_value > 100:
                raise serializers.ValidationError({
                    'discount_value': 'الخصم النسبي لا يمكن أن يكون أكثر من 100% / Percentage discount cannot exceed 100%'
                })
        
        # Validate dates / التحقق من التواريخ
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError({
                    'end_date': 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء / End date must be after start date'
                })
        
        # Validate applicability / التحقق من التطبيق
        applicable_to = data.get('applicable_to')
        if applicable_to == 'category' and not data.get('applicable_categories'):
            raise serializers.ValidationError({
                'applicable_categories': 'يجب تحديد فئة واحدة على الأقل / At least one category must be specified'
            })
        elif applicable_to == 'product' and not data.get('applicable_products'):
            raise serializers.ValidationError({
                'applicable_products': 'يجب تحديد منتج واحد على الأقل / At least one product must be specified'
            })
        elif applicable_to == 'user' and not data.get('applicable_users'):
            raise serializers.ValidationError({
                'applicable_users': 'يجب تحديد مستخدم واحد على الأقل / At least one user must be specified'
            })
        
        return data
    
    def create(self, validated_data):
        """Create coupon with Many-to-Many relationships / إنشاء كوبون مع علاقات Many-to-Many"""
        # Extract Many-to-Many data
        # استخراج بيانات Many-to-Many
        categories = validated_data.pop('applicable_categories', [])
        products = validated_data.pop('applicable_products', [])
        users = validated_data.pop('applicable_users', [])
        
        # Create coupon
        # إنشاء الكوبون
        coupon = Coupon.objects.create(**validated_data)
        
        # Set Many-to-Many relationships
        # تعيين علاقات Many-to-Many
        if categories:
            coupon.applicable_categories.set(categories)
        if products:
            coupon.applicable_products.set(products)
        if users:
            coupon.applicable_users.set(users)
        
        return coupon


class AdminCouponUpdateSerializer(serializers.ModelSerializer):
    """
    Admin Coupon Update Serializer
    مسلسل تحديث الكوبون للإدارة
    
    Used for updating existing coupons.
    يُستخدم لتحديث الكوبونات الموجودة.
    """
    
    # Many-to-Many relationships
    # علاقات Many-to-Many
    applicable_categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        required=False
    )
    applicable_products = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        required=False
    )
    applicable_users = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False
    )
    
    class Meta:
        model = Coupon
        fields = [
            'code',
            'description',
            'description_ar',
            'discount_type',
            'discount_value',
            'min_order',
            'max_discount',
            'usage_limit',
            'applicable_to',
            'applicable_categories',
            'applicable_products',
            'applicable_users',
            'start_date',
            'end_date',
            'is_active',
        ]
    
    def validate(self, data):
        """Validate coupon data / التحقق من بيانات الكوبون"""
        # Validate discount value / التحقق من قيمة الخصم
        discount_type = data.get('discount_type', self.instance.discount_type if self.instance else None)
        discount_value = data.get('discount_value', self.instance.discount_value if self.instance else None)
        
        if discount_type == 'percentage' and discount_value:
            if discount_value > 100:
                raise serializers.ValidationError({
                    'discount_value': 'الخصم النسبي لا يمكن أن يكون أكثر من 100% / Percentage discount cannot exceed 100%'
                })
        
        # Validate dates / التحقق من التواريخ
        start_date = data.get('start_date', self.instance.start_date if self.instance else None)
        end_date = data.get('end_date', self.instance.end_date if self.instance else None)
        
        if end_date and start_date:
            if end_date < start_date:
                raise serializers.ValidationError({
                    'end_date': 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء / End date must be after start date'
                })
        
        # Validate applicability / التحقق من التطبيق
        applicable_to = data.get('applicable_to', self.instance.applicable_to if self.instance else None)
        if applicable_to == 'category' and not data.get('applicable_categories'):
            # Check if instance has categories
            if self.instance and not self.instance.applicable_categories.exists():
                raise serializers.ValidationError({
                    'applicable_categories': 'يجب تحديد فئة واحدة على الأقل / At least one category must be specified'
                })
        elif applicable_to == 'product' and not data.get('applicable_products'):
            if self.instance and not self.instance.applicable_products.exists():
                raise serializers.ValidationError({
                    'applicable_products': 'يجب تحديد منتج واحد على الأقل / At least one product must be specified'
                })
        elif applicable_to == 'user' and not data.get('applicable_users'):
            if self.instance and not self.instance.applicable_users.exists():
                raise serializers.ValidationError({
                    'applicable_users': 'يجب تحديد مستخدم واحد على الأقل / At least one user must be specified'
                })
        
        return data
    
    def update(self, instance, validated_data):
        """Update coupon with Many-to-Many relationships / تحديث كوبون مع علاقات Many-to-Many"""
        # Extract Many-to-Many data
        # استخراج بيانات Many-to-Many
        categories = validated_data.pop('applicable_categories', None)
        products = validated_data.pop('applicable_products', None)
        users = validated_data.pop('applicable_users', None)
        
        # Update coupon fields
        # تحديث حقول الكوبون
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update Many-to-Many relationships if provided
        # تحديث علاقات Many-to-Many إذا تم توفيرها
        if categories is not None:
            instance.applicable_categories.set(categories)
        if products is not None:
            instance.applicable_products.set(products)
        if users is not None:
            instance.applicable_users.set(users)
        
        return instance


# =============================================================================
# Promotion Stats Serializer
# مسلسل إحصائيات العروض
# =============================================================================

class AdminPromotionStatsSerializer(serializers.Serializer):
    """
    Admin Promotion Stats Serializer
    مسلسل إحصائيات العروض للإدارة
    
    Aggregated statistics for all promotion types.
    إحصائيات مجمعة لجميع أنواع العروض.
    """
    
    # Banner stats
    # إحصائيات البانرات
    banners_total = serializers.IntegerField()
    banners_active = serializers.IntegerField()
    banners_inactive = serializers.IntegerField()
    banners_total_views = serializers.IntegerField()
    banners_total_clicks = serializers.IntegerField()
    
    # Story stats
    # إحصائيات القصص
    stories_total = serializers.IntegerField()
    stories_active = serializers.IntegerField()
    stories_inactive = serializers.IntegerField()
    stories_expired = serializers.IntegerField()
    stories_total_views = serializers.IntegerField()
    
    # Coupon stats
    # إحصائيات الكوبونات
    coupons_total = serializers.IntegerField()
    coupons_active = serializers.IntegerField()
    coupons_inactive = serializers.IntegerField()
    coupons_expired = serializers.IntegerField()
    coupons_total_used = serializers.IntegerField()
    coupons_total_discount = serializers.DecimalField(max_digits=12, decimal_places=2)

