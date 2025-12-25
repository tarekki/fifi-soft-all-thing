"""
Admin Vendor Serializers
مسلسلات البائعين للإدارة

This module contains serializers for managing vendors in the admin panel.
هذا الملف يحتوي على مسلسلات لإدارة البائعين في لوحة الإدارة.

Serializers:
    - AdminVendorListSerializer: قائمة البائعين (مُحسّن للأداء)
    - AdminVendorDetailSerializer: تفاصيل البائع الكاملة
    - AdminVendorCreateSerializer: إنشاء بائع جديد
    - AdminVendorUpdateSerializer: تعديل بائع
    - AdminVendorStatusUpdateSerializer: تغيير حالة البائع

Author: Yalla Buy Team
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.db.models import Count, Sum, Q
from decimal import Decimal

from vendors.models import Vendor


# =============================================================================
# Vendor List Serializer (Optimized for Performance)
# مسلسل قائمة البائعين (مُحسّن للأداء)
# =============================================================================

class AdminVendorListSerializer(serializers.ModelSerializer):
    """
    Admin Vendor List Serializer
    مسلسل قائمة البائعين للإدارة
    
    Optimized for list view - includes essential fields and statistics.
    مُحسّن لعرض القائمة - يتضمن الحقول الأساسية والإحصائيات.
    
    Performance Note:
    - Uses SerializerMethodField for computed values
    - Requires annotated queryset for best performance
    
    ملاحظة الأداء:
    - يستخدم SerializerMethodField للقيم المحسوبة
    - يتطلب queryset مع annotations للأداء الأفضل
    """
    
    # Logo URL
    # رابط الشعار
    logo_url = serializers.SerializerMethodField(
        help_text="رابط صورة الشعار"
    )
    
    # Statistics (computed fields)
    # الإحصائيات (حقول محسوبة)
    products_count = serializers.SerializerMethodField(
        help_text="عدد المنتجات"
    )
    total_stock = serializers.SerializerMethodField(
        help_text="إجمالي المخزون"
    )
    orders_count = serializers.SerializerMethodField(
        help_text="عدد الطلبات"
    )
    total_revenue = serializers.SerializerMethodField(
        help_text="إجمالي الإيرادات"
    )
    
    class Meta:
        model = Vendor
        fields = [
            'id',
            'name',
            'slug',
            'logo_url',
            'primary_color',
            'description',
            'commission_rate',
            'is_active',
            'products_count',
            'total_stock',
            'orders_count',
            'total_revenue',
            'created_at',
            'updated_at',
        ]
    
    def get_logo_url(self, obj) -> str | None:
        """
        Get full logo URL
        الحصول على رابط الشعار الكامل
        """
        if obj.logo and hasattr(obj.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None
    
    def get_products_count(self, obj) -> int:
        """
        Get products count for this vendor
        الحصول على عدد المنتجات لهذا البائع
        """
        # Use annotation if available for better performance
        # استخدام annotation إذا كان متاحاً للأداء الأفضل
        if hasattr(obj, 'products_count_annotated'):
            return obj.products_count_annotated
        return obj.products.count()
    
    def get_total_stock(self, obj) -> int:
        """
        Get total stock across all vendor products
        الحصول على إجمالي المخزون عبر جميع منتجات البائع
        """
        # Use annotation if available
        # استخدام annotation إذا كان متاحاً
        if hasattr(obj, 'total_stock_annotated'):
            return obj.total_stock_annotated or 0
        
        from products.models import ProductVariant
        return ProductVariant.objects.filter(
            product__vendor=obj
        ).aggregate(
            total=Sum('stock_quantity')
        )['total'] or 0
    
    def get_orders_count(self, obj) -> int:
        """
        Get orders count for this vendor
        الحصول على عدد الطلبات لهذا البائع
        """
        # Use annotation if available
        # استخدام annotation إذا كان متاحاً
        if hasattr(obj, 'orders_count_annotated'):
            return obj.orders_count_annotated or 0
        
        from orders.models import OrderItem
        return OrderItem.objects.filter(
            product_variant__product__vendor=obj
        ).values('order').distinct().count()
    
    def get_total_revenue(self, obj) -> float:
        """
        Get total revenue for this vendor
        الحصول على إجمالي الإيرادات لهذا البائع
        """
        # Use annotation if available
        # استخدام annotation إذا كان متاحاً
        if hasattr(obj, 'total_revenue_annotated'):
            return float(obj.total_revenue_annotated or 0)
        
        from orders.models import OrderItem
        result = OrderItem.objects.filter(
            product_variant__product__vendor=obj,
            order__status__in=['confirmed', 'shipped', 'delivered']
        ).aggregate(
            total=Sum('price')
        )['total']
        return float(result or 0)


# =============================================================================
# Vendor Detail Serializer (Complete Information)
# مسلسل تفاصيل البائع (معلومات كاملة)
# =============================================================================

class AdminVendorDetailSerializer(serializers.ModelSerializer):
    """
    Admin Vendor Detail Serializer
    مسلسل تفاصيل البائع للإدارة
    
    Complete vendor information including all statistics.
    معلومات البائع الكاملة بما في ذلك جميع الإحصائيات.
    """
    
    # Logo URL
    logo_url = serializers.SerializerMethodField()
    
    # Statistics
    # الإحصائيات
    products_count = serializers.SerializerMethodField()
    active_products_count = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    low_stock_count = serializers.SerializerMethodField()
    orders_count = serializers.SerializerMethodField()
    pending_orders_count = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    this_month_revenue = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            'id',
            'name',
            'slug',
            'logo',
            'logo_url',
            'primary_color',
            'description',
            'commission_rate',
            'is_active',
            # Statistics
            'products_count',
            'active_products_count',
            'total_stock',
            'low_stock_count',
            'orders_count',
            'pending_orders_count',
            'total_revenue',
            'this_month_revenue',
            # Timestamps
            'created_at',
            'updated_at',
        ]
    
    def get_logo_url(self, obj) -> str | None:
        """Get full logo URL"""
        if obj.logo and hasattr(obj.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None
    
    def get_products_count(self, obj) -> int:
        """Get total products count"""
        return obj.products.count()
    
    def get_active_products_count(self, obj) -> int:
        """Get active products count"""
        return obj.products.filter(is_active=True).count()
    
    def get_total_stock(self, obj) -> int:
        """Get total stock"""
        from products.models import ProductVariant
        return ProductVariant.objects.filter(
            product__vendor=obj
        ).aggregate(
            total=Sum('stock_quantity')
        )['total'] or 0
    
    def get_low_stock_count(self, obj) -> int:
        """
        Get count of products with low stock (< 10)
        الحصول على عدد المنتجات ذات المخزون المنخفض
        """
        from products.models import ProductVariant
        return ProductVariant.objects.filter(
            product__vendor=obj,
            stock_quantity__lt=10,
            stock_quantity__gt=0
        ).count()
    
    def get_orders_count(self, obj) -> int:
        """Get total orders count"""
        from orders.models import OrderItem
        return OrderItem.objects.filter(
            product_variant__product__vendor=obj
        ).values('order').distinct().count()
    
    def get_pending_orders_count(self, obj) -> int:
        """
        Get pending orders count
        الحصول على عدد الطلبات المعلقة
        """
        from orders.models import OrderItem
        return OrderItem.objects.filter(
            product_variant__product__vendor=obj,
            order__status='pending'
        ).values('order').distinct().count()
    
    def get_total_revenue(self, obj) -> float:
        """Get total revenue"""
        from orders.models import OrderItem
        result = OrderItem.objects.filter(
            product_variant__product__vendor=obj,
            order__status__in=['confirmed', 'shipped', 'delivered']
        ).aggregate(
            total=Sum('price')
        )['total']
        return float(result or 0)
    
    def get_this_month_revenue(self, obj) -> float:
        """
        Get this month's revenue
        الحصول على إيرادات هذا الشهر
        """
        from orders.models import OrderItem
        from django.utils import timezone
        
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        result = OrderItem.objects.filter(
            product_variant__product__vendor=obj,
            order__status__in=['confirmed', 'shipped', 'delivered'],
            order__created_at__gte=start_of_month
        ).aggregate(
            total=Sum('price')
        )['total']
        return float(result or 0)


# =============================================================================
# Vendor Create Serializer
# مسلسل إنشاء البائع
# =============================================================================

class AdminVendorCreateSerializer(serializers.ModelSerializer):
    """
    Admin Vendor Create Serializer
    مسلسل إنشاء البائع للإدارة
    
    Used for creating new vendors.
    يُستخدم لإنشاء بائعين جدد.
    """
    
    class Meta:
        model = Vendor
        fields = [
            'name',
            'logo',
            'primary_color',
            'description',
            'commission_rate',
            'is_active',
        ]
    
    def validate_name(self, value):
        """
        Validate vendor name is unique
        التحقق من أن اسم البائع فريد
        """
        if Vendor.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                _("اسم البائع موجود مسبقاً / Vendor name already exists")
            )
        return value
    
    def validate_commission_rate(self, value):
        """
        Validate commission rate is within valid range (0-100)
        التحقق من أن نسبة العمولة ضمن النطاق الصالح
        """
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                _("نسبة العمولة يجب أن تكون بين 0 و 100 / Commission rate must be between 0 and 100")
            )
        return value
    
    def validate_primary_color(self, value):
        """
        Validate color is a valid hex code
        التحقق من أن اللون هو كود hex صالح
        """
        import re
        if value and not re.match(r'^#[0-9A-Fa-f]{6}$', value):
            raise serializers.ValidationError(
                _("اللون يجب أن يكون بصيغة hex (مثل #FF5733) / Color must be hex format (e.g., #FF5733)")
            )
        return value


# =============================================================================
# Vendor Update Serializer
# مسلسل تعديل البائع
# =============================================================================

class AdminVendorUpdateSerializer(serializers.ModelSerializer):
    """
    Admin Vendor Update Serializer
    مسلسل تعديل البائع للإدارة
    
    Used for updating existing vendors.
    يُستخدم لتعديل البائعين الحاليين.
    """
    
    class Meta:
        model = Vendor
        fields = [
            'name',
            'logo',
            'primary_color',
            'description',
            'commission_rate',
            'is_active',
        ]
    
    def validate_name(self, value):
        """
        Validate vendor name is unique (excluding current vendor)
        التحقق من أن اسم البائع فريد (باستثناء البائع الحالي)
        """
        if self.instance:
            if Vendor.objects.filter(name__iexact=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError(
                    _("اسم البائع موجود مسبقاً / Vendor name already exists")
                )
        return value
    
    def validate_commission_rate(self, value):
        """Validate commission rate is within valid range"""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                _("نسبة العمولة يجب أن تكون بين 0 و 100 / Commission rate must be between 0 and 100")
            )
        return value
    
    def validate_primary_color(self, value):
        """Validate color is a valid hex code"""
        import re
        if value and not re.match(r'^#[0-9A-Fa-f]{6}$', value):
            raise serializers.ValidationError(
                _("اللون يجب أن يكون بصيغة hex / Color must be hex format")
            )
        return value


# =============================================================================
# Vendor Status Update Serializer
# مسلسل تحديث حالة البائع
# =============================================================================

class AdminVendorStatusUpdateSerializer(serializers.Serializer):
    """
    Admin Vendor Status Update Serializer
    مسلسل تحديث حالة البائع للإدارة
    
    Used for activating/deactivating vendors.
    يُستخدم لتفعيل/تعطيل البائعين.
    """
    
    is_active = serializers.BooleanField(
        help_text="حالة البائع (نشط/غير نشط)"
    )
    
    def update(self, instance, validated_data):
        """
        Update vendor status
        تحديث حالة البائع
        """
        instance.is_active = validated_data['is_active']
        instance.save(update_fields=['is_active', 'updated_at'])
        return instance


# =============================================================================
# Vendor Commission Update Serializer
# مسلسل تحديث عمولة البائع
# =============================================================================

class AdminVendorCommissionUpdateSerializer(serializers.Serializer):
    """
    Admin Vendor Commission Update Serializer
    مسلسل تحديث عمولة البائع للإدارة
    
    Used for updating vendor commission rate.
    يُستخدم لتحديث نسبة عمولة البائع.
    """
    
    commission_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal('0'),
        max_value=Decimal('100'),
        help_text="نسبة العمولة (0-100)"
    )
    
    def update(self, instance, validated_data):
        """
        Update vendor commission rate
        تحديث نسبة عمولة البائع
        """
        instance.commission_rate = validated_data['commission_rate']
        instance.save(update_fields=['commission_rate', 'updated_at'])
        return instance


# =============================================================================
# Vendor Bulk Action Serializer
# مسلسل العمليات المجمعة للبائعين
# =============================================================================

class AdminVendorBulkActionSerializer(serializers.Serializer):
    """
    Admin Vendor Bulk Action Serializer
    مسلسل العمليات المجمعة للبائعين
    
    Performs bulk actions on multiple vendors.
    ينفذ عمليات مجمعة على عدة بائعين.
    """
    
    vendor_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text="قائمة معرفات البائعين"
    )
    action = serializers.ChoiceField(
        choices=[
            ('activate', _('تفعيل / Activate')),
            ('deactivate', _('تعطيل / Deactivate')),
        ],
        help_text="نوع العملية"
    )
    
    def validate_vendor_ids(self, value):
        """
        Validate all vendor IDs exist
        التحقق من وجود جميع معرفات البائعين
        """
        existing_ids = set(
            Vendor.objects.filter(pk__in=value).values_list('pk', flat=True)
        )
        missing_ids = set(value) - existing_ids
        
        if missing_ids:
            raise serializers.ValidationError(
                _(f"البائعون غير موجودين: {list(missing_ids)} / Vendors not found")
            )
        
        return value

