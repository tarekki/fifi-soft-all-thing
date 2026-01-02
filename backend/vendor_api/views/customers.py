"""
Vendor Customer Views
عروض زبائن البائع

This module contains views for managing customers in the vendor panel.
هذا الملف يحتوي على عروض لإدارة الزبائن في لوحة البائع.

API Endpoints:
    GET    /api/v1/vendor/customers/                    - List all customers (with pagination, filters)

Security:
    - All endpoints require vendor authentication
    - Returns customers only from the vendor's orders
    - Customer data is aggregated and anonymized where needed

الأمان:
    - جميع النقاط تتطلب مصادقة البائع
    - يعيد الزبائن فقط من طلبات البائع
    - بيانات الزبائن مجمعة ومجهولة الهوية عند الحاجة
"""

import hashlib
from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Count, Max, Min
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from drf_spectacular.utils import extend_schema, OpenApiParameter

from vendor_api.permissions import IsVendorUser, IsVendorOwner
from vendor_api.throttling import VendorUserRateThrottle
from vendor_api.serializers.customers import VendorCustomerListSerializer
from orders.models import Order, OrderItem
from users.models import VendorUser, User
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Helper Functions
# دوال مساعدة
# =============================================================================

def generate_customer_key(vendor_id: int, user_id: int = None, guest_identifier: str = None) -> str:
    """
    Generate a unique customer key for vendor-specific customer identification.
    إنشاء مفتاح عميل فريد لتحديد هوية العميل الخاص بالبائع.
    
    Args:
        vendor_id: Vendor ID
        user_id: User ID (for authenticated customers)
        guest_identifier: Guest identifier (for guest orders)
    
    Returns:
        Unique customer key (hash)
    """
    if user_id:
        # Authenticated customer: hash(vendor_id + user_id)
        raw_key = f"vendor_{vendor_id}_user_{user_id}"
    elif guest_identifier:
        # Guest customer: hash(vendor_id + guest_identifier)
        raw_key = f"vendor_{vendor_id}_guest_{guest_identifier}"
    else:
        # Fallback: should not happen
        raw_key = f"vendor_{vendor_id}_unknown"
    
    # Generate SHA256 hash and take first 16 characters
    # إنشاء hash SHA256 وأخذ أول 16 حرف
    hash_obj = hashlib.sha256(raw_key.encode())
    return hash_obj.hexdigest()[:16]


def mask_phone_number(phone: str) -> str:
    """
    Mask phone number for privacy.
    إخفاء رقم الهاتف للخصوصية.
    
    Example: +963 912 345 678 -> +963 9** *** 678
    
    Args:
        phone: Phone number string
    
    Returns:
        Masked phone number or None
    """
    if not phone:
        return None
    
    # Remove spaces and special characters
    # إزالة المسافات والأحرف الخاصة
    cleaned = ''.join(filter(str.isdigit, phone))
    
    if len(cleaned) < 6:
        return phone  # Too short to mask
    
    # Keep first 3 and last 3 digits, mask the rest
    # الاحتفاظ بأول 3 وآخر 3 أرقام، إخفاء الباقي
    if len(cleaned) <= 9:
        # Short number: +963 9** 678
        masked = cleaned[:3] + '*' * (len(cleaned) - 6) + cleaned[-3:]
    else:
        # Long number: +963 9** *** 678
        masked = cleaned[:3] + '** *** ' + cleaned[-3:]
    
    # Try to preserve original format
    # محاولة الحفاظ على التنسيق الأصلي
    if phone.startswith('+'):
        return '+' + masked
    return masked


# =============================================================================
# Customer List View
# عرض قائمة الزبائن
# =============================================================================

