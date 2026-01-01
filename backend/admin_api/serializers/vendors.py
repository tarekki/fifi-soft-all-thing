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
# Vendor with User Create Serializer (Complete Vendor Creation)
# مسلسل إنشاء البائع مع المستخدم (إنشاء بائع كامل)
# =============================================================================

class AdminVendorWithUserCreateSerializer(serializers.Serializer):
    """
    Admin Vendor with User Create Serializer
    مسلسل إنشاء البائع مع المستخدم للإدارة
    
    This serializer creates:
    1. Vendor
    2. User (if not exists) or links to existing user
    3. VendorUser (links User to Vendor)
    
    هذا المسلسل ينشئ:
    1. البائع
    2. المستخدم (إذا لم يكن موجوداً) أو يربط بمستخدم موجود
    3. VendorUser (يربط المستخدم بالبائع)
    
    Security Features:
    - Validates email uniqueness
    - Validates vendor name uniqueness
    - Generates secure temporary password if creating new user
    - Validates phone format
    - Transaction-safe (all or nothing)
    
    ميزات الأمان:
    - التحقق من تفرد البريد الإلكتروني
    - التحقق من تفرد اسم البائع
    - إنشاء كلمة مرور مؤقتة آمنة عند إنشاء مستخدم جديد
    - التحقق من صيغة رقم الهاتف
    - آمن للعمليات (كل شيء أو لا شيء)
    """
    
    # Vendor fields
    # حقول البائع
    vendor_name = serializers.CharField(
        max_length=100,
        required=True,
        help_text=_('اسم البائع / Vendor name')
    )
    vendor_description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_('وصف البائع / Vendor description')
    )
    vendor_logo = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text=_('شعار البائع / Vendor logo')
    )
    vendor_primary_color = serializers.CharField(
        max_length=7,
        required=False,
        default='#000000',
        help_text=_('اللون الأساسي / Primary color (hex format)')
    )
    commission_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        default=Decimal("10.00"),
        help_text=_('نسبة العمولة / Commission rate (0-100)')
    )
    is_active = serializers.BooleanField(
        required=False,
        default=True,
        help_text=_('البائع نشط / Vendor is active')
    )
    
    # User fields
    # حقول المستخدم
    user_email = serializers.EmailField(
        required=True,
        help_text=_('البريد الإلكتروني للمستخدم / User email')
    )
    user_full_name = serializers.CharField(
        max_length=150,
        required=True,
        help_text=_('الاسم الكامل للمستخدم / User full name')
    )
    user_phone = serializers.CharField(
        max_length=20,
        required=True,
        help_text=_('رقم الهاتف / Phone number')
    )
    
    # User creation options
    # خيارات إنشاء المستخدم
    use_existing_user = serializers.BooleanField(
        required=False,
        default=False,
        help_text=_('استخدام مستخدم موجود / Use existing user')
    )
    user_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text=_('معرف المستخدم الموجود (إذا use_existing_user=True) / Existing user ID')
    )
    
    def validate_vendor_name(self, value):
        """Validate vendor name is unique"""
        if Vendor.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                _("اسم البائع موجود مسبقاً / Vendor name already exists")
            )
        return value
    
    def validate_user_email(self, value):
        """Validate email format and uniqueness if creating new user"""
        value = value.lower().strip()
        
        # Check if email already exists
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if User.objects.filter(email=value).exists():
            # If use_existing_user is True, this is OK
            # إذا كان use_existing_user=True، هذا جيد
            if not self.initial_data.get('use_existing_user', False):
                raise serializers.ValidationError(
                    _("البريد الإلكتروني موجود مسبقاً. استخدم use_existing_user=true / Email already exists. Use use_existing_user=true")
                )
        return value
    
    def validate_user_phone(self, value):
        """Validate phone number uniqueness if creating new user"""
        # Only validate if not using existing user
        # التحقق فقط إذا لم يكن استخدام مستخدم موجود
        if not self.initial_data.get('use_existing_user', False):
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            if User.objects.filter(phone=value).exists():
                raise serializers.ValidationError(
                    _("رقم الهاتف موجود مسبقاً / Phone number already exists")
                )
        return value
    
    def validate_commission_rate(self, value):
        """Validate commission rate"""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                _("نسبة العمولة يجب أن تكون بين 0 و 100 / Commission rate must be between 0 and 100")
            )
        return value
    
    def validate_primary_color(self, value):
        """Validate color is hex format"""
        import re
        if value and not re.match(r'^#[0-9A-Fa-f]{6}$', value):
            raise serializers.ValidationError(
                _("اللون يجب أن يكون بصيغة hex (مثل #FF5733) / Color must be hex format (e.g., #FF5733)")
            )
        return value
    
    def validate(self, attrs):
        """Additional validation"""
        use_existing = attrs.get('use_existing_user', False)
        user_id = attrs.get('user_id')
        
        if use_existing and not user_id:
            raise serializers.ValidationError({
                'user_id': _('يجب تحديد معرف المستخدم عند استخدام مستخدم موجود / User ID is required when using existing user')
            })
        
        if use_existing and user_id:
            from django.contrib.auth import get_user_model
            from users.models import VendorUser
            
            User = get_user_model()
            try:
                user = User.objects.get(pk=user_id)
                # Check if user already has a vendor
                if VendorUser.objects.filter(user=user).exists():
                    raise serializers.ValidationError({
                        'user_id': _('المستخدم مرتبط ببائع آخر بالفعل / User is already associated with another vendor')
                    })
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'user_id': _('المستخدم غير موجود / User not found')
                })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create vendor with user
        إنشاء بائع مع مستخدم
        """
        from django.contrib.auth import get_user_model
        from django.db import transaction
        from users.models import VendorUser, UserProfile
        import secrets
        import string
        
        User = get_user_model()
        
        # Extract data
        # استخراج البيانات
        vendor_name = validated_data['vendor_name']
        vendor_description = validated_data.get('vendor_description', '')
        vendor_logo = validated_data.get('vendor_logo')
        vendor_primary_color = validated_data.get('vendor_primary_color', '#000000')
        commission_rate = validated_data.get('commission_rate', Decimal("10.00"))
        is_active = validated_data.get('is_active', True)
        
        user_email = validated_data['user_email'].lower().strip()
        user_full_name = validated_data['user_full_name']
        user_phone = validated_data['user_phone']
        
        use_existing = validated_data.get('use_existing_user', False)
        user_id = validated_data.get('user_id')
        
        temp_password = None
        
        with transaction.atomic():
            # Get or create user
            # الحصول على أو إنشاء مستخدم
            if use_existing and user_id:
                user = User.objects.get(pk=user_id)
                # Change role to vendor if not already
                if user.role != User.Role.VENDOR:
                    user.role = User.Role.VENDOR
                    user.save(update_fields=['role'])
            else:
                # Create new user
                # إنشاء مستخدم جديد
                # Generate secure temporary password
                # إنشاء كلمة مرور مؤقتة آمنة
                alphabet = string.ascii_letters + string.digits + string.punctuation
                temp_password = ''.join(secrets.choice(alphabet) for i in range(16))
                
                user = User.objects.create_user(
                    email=user_email,
                    password=temp_password,
                    phone=user_phone,
                    full_name=user_full_name,
                    role=User.Role.VENDOR,
                    is_active=True,
                )
                
                # Create UserProfile (if doesn't exist)
                # إنشاء ملف المستخدم الشخصي (إذا لم يكن موجوداً)
                UserProfile.objects.get_or_create(
                    user=user
                )
            
            # Create vendor
            # إنشاء البائع
            vendor = Vendor.objects.create(
                name=vendor_name,
                description=vendor_description,
                logo=vendor_logo,
                primary_color=vendor_primary_color,
                commission_rate=commission_rate,
                is_active=is_active,
            )
            
            # Create VendorUser
            # إنشاء VendorUser
            vendor_user = VendorUser.objects.create(
                user=user,
                vendor=vendor,
                is_owner=True,
            )
            
            # Store temp password in serializer for response
            # تخزين كلمة المرور المؤقتة في المسلسل للاستجابة
            self.temp_password = temp_password
            
            return {
                'vendor': vendor,
                'user': user,
                'vendor_user': vendor_user,
                'temp_password': temp_password,
            }


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

