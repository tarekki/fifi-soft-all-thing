"""
Admin User Serializers
مسلسلات المستخدمين للإدارة

This module contains serializers for managing users in the admin panel.
هذا الملف يحتوي على مسلسلات لإدارة المستخدمين.

Serializers:
    - AdminUserListSerializer: قائمة المستخدمين (مُحسّن للأداء)
    - AdminUserDetailSerializer: تفاصيل المستخدم الكاملة
    - AdminUserCreateSerializer: إنشاء مستخدم جديد
    - AdminUserUpdateSerializer: تحديث مستخدم
    - AdminUserStatusUpdateSerializer: تحديث حالة المستخدم
    - AdminUserBulkActionSerializer: عمليات مجمعة
    - AdminUserStatsSerializer: إحصائيات المستخدمين

Security Notes:
    - Passwords are never returned in responses
    - Only admins can manage users
    - Sensitive operations require superuser privileges

Author: Yalla Buy Team
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.password_validation import validate_password
from django.db.models import Count, Sum, Q

from users.models import User, UserProfile, VendorUser


# =============================================================================
# User List Serializer
# مسلسل قائمة المستخدمين
# =============================================================================

class AdminUserListSerializer(serializers.ModelSerializer):
    """
    Admin User List Serializer
    مسلسل قائمة المستخدمين للإدارة
    
    Optimized for list view - includes essential fields only.
    مُحسّن لعرض القائمة - يتضمن الحقول الأساسية فقط.
    """
    
    # Computed fields
    # الحقول المحسوبة
    role_display = serializers.CharField(
        source='get_role_display',
        read_only=True
    )
    avatar_url = serializers.SerializerMethodField()
    orders_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'phone',
            'role',
            'role_display',
            'is_active',
            'is_staff',
            'is_superuser',
            'avatar_url',
            'orders_count',
            'total_spent',
            'last_login',
            'created_at',
        ]
    
    def get_avatar_url(self, obj) -> str | None:
        """Get full avatar URL"""
        if hasattr(obj, 'profile') and obj.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.avatar.url)
            return obj.profile.avatar.url
        return None
    
    def get_orders_count(self, obj) -> int:
        """Get user orders count"""
        if hasattr(obj, 'orders'):
            return obj.orders.count()
        return 0
    
    def get_total_spent(self, obj) -> float:
        """Get total amount spent by user"""
        if hasattr(obj, 'orders'):
            total = obj.orders.aggregate(
                total=Sum('total')
            )['total'] or 0
            return float(total)
        return 0.0


# =============================================================================
# User Detail Serializer
# مسلسل تفاصيل المستخدم
# =============================================================================

class AdminUserDetailSerializer(serializers.ModelSerializer):
    """
    Admin User Detail Serializer
    مسلسل تفاصيل المستخدم للإدارة
    
    Complete user information including profile and vendor associations.
    معلومات المستخدم الكاملة بما في ذلك الملف الشخصي وارتباطات البائعين.
    """
    
    # Computed fields
    role_display = serializers.CharField(
        source='get_role_display',
        read_only=True
    )
    avatar_url = serializers.SerializerMethodField()
    
    # Profile fields
    profile = serializers.SerializerMethodField()
    
    # Vendor associations
    vendor_associations = serializers.SerializerMethodField()
    
    # Statistics
    orders_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'phone',
            'role',
            'role_display',
            'is_active',
            'is_staff',
            'is_superuser',
            'avatar_url',
            'profile',
            'vendor_associations',
            'orders_count',
            'total_spent',
            'last_login',
            'date_joined',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'last_login',
            'date_joined',
            'created_at',
            'updated_at',
        ]
    
    def get_avatar_url(self, obj) -> str | None:
        """Get full avatar URL"""
        if hasattr(obj, 'profile') and obj.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.avatar.url)
            return obj.profile.avatar.url
        return None
    
    def get_profile(self, obj) -> dict | None:
        """Get user profile information"""
        if hasattr(obj, 'profile'):
            profile = obj.profile
            avatar_url = None
            if profile.avatar:
                request = self.context.get('request')
                if request:
                    avatar_url = request.build_absolute_uri(profile.avatar.url)
                else:
                    avatar_url = profile.avatar.url
            
            return {
                'address': profile.address,
                'avatar_url': avatar_url,
                'preferred_language': profile.preferred_language,
                'preferred_language_display': profile.get_preferred_language_display(),
            }
        return None
    
    def get_vendor_associations(self, obj) -> list:
        """Get vendor associations"""
        if hasattr(obj, 'vendor_users'):
            associations = []
            for vendor_user in obj.vendor_users.select_related('vendor').all():
                associations.append({
                    'id': vendor_user.id,
                    'vendor_id': vendor_user.vendor.id,
                    'vendor_name': vendor_user.vendor.name,
                    'is_owner': vendor_user.is_owner,
                    'permissions': vendor_user.permissions,
                })
            return associations
        return []
    
    def get_orders_count(self, obj) -> int:
        """Get user orders count"""
        if hasattr(obj, 'orders'):
            return obj.orders.count()
        return 0
    
    def get_total_spent(self, obj) -> float:
        """Get total amount spent by user"""
        if hasattr(obj, 'orders'):
            total = obj.orders.aggregate(
                total=Sum('total')
            )['total'] or 0
            return float(total)
        return 0.0


# =============================================================================
# User Create Serializer
# مسلسل إنشاء مستخدم
# =============================================================================

class AdminUserCreateSerializer(serializers.ModelSerializer):
    """
    Admin User Create Serializer
    مسلسل إنشاء مستخدم جديد
    
    Used for creating new users by admin.
    يُستخدم لإنشاء مستخدمين جدد بواسطة الأدمن.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        help_text=_('كلمة المرور (يجب أن تكون قوية)')
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        help_text=_('تأكيد كلمة المرور')
    )
    
    # Profile fields (optional)
    address = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_('العنوان الافتراضي')
    )
    preferred_language = serializers.ChoiceField(
        choices=UserProfile.Language.choices,
        required=False,
        default=UserProfile.Language.ARABIC,
        help_text=_('اللغة المفضلة')
    )
    
    class Meta:
        model = User
        fields = [
            'email',
            'password',
            'password_confirm',
            'full_name',
            'phone',
            'role',
            'is_active',
            'is_staff',
            'address',
            'preferred_language',
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                _('البريد الإلكتروني مستخدم بالفعل / Email already exists')
            )
        return value
    
    def validate_phone(self, value):
        """Validate phone uniqueness"""
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                _('رقم الهاتف مستخدم بالفعل / Phone already exists')
            )
        return value
    
    def validate(self, data):
        """Validate password confirmation"""
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': _('كلمات المرور غير متطابقة / Passwords do not match')
            })
        return data
    
    def create(self, validated_data):
        """Create user and profile"""
        # Extract profile fields
        address = validated_data.pop('address', '')
        preferred_language = validated_data.pop('preferred_language', UserProfile.Language.ARABIC)
        password = validated_data.pop('password')
        validated_data.pop('password_confirm', None)
        
        # Create user
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Create profile
        UserProfile.objects.create(
            user=user,
            address=address,
            preferred_language=preferred_language,
        )
        
        return user


