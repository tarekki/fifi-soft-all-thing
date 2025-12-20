from django.db import models
from django.conf import settings
from products.models import ProductVariant


class Order(models.Model):
    """
    Customer order
    طلب العميل
    
    This model represents a customer order in the system.
    Supports both authenticated users and guest orders.
    
    هذا النموذج يمثل طلب عميل في النظام.
    يدعم المستخدمين المسجلين والطلبات بدون تسجيل دخول.
    """
    # Order info
    # معلومات الطلب
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    
    # User relationship (for authenticated users)
    # علاقة المستخدم (للمستخدمين المسجلين)
    # If user is None, this is a guest order
    # إذا كان user هو None، فهذا طلب بدون تسجيل دخول
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        help_text='User who placed this order (null for guest orders).'
    )
    
    # Guest order flag
    # علامة طلب بدون تسجيل دخول
    is_guest_order = models.BooleanField(
        default=False,
        help_text='True if this order was placed without user authentication.'
    )
    
    # Customer info (for both authenticated and guest orders)
    # معلومات العميل (للمستخدمين المسجلين والطلبات بدون تسجيل)
    # For authenticated users: these can be pre-filled from user profile
    # For guest orders: these are required
    # للمستخدمين المسجلين: يمكن ملؤها من الملف الشخصي
    # للطلبات بدون تسجيل: هذه الحقول مطلوبة
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()
    
    # Order type
    ORDER_TYPES = [
        ('online', 'Online (Delivery)'),
        ('pos', 'POS (In-store)'),
    ]
    order_type = models.CharField(max_length=20, choices=ORDER_TYPES, default='online')
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Yalla Go fee')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Commission (10% of subtotal)
    platform_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
    
    def save(self, *args, **kwargs):
        """
        Override save method to:
        - Generate order number if not exists
        - Set is_guest_order flag automatically
        - Calculate commission and total
        
        تجاوز طريقة الحفظ لـ:
        - إنشاء رقم الطلب إذا لم يكن موجوداً
        - ضبط علامة is_guest_order تلقائياً
        - حساب العمولة والإجمالي
        """
        # Generate order number if not exists
        # إنشاء رقم الطلب إذا لم يكن موجوداً
        if not self.order_number:
            import uuid
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        # Set is_guest_order flag automatically
        # ضبط علامة is_guest_order تلقائياً
        # If user is None, this is a guest order
        # إذا كان user هو None، فهذا طلب بدون تسجيل دخول
        self.is_guest_order = self.user is None
        
        # Calculate commission (10% of subtotal)
        # حساب العمولة (10% من المجموع الفرعي)
        self.platform_commission = self.subtotal * 0.10
        
        # Calculate total
        # حساب الإجمالي
        self.total = self.subtotal + self.delivery_fee
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.order_number} - {self.customer_name}"


class OrderItem(models.Model):
    """
    Individual item in an order
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Price at time of order')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
    
    @property
    def subtotal(self):
        return self.price * self.quantity
    
    def __str__(self):
        return f"{self.product_variant} x {self.quantity}"