class VendorCustomerListView(APIView):
    """
    List all customers for the vendor with filtering and pagination.
    عرض جميع الزبائن للبائع مع التصفية والترقيم.
    
    Returns aggregated customer data from vendor's orders:
    - Only customers who have placed orders containing vendor's products
    - Aggregated statistics (orders_count, total_spent, last_order_at)
    - Privacy-protected data (masked phone numbers)
    
    يعيد بيانات الزبائن المجمعة من طلبات البائع:
    - فقط الزبائن الذين قدموا طلبات تحتوي على منتجات البائع
    - إحصائيات مجمعة (عدد الطلبات، إجمالي الإنفاق، تاريخ آخر طلب)
    - بيانات محمية للخصوصية (أرقام هواتف مخفية)
    
    Supports:
        - Search by name, email
        - Filter by date range (first_order_at, last_order_at)
        - Pagination
        - Sorting (by orders_count, total_spent, last_order_at)
    
    يدعم:
        - البحث بالاسم، البريد الإلكتروني
        - التصفية حسب نطاق التاريخ (أول طلب، آخر طلب)
        - الترقيم
        - الترتيب (حسب عدد الطلبات، إجمالي الإنفاق، تاريخ آخر طلب)
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='List Vendor Customers',
        description='Get all customers for this vendor with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by customer name or email'),
            OpenApiParameter(name='date_from', type=str, description='Filter by first order date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by first order date to (YYYY-MM-DD)'),
            OpenApiParameter(name='last_order_from', type=str, description='Filter by last order date from (YYYY-MM-DD)'),
            OpenApiParameter(name='last_order_to', type=str, description='Filter by last order date to (YYYY-MM-DD)'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field (orders_count, total_spent, last_order_at, name)'),
            OpenApiParameter(name='sort_dir', type=str, description='Sort direction (asc, desc)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        tags=['Vendor Customers'],
    )
    def get(self, request):
        """
        List all customers for the vendor.
        عرض جميع الزبائن للبائع.
        """
        # Get vendor associated with the authenticated user
        # الحصول على البائع المرتبط بالمستخدم المسجل
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get all order items that belong to this vendor
        # الحصول على جميع عناصر الطلب التي تنتمي لهذا البائع
        vendor_order_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor
        ).select_related('order', 'order__user')
        
        # Get unique orders
        # الحصول على الطلبات الفريدة
        order_ids = vendor_order_items.values_list('order_id', flat=True).distinct()
        
        # Get orders that contain vendor's products
        # الحصول على الطلبات التي تحتوي على منتجات البائع
        orders = Order.objects.filter(
            id__in=order_ids
        ).select_related('user').prefetch_related('items')
        
        # =================================================================
        # Aggregate customer data
        # تجميع بيانات الزبائن
        # =================================================================
        customers_data = {}
        
        for order in orders:
            # Determine customer identifier
            # تحديد معرف العميل
            if order.user:
                # Authenticated customer
                # عميل مسجل
                customer_key = generate_customer_key(vendor.id, order.user.id)
                customer_id = order.user.id
                customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
                if not customer_name:
                    customer_name = order.user.email.split('@')[0] if order.user.email else _('مستخدم / User')
                customer_email = order.user.email
                customer_phone = order.user.phone if hasattr(order.user, 'phone') else None
            else:
                # Guest customer
                # عميل ضيف
                guest_identifier = order.customer_name or order.customer_phone or f"guest_{order.id}"
                customer_key = generate_customer_key(vendor.id, None, guest_identifier)
                customer_id = None
                customer_name = order.customer_name or _('ضيف / Guest')
                customer_email = None
                customer_phone = order.customer_phone
            
            # Initialize customer data if not exists
            # تهيئة بيانات العميل إذا لم تكن موجودة
            if customer_key not in customers_data:
                customers_data[customer_key] = {
                    'customer_key': customer_key,
                    'name': customer_name,
                    'email': customer_email,
                    'phone': customer_phone,
                    'orders_count': 0,
                    'total_spent': Decimal('0.00'),
                    'last_order_at': None,
                    'first_order_at': None,
                }
            
            # Calculate vendor-specific total for this order
            # حساب الإجمالي الخاص بالبائع لهذا الطلب
            vendor_items = vendor_order_items.filter(order=order)
            vendor_total = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in vendor_items
            ) or Decimal('0.00')
            
            # Update customer statistics
            # تحديث إحصائيات العميل
            customers_data[customer_key]['orders_count'] += 1
            customers_data[customer_key]['total_spent'] += vendor_total
            
            # Update order dates
            # تحديث تواريخ الطلبات
            if not customers_data[customer_key]['first_order_at'] or order.created_at < customers_data[customer_key]['first_order_at']:
                customers_data[customer_key]['first_order_at'] = order.created_at
            
            if not customers_data[customer_key]['last_order_at'] or order.created_at > customers_data[customer_key]['last_order_at']:
                customers_data[customer_key]['last_order_at'] = order.created_at
        
        # Convert to list for filtering and sorting
        # تحويل إلى قائمة للتصفية والترتيب
        customers_list = list(customers_data.values())
        
        # =================================================================
        # Search Filter
        # فلتر البحث
        # =================================================================
        search = request.query_params.get('search', '').strip()
        if search:
            filtered_customers = []
            search_lower = search.lower()
            for customer in customers_list:
                if (search_lower in customer['name'].lower() or
                    (customer['email'] and search_lower in customer['email'].lower())):
                    filtered_customers.append(customer)
            customers_list = filtered_customers
        
        # =================================================================
        # Date Range Filters
        # فلاتر نطاق التاريخ
        # =================================================================
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        last_order_from = request.query_params.get('last_order_from')
        last_order_to = request.query_params.get('last_order_to')
        
        if date_from or date_to:
            filtered_customers = []
            for customer in customers_list:
                first_order = customer['first_order_at']
                if first_order:
                    first_order_date = first_order.date()
                    if date_from:
                        try:
                            from_date = timezone.datetime.strptime(date_from, '%Y-%m-%d').date()
                            if first_order_date < from_date:
                                continue
                        except ValueError:
                            pass
                    if date_to:
                        try:
                            to_date = timezone.datetime.strptime(date_to, '%Y-%m-%d').date()
                            if first_order_date > to_date:
                                continue
                        except ValueError:
                            pass
                filtered_customers.append(customer)
            customers_list = filtered_customers
        
        if last_order_from or last_order_to:
            filtered_customers = []
            for customer in customers_list:
                last_order = customer['last_order_at']
                if last_order:
                    last_order_date = last_order.date()
                    if last_order_from:
                        try:
                            from_date = timezone.datetime.strptime(last_order_from, '%Y-%m-%d').date()
                            if last_order_date < from_date:
                                continue
                        except ValueError:
                            pass
                    if last_order_to:
                        try:
                            to_date = timezone.datetime.strptime(last_order_to, '%Y-%m-%d').date()
                            if last_order_date > to_date:
                                continue
                        except ValueError:
                            pass
                filtered_customers.append(customer)
            customers_list = filtered_customers
        
        # =================================================================
        # Sorting
        # الترتيب
        # =================================================================
        sort_by = request.query_params.get('sort_by', 'last_order_at')
        sort_dir = request.query_params.get('sort_dir', 'desc')
        
        reverse = (sort_dir == 'desc')
        
        if sort_by == 'orders_count':
            customers_list.sort(key=lambda x: x['orders_count'], reverse=reverse)
        elif sort_by == 'total_spent':
            customers_list.sort(key=lambda x: x['total_spent'], reverse=reverse)
        elif sort_by == 'last_order_at':
            customers_list.sort(
                key=lambda x: x['last_order_at'] if x['last_order_at'] else timezone.datetime.min.replace(tzinfo=timezone.utc),
                reverse=reverse
            )
        elif sort_by == 'name':
            customers_list.sort(key=lambda x: x['name'].lower(), reverse=reverse)
        else:
            # Default: sort by last_order_at desc
            customers_list.sort(
                key=lambda x: x['last_order_at'] if x['last_order_at'] else timezone.datetime.min.replace(tzinfo=timezone.utc),
                reverse=True
            )
        
        # =================================================================
        # Mask phone numbers
        # إخفاء أرقام الهواتف
        # =================================================================
        for customer in customers_list:
            customer['phone'] = mask_phone_number(customer['phone'])
            # Convert Decimal to string for JSON serialization
            customer['total_spent'] = str(customer['total_spent'])
        
        # =================================================================
        # Pagination
        # الترقيم
        # =================================================================
        # Manual pagination for list data
        # ترقيم يدوي لبيانات القائمة
        page_size = int(request.query_params.get('page_size', 24))
        page_size = min(page_size, 100)  # Max 100 items per page
        page_number = int(request.query_params.get('page', 1))
        
        total_count = len(customers_list)
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
        
        # Calculate pagination slice
        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size
        paginated_customers = customers_list[start_index:end_index]
        
        # Build pagination response
        # بناء استجابة الترقيم
        from urllib.parse import urlencode
        
        base_url = request.build_absolute_uri().split('?')[0]
        next_url = None
        previous_url = None
        
        # Preserve other query parameters
        # الحفاظ على معاملات الاستعلام الأخرى
        other_params = dict(request.query_params)
        other_params.pop('page', None)
        other_params.pop('page_size', None)
        
        if page_number < total_pages:
            params = {**other_params, 'page': str(page_number + 1), 'page_size': str(page_size)}
            next_url = f"{base_url}?{urlencode(params, doseq=True)}" if params else f"{base_url}?page={page_number + 1}&page_size={page_size}"
        
        if page_number > 1:
            params = {**other_params, 'page': str(page_number - 1), 'page_size': str(page_size)}
            previous_url = f"{base_url}?{urlencode(params, doseq=True)}" if params else f"{base_url}?page={page_number - 1}&page_size={page_size}"
        
        return success_response(data={
            'results': paginated_customers,
            'pagination': {
                'count': total_count,
                'next': next_url,
                'previous': previous_url,
                'page': page_number,
                'page_size': page_size,
                'total_pages': total_pages,
            }
        })