# =============================================================================
# User Update Serializer
# مسلسل تحديث مستخدم
# =============================================================================

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    Admin User Update Serializer
    مسلسل تحديث مستخدم
    
    Used for updating existing users.
    يُستخدم لتحديث المستخدمين الموجودين.
    """
    
    # Profile fields
    address = serializers.CharField(
        required=False,
        allow_blank=True,
        source='profile.address',
        help_text=_('العنوان الافتراضي')
    )
    preferred_language = serializers.ChoiceField(
        choices=UserProfile.Language.choices,
        required=False,
        source='profile.preferred_language',
        help_text=_('اللغة المفضلة')
    )
    
    class Meta:
        model = User
        fields = [
            'email',
            'full_name',
            'phone',
            'role',
            'is_active',
            'is_staff',
            'is_superuser',
            'address',
            'preferred_language',
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness (excluding current user)"""
        if self.instance and User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError(
                _('البريد الإلكتروني مستخدم بالفعل / Email already exists')
            )
        return value
    
    def validate_phone(self, value):
        """Validate phone uniqueness (excluding current user)"""
        if self.instance and User.objects.filter(phone=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError(
                _('رقم الهاتف مستخدم بالفعل / Phone already exists')
            )
        return value
    
    def update(self, instance, validated_data):
        """Update user and profile"""
        # Extract profile fields
        profile_data = {}
        if 'profile' in validated_data:
            profile_data = validated_data.pop('profile')
        
        # Update user
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create profile
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


# =============================================================================
# User Status Update Serializer
# مسلسل تحديث حالة المستخدم
# =============================================================================

class AdminUserStatusUpdateSerializer(serializers.Serializer):
    """
    Admin User Status Update Serializer
    مسلسل تحديث حالة المستخدم
    
    Used for updating user active status.
    يُستخدم لتحديث حالة تفعيل المستخدم.
    """
    
    is_active = serializers.BooleanField(
        required=True,
        help_text=_('حالة التفعيل / Active status')
    )
    
    def validate(self, data):
        """Prevent deactivating superuser"""
        user = self.context.get('user')
        if user and user.is_superuser and not data.get('is_active', True):
            raise serializers.ValidationError({
                'is_active': _('لا يمكن تعطيل المستخدم الفائق / Cannot deactivate superuser')
            })
        return data


# =============================================================================
# User Bulk Action Serializer
# مسلسل العمليات المجمعة
# =============================================================================

class AdminUserBulkActionSerializer(serializers.Serializer):
    """
    Admin User Bulk Action Serializer
    مسلسل العمليات المجمعة على المستخدمين
    
    Used for performing bulk actions on multiple users.
    يُستخدم لتنفيذ عمليات مجمعة على عدة مستخدمين.
    """
    
    ACTION_CHOICES = [
        ('activate', _('تفعيل / Activate')),
        ('deactivate', _('تعطيل / Deactivate')),
        ('delete', _('حذف / Delete')),
    ]
    
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text=_('قائمة معرفات المستخدمين / List of user IDs')
    )
    action = serializers.ChoiceField(
        choices=ACTION_CHOICES,
        help_text=_('الإجراء المطلوب / Action to perform')
    )
    
    def validate_user_ids(self, value):
        """Validate user IDs exist and are not superusers"""
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                _('يجب تحديد مستخدم واحد على الأقل / At least one user must be selected')
            )
        
        # Convert to set to remove duplicates
        # تحويل إلى set لإزالة التكرارات
        unique_ids = list(set(value))
        
        users = User.objects.filter(id__in=unique_ids)
        found_ids = set(users.values_list('id', flat=True))
        missing_ids = set(unique_ids) - found_ids
        
        if missing_ids:
            raise serializers.ValidationError(
                _('بعض المستخدمين غير موجودين: {} / Some users not found: {}').format(
                    ', '.join(map(str, missing_ids)),
                    ', '.join(map(str, missing_ids))
                )
            )
        
        # Check for superusers
        superusers = users.filter(is_superuser=True)
        if superusers.exists():
            superuser_ids = list(superusers.values_list('id', flat=True))
            raise serializers.ValidationError(
                _('لا يمكن تنفيذ عمليات مجمعة على المستخدمين الفائقين: {} / Cannot perform bulk actions on superusers: {}').format(
                    ', '.join(map(str, superuser_ids)),
                    ', '.join(map(str, superuser_ids))
                )
            )
        
        return unique_ids


# =============================================================================
# User Statistics Serializer
# مسلسل إحصائيات المستخدمين
# =============================================================================

class AdminUserStatsSerializer(serializers.Serializer):
    """
    Admin User Statistics Serializer
    مسلسل إحصائيات المستخدمين
    """
    
    total = serializers.IntegerField(help_text=_('إجمالي المستخدمين'))
    active = serializers.IntegerField(help_text=_('نشط'))
    inactive = serializers.IntegerField(help_text=_('غير نشط'))
    customers = serializers.IntegerField(help_text=_('زبائن'))
    vendors = serializers.IntegerField(help_text=_('بائعون'))
    admins = serializers.IntegerField(help_text=_('مطورون'))
    this_week = serializers.IntegerField(help_text=_('هذا الأسبوع'))
    this_month = serializers.IntegerField(help_text=_('هذا الشهر'))
    verified_emails = serializers.IntegerField(help_text=_('بريد إلكتروني مُتحقق'))

