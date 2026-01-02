import uuid
from decimal import Decimal
from django.db import models
from django.db import IntegrityError
from django.db.utils import IntegrityError as DbIntegrityError
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from products.models import ProductVariant


# =============================================================================
# Helper Functions
# دوال مساعدة
# =============================================================================

def zero_decimal():
    """
    Return zero Decimal value for default fields
    إرجاع قيمة Decimal صفر للحقول الافتراضية
    
    This is a callable to ensure each instance gets a fresh Decimal object.
    هذه دالة قابلة للاستدعاء لضمان حصول كل مثيل على كائن Decimal جديد.
    """
    return Decimal("0.00")


class Order(models.Model):
    """
    Customer order
    طلب العميل
    
    This model represents a customer order in the system.
    Supports both authenticated users and guest orders.
    
    هذا النموذج يمثل طلب عميل في النظام.
    يدعم المستخدمين المسجلين والطلبات بدون تسجيل دخول.
    """
    
    # =========================================================================
    # Constants
    # الثوابت
    # =========================================================================
    
    FINAL_STATUSES = ('delivered', 'cancelled')
    MONEY_Q = Decimal("0.01")
    
    # =========================================================================
    # Order Information
    # معلومات الطلب
    # =========================================================================
    
    order_number = models.CharField(
        max_length=50,
        unique=True,
        null=False,
        blank=True,
        verbose_name=_('Order Number'),
        help_text=_('Order number (auto-generated if not provided) / رقم الطلب (يُنشأ تلقائياً إذا لم يُحدد)')
    )
    
    # =========================================================================
    # User Relationship
    # علاقة المستخدم
    # =========================================================================
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name=_('User'),
        help_text=_('User who placed this order (null for guest orders) / المستخدم الذي قدم الطلب (null للطلبات بدون تسجيل)')
    )
    
    is_guest_order = models.BooleanField(
        default=False,
        verbose_name=_('Is Guest Order'),
        help_text=_('True if this order was placed without user authentication / صحيح إذا تم تقديم الطلب بدون تسجيل دخول')
    )
    
    # =========================================================================
    # Vendor Relationship
    # علاقة البائع
    # =========================================================================
    
    vendor = models.ForeignKey(
        'vendors.Vendor',
        on_delete=models.DO_NOTHING,
        related_name="orders",
        db_index=True,
        verbose_name=_('Vendor'),
        help_text=_('Vendor associated with this order / البائع المرتبط بهذا الطلب')
    )
    
    # =========================================================================
    # Customer Information
    # معلومات العميل
    # =========================================================================
    
    customer_name = models.CharField(
        max_length=200,
        verbose_name=_('Customer Name'),
        help_text=_('Customer full name / اسم العميل الكامل')
    )
    
    customer_phone = models.CharField(
        max_length=20,
        verbose_name=_('Customer Phone'),
        help_text=_('Customer phone number / رقم هاتف العميل')
    )
    
    customer_address = models.TextField(
        verbose_name=_('Customer Address'),
        help_text=_('Delivery address / عنوان التوصيل')
    )
    
    # =========================================================================
    # Order Type & Status
    # نوع الطلب والحالة
    # =========================================================================
    
    ORDER_TYPES = [
        ('online', _('Online (Delivery) / أونلاين (توصيل)')),
        ('pos', _('POS (In-store) / نقطة البيع (في المتجر)')),
    ]
    
    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPES,
        default='online',
        verbose_name=_('Order Type'),
        help_text=_('Type of order / نوع الطلب')
    )
    
    STATUS_CHOICES = [
        ('pending', _('Pending / قيد الانتظار')),
        ('confirmed', _('Confirmed / مؤكد')),
        ('shipped', _('Shipped / تم الشحن')),
        ('delivered', _('Delivered / تم التسليم')),
        ('cancelled', _('Cancelled / ملغي')),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name=_('Status'),
        help_text=_('Order status / حالة الطلب'),
        db_index=True
    )
    
    # =========================================================================
    # Pricing
    # التسعير
    # =========================================================================
    
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=zero_decimal,
        verbose_name=_('Subtotal'),
        help_text=_('Order subtotal (before delivery fee) / المجموع الفرعي (قبل رسوم التوصيل)')
    )
    
    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=zero_decimal,
        verbose_name=_('Delivery Fee'),
        help_text=_('Yalla Go delivery fee / رسوم التوصيل (Yalla Go)')
    )
    
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=zero_decimal,
        verbose_name=_('Total'),
        help_text=_('Order total (subtotal + delivery fee) / الإجمالي (المجموع الفرعي + رسوم التوصيل)')
    )
    
    platform_commission = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=zero_decimal,
        verbose_name=_('Platform Commission'),
        help_text=_('Platform commission (10% of subtotal) / عمولة المنصة (10% من المجموع الفرعي)')
    )
    
    # =========================================================================
    # Notes
    # الملاحظات
    # =========================================================================
    
    notes = models.TextField(
        blank=True,
        verbose_name=_('Notes'),
        help_text=_('Additional notes about the order / ملاحظات إضافية حول الطلب')
    )
    
    # =========================================================================
    # Timestamps
    # الطوابع الزمنية
    # =========================================================================
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At'),
        help_text=_('When the order was created / تاريخ إنشاء الطلب')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At'),
        help_text=_('When the order was last updated / تاريخ آخر تحديث للطلب')
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['order_number']),
            models.Index(fields=['is_guest_order', 'created_at']),
            models.Index(fields=['order_type', 'status']),
        ]
    
    def save(self, *args, **kwargs):
        """
        Override save method to:
        - Generate order number if not exists (with collision handling)
        - Set is_guest_order flag automatically
        - Calculate commission and total (only if order is not finalized)
        
        تجاوز طريقة الحفظ لـ:
        - إنشاء رقم الطلب إذا لم يكن موجوداً (مع معالجة التصادم)
        - ضبط علامة is_guest_order تلقائياً
        - حساب العمولة والإجمالي (فقط إذا لم يكن الطلب نهائياً)
        """
        # Generate order number if not exists (with collision handling)
        # إنشاء رقم الطلب إذا لم يكن موجوداً (مع معالجة التصادم)
        if not self.order_number:
            for _ in range(10):
                self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
                # Prepare order data before saving
                # تحضير بيانات الطلب قبل الحفظ
                self._prepare_order_data()
                try:
                    super().save(*args, **kwargs)
                    return
                except (IntegrityError, DbIntegrityError) as e:
                    if "order_number" not in str(e).lower():
                        raise
                    self.order_number = ""
            # If all retries failed, raise error
            # إذا فشلت جميع المحاولات، ارفع خطأ
            raise IntegrityError("Failed to generate unique order number after 10 attempts")
        
        # If order_number already exists, proceed with normal save
        # إذا كان order_number موجوداً مسبقاً، تابع مع الحفظ العادي
        self._prepare_order_data()
        super().save(*args, **kwargs)
    
    def _prepare_order_data(self):
        """
        Prepare order data before saving (calculate totals, set flags)
        تحضير بيانات الطلب قبل الحفظ (حساب الإجماليات، ضبط العلامات)
        """
        # Set is_guest_order flag automatically
        # ضبط علامة is_guest_order تلقائياً
        self.is_guest_order = self.user is None
        
        # Only recalculate if order is not finalized
        # إعادة الحساب فقط إذا لم يكن الطلب نهائياً
        if not self.is_finalized:
            # Calculate commission using Decimal (10% of subtotal)
            # حساب العمولة باستخدام Decimal (10% من المجموع الفرعي)
            subtotal = self.subtotal or zero_decimal()
            self.platform_commission = (subtotal * Decimal("0.10")).quantize(self.MONEY_Q)
            
            # Calculate total safely (handle null/empty values)
            # حساب الإجمالي بطريقة آمنة (التعامل مع القيم الفارغة)
            delivery_fee = self.delivery_fee or zero_decimal()
            self.total = (subtotal + delivery_fee).quantize(self.MONEY_Q)
    
    @property
    def is_finalized(self):
        """
        Check if order is finalized (delivered or cancelled)
        التحقق من أن الطلب نهائي (تم التسليم أو ملغي)
        """
        return self.status in self.FINAL_STATUSES
    
    def __str__(self):
        return f"{self.order_number} - {self.customer_name}"


