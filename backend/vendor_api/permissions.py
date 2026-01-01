"""
Vendor API Permissions
صلاحيات API البائعين

هذا الملف يحتوي على جميع صلاحيات البائعين المستخدمة في API البائعين.
This file contains all vendor permissions used in the Vendor API.

Security Features:
- Role-based access control (RBAC)
- Vendor ownership verification
- Granular permissions per resource
"""

from rest_framework.permissions import BasePermission
from users.permissions import IsVendor
from users.models import VendorUser


# =============================================================================
# Base Vendor Permissions
# صلاحيات البائع الأساسية
# =============================================================================

class IsVendorUser(IsVendor):
    """
    Permission class that only allows vendor users.
    كلاس صلاحيات يسمح فقط للمستخدمين البائعين.
    
    This is the base permission for all vendor API endpoints.
    هذه الصلاحية الأساسية لجميع نقاط API البائعين.
    
    Usage:
        permission_classes = [IsVendorUser]
    """
    
    message = "You must be a vendor to access this endpoint."
    message_ar = "يجب أن تكون بائعاً للوصول إلى هذا النقطة."


# =============================================================================
# Vendor Ownership Permissions
# صلاحيات ملكية البائع
# =============================================================================

class IsVendorOwner(BasePermission):
    """
    Permission class that verifies the user owns or is associated with a vendor.
    كلاس صلاحيات يتحقق من أن المستخدم يملك أو مرتبط ببائع.
    
    This permission ensures that vendors can only access their own data.
    هذه الصلاحية تضمن أن البائعين يمكنهم الوصول فقط لبياناتهم.
    
    Usage:
        permission_classes = [IsVendorUser, IsVendorOwner]
    """
    
    message = "You must be associated with a vendor to access this endpoint."
    message_ar = "يجب أن تكون مرتبطاً ببائع للوصول إلى هذا النقطة."
    
    def has_permission(self, request, view):
        """
        Check if user is authenticated and is a vendor.
        التحقق من أن المستخدم مسجل دخول وهو بائع.
        """
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.role != 'vendor':
            return False
        
        # Check if user is associated with a vendor
        # التحقق من أن المستخدم مرتبط ببائع
        return VendorUser.objects.filter(user=request.user).exists()
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has permission to access this specific object.
        التحقق من أن المستخدم لديه صلاحية للوصول إلى هذا الكائن المحدد.
        
        This method is called for object-level permissions.
        هذه الطريقة تُستدعى لصلاحيات على مستوى الكائن.
        """
        # Get vendor associated with the user
        # الحصول على البائع المرتبط بالمستخدم
        vendor_user = VendorUser.objects.filter(user=request.user).first()
        if not vendor_user:
            return False
        
        vendor = vendor_user.vendor
        
        # Check if object belongs to this vendor
        # التحقق من أن الكائن ينتمي لهذا البائع
        if hasattr(obj, 'vendor'):
            return obj.vendor == vendor
        elif hasattr(obj, 'product'):
            # For order items, check through product
            # للعناصر الطلب، تحقق من خلال المنتج
            return obj.product.vendor == vendor
        elif hasattr(obj, 'order'):
            # For order items, check through order items
            # لعناصر الطلب، تحقق من خلال عناصر الطلب
            from orders.models import OrderItem
            return OrderItem.objects.filter(
                order=obj.order,
                product__vendor=vendor
            ).exists()
        
        return False

