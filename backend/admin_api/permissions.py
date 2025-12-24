"""
Admin API Permissions
صلاحيات API الإدارة

هذا الملف يحتوي على جميع صلاحيات الأدمن المستخدمة في API الإدارة.
This file contains all admin permissions used in the Admin API.

Security Features:
- Role-based access control (RBAC)
- Granular permissions per resource
- Staff-only access enforcement
"""

from rest_framework.permissions import BasePermission
from functools import wraps
from rest_framework.response import Response
from rest_framework import status


# =============================================================================
# Admin Role Constants
# ثوابت أدوار الأدمن
# =============================================================================

class AdminRoles:
    """
    Admin role constants.
    ثوابت أدوار الأدمن.
    
    Roles hierarchy (from highest to lowest):
    - SUPER_ADMIN: Full access to everything
    - ADMIN: Content management, limited user management
    - MODERATOR: View only, limited actions
    """
    SUPER_ADMIN = 'super_admin'  # كل الصلاحيات
    ADMIN = 'admin'              # إدارة المحتوى
    MODERATOR = 'moderator'      # مراجعة فقط


# =============================================================================
# Base Admin Permissions
# صلاحيات الأدمن الأساسية
# =============================================================================

class IsAdminUser(BasePermission):
    """
    Permission class that only allows admin users (is_staff=True).
    كلاس صلاحيات يسمح فقط للمستخدمين الإداريين.
    
    This is the base permission for all admin API endpoints.
    هذه الصلاحية الأساسية لجميع نقاط API الإدارة.
    
    Usage:
        permission_classes = [IsAdminUser]
    """
    
    message = 'يجب أن تكون مسؤولاً للوصول لهذه الصفحة. / Admin access required.'
    
    def has_permission(self, request, view):
        """
        Check if user is authenticated and is staff.
        التحقق من أن المستخدم مسجل وهو staff.
        """
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_staff
        )


class IsSuperAdmin(BasePermission):
    """
    Permission class that only allows super admin users (is_superuser=True).
    كلاس صلاحيات يسمح فقط للمسؤولين الفائقين.
    
    Use this for sensitive operations like:
    - User role management
    - System settings
    - Audit logs
    
    Usage:
        permission_classes = [IsSuperAdmin]
    """
    
    message = 'يجب أن تكون مسؤولاً فائقاً للوصول لهذه الصفحة. / Super admin access required.'
    
    def has_permission(self, request, view):
        """
        Check if user is authenticated and is superuser.
        التحقق من أن المستخدم مسجل وهو superuser.
        """
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_superuser
        )


class IsAdminOrReadOnly(BasePermission):
    """
    Permission class that allows read access to any admin, 
    but write access only to super admins.
    
    كلاس صلاحيات يسمح بالقراءة لأي أدمن،
    لكن الكتابة فقط للمسؤولين الفائقين.
    
    Usage:
        permission_classes = [IsAdminOrReadOnly]
    """
    
    message = 'ليس لديك صلاحية لهذه العملية. / You do not have permission for this action.'
    
    def has_permission(self, request, view):
        """
        Check permissions based on request method.
        التحقق من الصلاحيات بناءً على نوع الطلب.
        """
        # Must be staff to access at all
        # يجب أن يكون staff للوصول
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return False
        
        # Read operations (GET, HEAD, OPTIONS) allowed for all staff
        # عمليات القراءة مسموحة لجميع الـ staff
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write operations (POST, PUT, PATCH, DELETE) require superuser
        # عمليات الكتابة تتطلب superuser
        return request.user.is_superuser


# =============================================================================
# Resource-Specific Permissions
# صلاحيات خاصة بالموارد
# =============================================================================

class CanManageProducts(BasePermission):
    """
    Permission for managing products.
    صلاحية إدارة المنتجات.
    
    Allows:
    - Super Admin: Full access
    - Admin: Full access
    - Moderator: Read only
    """
    
    message = 'ليس لديك صلاحية لإدارة المنتجات. / You cannot manage products.'
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return False
        
        # Read operations allowed for all staff
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write operations require admin or superuser
        return request.user.is_superuser or hasattr(request.user, 'is_admin_user')


