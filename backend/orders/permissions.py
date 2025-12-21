"""
Order Permissions
صلاحيات الطلبات

Custom permissions for order management.
صلاحيات مخصصة لإدارة الطلبات.
"""

from rest_framework import permissions
from users.permissions import IsVendor, IsAdmin


class IsVendorOrAdmin(permissions.BasePermission):
    """
    Permission class: Vendor or Admin
    فئة صلاحية: بائع أو مطور
    
    Allows access to users with vendor or admin role.
    يسمح بالوصول للمستخدمين بدور بائع أو مطور.
    """
    
    message = "You must be a vendor or admin to perform this action."
    
    def has_permission(self, request, view):
        """
        Check if user is vendor or admin
        التحقق من إذا كان المستخدم بائع أو مطور
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        return IsVendor().has_permission(request, view) or IsAdmin().has_permission(request, view)

