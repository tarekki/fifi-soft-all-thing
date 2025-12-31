"""
Custom Permissions - Role-Based Access Control
صلاحيات مخصصة - التحكم بالوصول بناءً على الأدوار

This module defines custom permission classes for role-based access control.
هذا الوحدة تعرّف فئات صلاحيات مخصصة للتحكم بالوصول بناءً على الأدوار.

Permissions:
- IsCustomer: Only customers can access
- IsVendor: Only vendors can access
- IsAdmin: Only admins can access
- IsVendorOwner: Only vendor owners can access
"""

from rest_framework import permissions
from .models import User


# ============================================================================
# Customer Permission
# صلاحية الزبون
# ============================================================================

class IsCustomer(permissions.BasePermission):
    """
    Permission class for customers only
    فئة صلاحية للزبائن فقط
    
    Allows access only to users with 'customer' role.
    يسمح بالوصول فقط للمستخدمين بدور 'customer'.
    """
    
    message = "You must be a customer to perform this action."
    
    def has_permission(self, request, view):
        """
        Check if user is a customer
        التحقق من إذا كان المستخدم زبون
        """
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.CUSTOMER
        )


# ============================================================================
# Vendor Permission
# صلاحية البائع
# ============================================================================

class IsVendor(permissions.BasePermission):
    """
    Permission class for vendors only
    فئة صلاحية للبائعين فقط
    
    Allows access only to users with 'vendor' role.
    يسمح بالوصول فقط للمستخدمين بدور 'vendor'.
    """
    
    message = "You must be a vendor to perform this action."
    
    def has_permission(self, request, view):
        """
        Check if user is a vendor
        التحقق من إذا كان المستخدم بائع
        """
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.VENDOR
        )


# ============================================================================
# Admin Permission
# صلاحية المطور
# ============================================================================

class IsAdmin(permissions.BasePermission):
    """
    Permission class for admins only
    فئة صلاحية للمطورين فقط
    
    Allows access only to users with 'admin' role or superuser.
    يسمح بالوصول فقط للمستخدمين بدور 'admin' أو superuser.
    """
    
    message = "You must be an admin to perform this action."
    
    def has_permission(self, request, view):
        """
        Check if user is an admin
        التحقق من إذا كان المستخدم مطور
        """
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_admin or request.user.is_superuser)
        )



# ============================================================================
# Vendor Owner Permission
# صلاحية مالك البائع
# ============================================================================

class IsVendorOwner(permissions.BasePermission):
    """
    Permission class for vendor owners
    فئة صلاحية لمالكي البائعين
    
    Allows access only to users who own the vendor.
    يسمح بالوصول فقط للمستخدمين الذين يملكون البائع.
    
    Usage:
    - Use in views that require vendor ownership
    - Check if user is owner of specific vendor
    """
    
    message = "You must be the owner of this vendor to perform this action."
    
    def has_permission(self, request, view):
        """
        Check if user is authenticated
        التحقق من إذا كان المستخدم مسجلاً
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user owns the vendor
        التحقق من إذا كان المستخدم يملك البائع
        
        This method is called for object-level permissions.
        هذه الطريقة تُستدعى لصلاحيات على مستوى الكائن.
        """
        # If object is a vendor, check ownership
        # إذا كان الكائن بائع، تحقق من الملكية
        if hasattr(obj, 'vendor'):
            vendor = obj.vendor
        elif hasattr(obj, 'id'):  # If obj is vendor itself
            vendor = obj
        else:
            return False
        
        # Check if user is owner of this vendor
        # التحقق من إذا كان المستخدم مالك هذا البائع
        from .models import VendorUser
        return VendorUser.objects.filter(
            user=request.user,
            vendor=vendor,
            is_owner=True
        ).exists()


# ============================================================================
# Admin or Read Only Permission
# صلاحية المطور أو القراءة فقط
# ============================================================================

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission class: Admin can modify, others can only read
    فئة صلاحية: المطور يمكنه التعديل، الباقي قراءة فقط
    
    Allows read access to all users, but write access only to admins.
    يسمح بالقراءة لجميع المستخدمين، ولكن الكتابة فقط للمطورين.
    """
    
    message = "You must be an admin to perform this action."
    
    def has_permission(self, request, view):
        """
        Check permissions
        التحقق من الصلاحيات
        """
        # Read permissions for all authenticated users
        # صلاحيات القراءة لجميع المستخدمين المسجلين
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions only for admins
        # صلاحيات الكتابة فقط للمطورين
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_admin or request.user.is_superuser)
        )