class OrderItem(models.Model):
    """
    Individual item in an order
    عنصر فردي في الطلب
    
    Represents a single product variant in an order with quantity and price.
    يمثل منتج واحد في الطلب مع الكمية والسعر.
    """
    
    # =========================================================================
    # Relationships
    # العلاقات
    # =========================================================================
    
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Order'),
        help_text=_('Order this item belongs to / الطلب الذي ينتمي إليه هذا العنصر')
    )
    
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        verbose_name=_('Product Variant'),
        help_text=_('Product variant ordered / متغير المنتج المطلوب')
    )
    
    vendor = models.ForeignKey(
        'vendors.Vendor',
        on_delete=models.DO_NOTHING,
        related_name="order_items",
        db_index=True,
        verbose_name=_('Vendor'),
        help_text=_('Vendor associated with this order item / البائع المرتبط بهذا العنصر')
    )
    
    # =========================================================================
    # Quantity & Pricing
    # الكمية والتسعير
    # =========================================================================
    
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name=_('Quantity'),
        help_text=_('Number of items ordered / عدد العناصر المطلوبة')
    )
    
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Price'),
        help_text=_('Price per unit at time of order (in Syrian Pounds) / السعر لكل وحدة وقت الطلب (بالليرة السورية)')
    )
    
    # =========================================================================
    # Timestamps
    # الطوابع الزمنية
    # =========================================================================
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At'),
        help_text=_('When this item was added to the order / تاريخ إضافة هذا العنصر للطلب')
    )
    
    class Meta:
        verbose_name = _('Order Item')
        verbose_name_plural = _('Order Items')
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['product_variant']),
            models.Index(fields=['order', 'product_variant']),
            models.Index(fields=['vendor']),
        ]
    
    @property
    def subtotal(self):
        """
        Calculate item subtotal (price * quantity)
        حساب المجموع الفرعي للعنصر (السعر × الكمية)
        """
        return self.price * self.quantity
    
    def __str__(self):
        return f"{self.product_variant} x {self.quantity}"
