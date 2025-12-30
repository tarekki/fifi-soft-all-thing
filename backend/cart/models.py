"""
Cart Models
نماذج السلة

This module contains models for shopping cart functionality.
يحتوي هذا الوحدة على نماذج وظائف سلة التسوق.

Features:
- Support for authenticated users and guest users (via session)
- Cart items with product variants
- Automatic price calculations
- Optimized for high traffic

المميزات:
- دعم المستخدمين المسجلين والمستخدمين الضيوف (عبر الجلسة)
- عناصر السلة مع متغيرات المنتجات
- حساب الأسعار تلقائياً
- محسّن للضغط العالي
"""

from decimal import Decimal
from django.db import models
from django.db.models import F, Sum
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
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


# =============================================================================
# Cart Model
# نموذج السلة
# =============================================================================

class Cart(models.Model):
    """
    Shopping Cart Model
    نموذج سلة التسوق
    
    Represents a shopping cart for a user (authenticated or guest).
    يمثل سلة تسوق لمستخدم (مسجل أو ضيف).
    
    For authenticated users: linked to User model
    For guest users: linked via session_key
    
    للمستخدمين المسجلين: مربوط بنموذج User
    للمستخدمين الضيوف: مربوط عبر session_key
    
    Fields:
        - user: User who owns this cart (null for guest carts)
        - session_key: Session key for guest carts (null for authenticated users)
        - created_at: When cart was created
        - updated_at: When cart was last updated
    
    Business Rules:
        - Each authenticated user has exactly one cart
        - Each guest session has exactly one cart
        - Cart items are automatically calculated
        - Cart expires after 30 days of inactivity (handled by cleanup job)
    
    قواعد العمل:
        - كل مستخدم مسجل لديه سلة واحدة بالضبط
        - كل جلسة ضيف لديها سلة واحدة بالضبط
        - عناصر السلة تُحسب تلقائياً
        - السلة تنتهي بعد 30 يوم من عدم النشاط (يتم التعامل معها بوظيفة تنظيف)
    """
    
    # =========================================================================
    # User Relationship
    # علاقة المستخدم
    # =========================================================================
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='cart',
        verbose_name=_('User'),
        help_text=_('User who owns this cart (null for guest carts) / المستخدم الذي يملك هذه السلة (null للسلل الضيفية)')
    )
    
    # =========================================================================
    # Guest Session Support
    # دعم جلسة الضيف
    # =========================================================================
    
    session_key = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        db_index=True,
        verbose_name=_('Session Key'),
        help_text=_('Session key for guest carts (null for authenticated users) / مفتاح الجلسة للسلل الضيفية (null للمستخدمين المسجلين)')
    )
    
    # =========================================================================
    # Timestamps
    # الطوابع الزمنية
    # =========================================================================
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At'),
        help_text=_('When this cart was created / متى تم إنشاء هذه السلة')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At'),
        help_text=_('When this cart was last updated / متى تم تحديث هذه السلة آخر مرة')
    )
    
    # =========================================================================
    # Meta
    # معلومات إضافية
    # =========================================================================
    
    class Meta:
        verbose_name = _('Cart')
        verbose_name_plural = _('Carts')
        db_table = 'cart'
        indexes = [
            models.Index(fields=['user'], name='cart_user_idx'),
            models.Index(fields=['session_key'], name='cart_session_key_idx'),
            models.Index(fields=['updated_at'], name='cart_updated_at_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(user__isnull=False) | models.Q(session_key__isnull=False),
                name='cart_must_have_user_or_session'
            ),
        ]
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.email}"
        return f"Guest Cart ({self.session_key})"
    
    # =========================================================================
    # Properties
    # الخصائص
    # =========================================================================
    
    @property
    def is_guest_cart(self):
        """
        Check if this is a guest cart
        التحقق من إذا كانت هذه سلة ضيف
        """
        return self.user is None
    
    @property
    def item_count(self):
        """
        Get total number of items in cart
        الحصول على إجمالي عدد العناصر في السلة
        """
        return self.items.aggregate(
            total=Sum('quantity')
        )['total'] or 0
    
    @property
    def subtotal(self):
        """
        Calculate cart subtotal (sum of all item prices)
        حساب المجموع الفرعي للسلة (مجموع أسعار جميع العناصر)
        """
        return self.items.aggregate(
            total=Sum(
                F('quantity') * F('price'),
                output_field=models.DecimalField(max_digits=10, decimal_places=2)
            )
        )['total'] or zero_decimal()
    
    def get_total(self, delivery_fee=zero_decimal()):
        """
        Calculate cart total (subtotal + delivery fee)
        حساب إجمالي السلة (المجموع الفرعي + رسوم التوصيل)
        
        Args:
            delivery_fee: Delivery fee to add (default: 0)
            رسوم التوصيل للإضافة (افتراضي: 0)
        
        Returns:
            Decimal: Total amount
            المبلغ الإجمالي
        """
        return (self.subtotal + delivery_fee).quantize(Decimal("0.01"))


