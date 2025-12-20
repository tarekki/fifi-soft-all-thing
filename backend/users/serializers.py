"""
User Serializers - API Data Serialization
مسلسلات المستخدمين - تسلسل بيانات الـ API

This module defines serializers for user-related API endpoints.
هذا الوحدة تعرّف مسلسلات لـ endpoints المستخدمين في الـ API.

Serializers:
- UserRegistrationSerializer: For user registration
- UserLoginSerializer: For user login
- UserProfileSerializer: For user profile management
- PasswordChangeSerializer: For password changes
- EmailVerificationSerializer: For email verification
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserProfile


# ============================================================================
# User Registration Serializer
# مسلسل تسجيل المستخدم
# ============================================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    مسلسل لتسجيل المستخدم
    
    Validates and creates a new user account.
    يتحقق من البيانات وينشئ حساب مستخدم جديد.
    """
    
    # Password fields (write-only, not returned in response)
    # حقول كلمة المرور (للكتابة فقط، لا تُعاد في الاستجابة)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long and meet complexity requirements."
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Confirm your password."
    )
    
    class Meta:
        model = User
        fields = [
            'email',
            'phone',
            'full_name',
            'password',
            'password_confirm',
            'role',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'phone': {'required': True},
            'full_name': {'required': True},
            'role': {'required': False, 'default': User.Role.CUSTOMER},
        }
    
    def validate_email(self, value):
        """
        Validate email uniqueness
        التحقق من تفرد البريد الإلكتروني
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_phone(self, value):
        """
        Validate phone uniqueness
        التحقق من تفرد رقم الهاتف
        """
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value
    
    def validate(self, attrs):
        """
        Validate password confirmation
        التحقق من تطابق كلمة المرور
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })
        return attrs
    
    def create(self, validated_data):
        """
        Create user and user profile
        إنشاء مستخدم وملف شخصي
        """
        # Remove password_confirm (not needed for user creation)
        # إزالة password_confirm (غير مطلوب لإنشاء المستخدم)
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Get role (default to CUSTOMER if not provided)
        # الحصول على الدور (افتراضي: CUSTOMER إذا لم يُحدد)
        role = validated_data.pop('role', User.Role.CUSTOMER)
        
        # Create user
        # إنشاء المستخدم
        user = User.objects.create_user(
            password=password,
            role=role,
            **validated_data
        )
        
        # Create user profile automatically
        # إنشاء الملف الشخصي تلقائياً
        UserProfile.objects.create(user=user)
        
        return user


# ============================================================================
# User Login Serializer
# مسلسل تسجيل الدخول
# ============================================================================

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    مسلسل لتسجيل الدخول
    
    Authenticates user and returns JWT tokens.
    يتحقق من المستخدم ويعيد JWT tokens.
    """
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """
        Validate user credentials
        التحقق من بيانات اعتماد المستخدم
        """
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Authenticate user
            # التحقق من المستخدم
            user = authenticate(
                request=self.context.get('request'),
                username=email,  # We use email as username
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    "Invalid email or password.",
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    "User account is disabled.",
                    code='authorization'
                )
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError(
                "Must include 'email' and 'password'.",
                code='authorization'
            )
        
        return attrs


# ============================================================================
# User Profile Serializer
# مسلسل الملف الشخصي
# ============================================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile
    مسلسل للملف الشخصي
    
    Displays user information including profile data.
    يعرض معلومات المستخدم بما في ذلك بيانات الملف الشخصي.
    """
    
    # Nested profile serializer
    # مسلسل ملف شخصي متداخل
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'phone',
            'full_name',
            'role',
            'is_active',
            'profile',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'is_active', 'created_at', 'updated_at']
    
    def get_profile(self, obj):
        """
        Get user profile data
        الحصول على بيانات الملف الشخصي
        """
        try:
            profile = obj.profile
            return {
                'address': profile.address,
                'avatar': profile.avatar.url if profile.avatar else None,
                'preferred_language': profile.preferred_language,
            }
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            # إنشاء ملف شخصي إذا لم يكن موجوداً
            profile = UserProfile.objects.create(user=obj)
            return {
                'address': profile.address,
                'avatar': None,
                'preferred_language': profile.preferred_language,
            }


# ============================================================================
# User Profile Update Serializer
# مسلسل تحديث الملف الشخصي
# ============================================================================

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    مسلسل لتحديث الملف الشخصي
    
    Allows updating user full_name and profile information.
    يسمح بتحديث الاسم الكامل وبيانات الملف الشخصي.
    """
    
    # Profile fields (nested)
    # حقول الملف الشخصي (متداخلة)
    address = serializers.CharField(
        source='profile.address',
        required=False,
        allow_blank=True
    )
    preferred_language = serializers.ChoiceField(
        source='profile.preferred_language',
        choices=UserProfile.Language.choices,
        required=False
    )
    avatar = serializers.ImageField(
        source='profile.avatar',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = User
        fields = [
            'full_name',
            'address',
            'preferred_language',
            'avatar',
        ]
    
    def update(self, instance, validated_data):
        """
        Update user and profile
        تحديث المستخدم والملف الشخصي
        """
        # Extract profile data
        # استخراج بيانات الملف الشخصي
        profile_data = validated_data.pop('profile', {})
        
        # Update user
        # تحديث المستخدم
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.save()
        
        # Update or create profile
        # تحديث أو إنشاء الملف الشخصي
        profile, created = UserProfile.objects.get_or_create(user=instance)
        
        if 'address' in profile_data:
            profile.address = profile_data['address']
        if 'preferred_language' in profile_data:
            profile.preferred_language = profile_data['preferred_language']
        if 'avatar' in profile_data:
            profile.avatar = profile_data['avatar']
        
        profile.save()
        
        return instance


# ============================================================================
# Password Change Serializer
# مسلسل تغيير كلمة المرور
# ============================================================================

class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    مسلسل لتغيير كلمة المرور
    
    Validates old password and sets new password.
    يتحقق من كلمة المرور القديمة ويضبط كلمة المرور الجديدة.
    """
    
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Your current password."
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text="New password (must be at least 8 characters long and meet complexity requirements)."
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Confirm your new password."
    )
    
    def validate_old_password(self, value):
        """
        Validate old password
        التحقق من كلمة المرور القديمة
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Invalid old password.")
        return value
    
    def validate(self, attrs):
        """
        Validate password confirmation
        التحقق من تطابق كلمة المرور الجديدة
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password_confirm": "New passwords do not match."
            })
        return attrs
    
    def save(self):
        """
        Update user password
        تحديث كلمة مرور المستخدم
        """
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


# ============================================================================
# Email Verification Serializer
# مسلسل التحقق من البريد الإلكتروني
# ============================================================================

class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification
    مسلسل للتحقق من البريد الإلكتروني
    
    Validates email verification token.
    يتحقق من رمز التحقق من البريد الإلكتروني.
    """
    
    token = serializers.CharField(
        required=True,
        help_text="Email verification token."
    )