class CanManageOrders(BasePermission):
    """
    Permission for managing orders.
    صلاحية إدارة الطلبات.
    
    Allows:
    - Super Admin: Full access
    - Admin: Update status, view all
    - Moderator: View only
    """
    
    message = 'ليس لديك صلاحية لإدارة الطلبات. / You cannot manage orders.'
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return False
        
        # Read operations allowed for all staff
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write operations require admin or superuser
        return request.user.is_superuser or hasattr(request.user, 'is_admin_user')


class CanManageVendors(BasePermission):
    """
    Permission for managing vendors.
    صلاحية إدارة البائعين.
    
    Allows:
    - Super Admin: Full access (approve, reject, delete)
    - Admin: Approve, reject, update
    - Moderator: View only
    """
    
    message = 'ليس لديك صلاحية لإدارة البائعين. / You cannot manage vendors.'
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return False
        
        # Read operations allowed for all staff
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write operations require admin or superuser
        return request.user.is_superuser


class CanManageUsers(BasePermission):
    """
    Permission for managing users.
    صلاحية إدارة المستخدمين.
    
    Allows:
    - Super Admin: Full access (change roles, delete)
    - Admin: Block/unblock only
    - Moderator: View only
    """
    
    message = 'ليس لديك صلاحية لإدارة المستخدمين. / You cannot manage users.'
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return False
        
        # Read operations allowed for all staff
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Only superuser can modify users
        return request.user.is_superuser


class CanManageSettings(BasePermission):
    """
    Permission for managing site settings.
    صلاحية إدارة إعدادات الموقع.
    
    Allows:
    - Super Admin: Full access
    - Admin: No access to critical settings
    - Moderator: No access
    """
    
    message = 'ليس لديك صلاحية لإدارة الإعدادات. / You cannot manage settings.'
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return False
        
        # Only superuser can access settings
        return request.user.is_superuser


# =============================================================================
# Utility Functions
# دوال مساعدة
# =============================================================================

def get_admin_role(user):
    """
    Get the admin role for a user.
    الحصول على دور الأدمن للمستخدم.
    
    Args:
        user: User instance
        
    Returns:
        str: Admin role constant or None if not admin
    """
    if not user or not user.is_authenticated:
        return None
    
    if user.is_superuser:
        return AdminRoles.SUPER_ADMIN
    
    if user.is_staff:
        # Check for custom admin role field if exists
        if hasattr(user, 'admin_role'):
            return user.admin_role
        return AdminRoles.ADMIN
    
    return None


def get_user_permissions(user):
    """
    Get list of permissions for an admin user.
    الحصول على قائمة صلاحيات المستخدم الأدمن.
    
    Args:
        user: User instance
        
    Returns:
        list: List of permission strings
    """
    if not user or not user.is_authenticated or not user.is_staff:
        return []
    
    permissions = ['dashboard.view']  # All admins can view dashboard
    
    if user.is_superuser:
        return [
            'dashboard.view',
            'settings.view', 'settings.edit',
            'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'orders.view', 'orders.edit', 'orders.refund',
            'vendors.view', 'vendors.approve', 'vendors.reject', 'vendors.edit',
            'users.view', 'users.edit', 'users.block', 'users.roles',
            'promotions.view', 'promotions.create', 'promotions.edit', 'promotions.delete',
            'reports.view', 'reports.export',
        ]
    
    # Regular admin permissions
    return [
        'dashboard.view',
        'categories.view', 'categories.create', 'categories.edit',
        'products.view', 'products.create', 'products.edit',
        'orders.view', 'orders.edit',
        'vendors.view', 'vendors.approve', 'vendors.reject',
        'users.view', 'users.block',
        'promotions.view', 'promotions.create', 'promotions.edit',
        'reports.view',
    ]