# =============================================================================
# Cart Item Model
# نموذج عنصر السلة
# =============================================================================

class CartItem(models.Model):
    """
    Cart Item Model
    نموذج عنصر السلة
    
    Represents a single item in a shopping cart.
    يمثل عنصر واحد في سلة التسوق.
    
    Fields:
        - cart: Cart this item belongs to
        - variant: Product variant being purchased
        - quantity: Number of items
        - price: Price per item (snapshot at time of adding)
        - created_at: When item was added
        - updated_at: When item was last updated
    
    Business Rules:
        - Each cart can have multiple items
        - Each item references a product variant
        - Price is snapshot at time of adding (prevents price changes affecting cart)
        - Quantity must be at least 1
        - Same variant can only appear once per cart (quantity is updated instead)
    
    قواعد العمل:
        - كل سلة يمكن أن تحتوي على عناصر متعددة
        - كل عنصر يشير إلى متغير منتج
        - السعر هو لقطة في وقت الإضافة (يمنع تغييرات الأسعار من التأثير على السلة)
        - الكمية يجب أن تكون على الأقل 1
        - نفس المتغير يمكن أن يظهر مرة واحدة فقط لكل سلة (يتم تحديث الكمية بدلاً من ذلك)
    """
    
    # =========================================================================
    # Relationships
    # العلاقات
    # =========================================================================
    
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Cart'),
        help_text=_('Cart this item belongs to / السلة التي ينتمي إليها هذا العنصر')
    )
    
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name=_('Product Variant'),
        help_text=_('Product variant being purchased / متغير المنتج الذي يتم شراؤه')
    )
    
    # =========================================================================
    # Item Details
    # تفاصيل العنصر
    # =========================================================================
    
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name=_('Quantity'),
        help_text=_('Number of items / عدد العناصر')
    )
    
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=zero_decimal,
        verbose_name=_('Price'),
        help_text=_('Price per item (snapshot at time of adding) / السعر لكل عنصر (لقطة في وقت الإضافة)')
    )
    
    # =========================================================================
    # Timestamps
    # الطوابع الزمنية
    # =========================================================================
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At'),
        help_text=_('When this item was added to cart / متى تم إضافة هذا العنصر للسلة')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At'),
        help_text=_('When this item was last updated / متى تم تحديث هذا العنصر آخر مرة')
    )
    
    # =========================================================================
    # Meta
    # معلومات إضافية
    # =========================================================================
    
    class Meta:
        verbose_name = _('Cart Item')
        verbose_name_plural = _('Cart Items')
        db_table = 'cart_item'
        unique_together = [['cart', 'variant']]
        indexes = [
            models.Index(fields=['cart'], name='cart_item_cart_idx'),
            models.Index(fields=['variant'], name='cart_item_variant_idx'),
            models.Index(fields=['created_at'], name='cart_item_created_at_idx'),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.quantity}x {self.variant.product.name} - {self.variant.sku}"
    
    # =========================================================================
    # Properties
    # الخصائص
    # =========================================================================
    
    @property
    def subtotal(self):
        """
        Calculate item subtotal (quantity * price)
        حساب المجموع الفرعي للعنصر (الكمية * السعر)
        """
        return (Decimal(str(self.quantity)) * self.price).quantize(Decimal("0.01"))
    
    # =========================================================================
    # Methods
    # الدوال
    # =========================================================================
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure price is set from variant if not provided
        تجاوز الحفظ لضمان تعيين السعر من المتغير إذا لم يتم توفيره
        """
        if not self.price or self.price == zero_decimal():
            self.price = self.variant.price
        super().save(*args, **kwargs)
