from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from vendors.models import Vendor


# =============================================================================
# Category Model
# نموذج الفئات
# =============================================================================

class Category(models.Model):
    """
    Product Category Model with Hierarchical Support
    نموذج فئات المنتجات مع دعم التسلسل الهرمي
    
    Supports parent-child relationships for subcategories.
    يدعم علاقات الأب-الابن للفئات الفرعية.
    
    Fields:
        - name: اسم الفئة (English)
        - name_ar: اسم الفئة (Arabic)
        - slug: الرابط المختصر
        - description: وصف الفئة (English)
        - description_ar: وصف الفئة (Arabic)
        - image: صورة الفئة
        - icon: أيقونة الفئة (CSS class or SVG)
        - parent: الفئة الأم (للفئات الفرعية)
        - display_order: ترتيب العرض
        - is_active: حالة التفعيل
        - is_featured: هل هي مميزة؟
    """
    
    # Basic Information
    # المعلومات الأساسية
    name = models.CharField(
        max_length=100,
        verbose_name=_('Category Name (English)'),
        help_text=_('اسم الفئة بالإنجليزية')
    )
    name_ar = models.CharField(
        max_length=100,
        verbose_name=_('Category Name (Arabic)'),
        help_text=_('اسم الفئة بالعربية')
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        verbose_name=_('Slug'),
        help_text=_('الرابط المختصر (يُنشأ تلقائياً)')
    )
    
    # Description
    # الوصف
    description = models.TextField(
        blank=True,
        verbose_name=_('Description (English)'),
        help_text=_('وصف الفئة بالإنجليزية')
    )
    description_ar = models.TextField(
        blank=True,
        verbose_name=_('Description (Arabic)'),
        help_text=_('وصف الفئة بالعربية')
    )
    
    # Visual
    # العناصر المرئية
    image = models.ImageField(
        upload_to='categories/',
        null=True,
        blank=True,
        verbose_name=_('Category Image'),
        help_text=_('صورة الفئة (مربعة، 400x400 بكسل)')
    )
    icon = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Icon'),
        help_text=_('CSS class أو اسم الأيقونة')
    )
    
    # Hierarchy
    # التسلسل الهرمي
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('Parent Category'),
        help_text=_('الفئة الأم (اتركها فارغة للفئات الرئيسية)')
    )
    
    # Display & Status
    # العرض والحالة
    display_order = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Display Order'),
        help_text=_('ترتيب العرض (0 = الأول)')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Is Active'),
        help_text=_('هل الفئة نشطة؟')
    )
    is_featured = models.BooleanField(
        default=False,
        verbose_name=_('Is Featured'),
        help_text=_('هل الفئة مميزة؟ (تظهر في الصفحة الرئيسية)')
    )
    
    # Timestamps
    # الطوابع الزمنية
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
            # Ensure uniqueness
            # ضمان التفرد
            original_slug = self.slug
            counter = 1
            while Category.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name
    
    @property
    def full_path(self) -> str:
        """Get full category path (e.g., "Electronics > Phones > Smartphones")"""
        path = [self.name]
        parent = self.parent
        while parent:
            path.insert(0, parent.name)
            parent = parent.parent
        return ' > '.join(path)
    
    @property
    def products_count(self) -> int:
        """Get total products count including subcategories"""
        count = self.products.filter(is_active=True).count()
        for child in self.children.filter(is_active=True):
            count += child.products_count
        return count
    
    @property
    def is_parent(self) -> bool:
        """Check if this category has children"""
        return self.children.exists()
    
    @property
    def depth(self) -> int:
        """Get category depth in hierarchy (0 = root)"""
        depth = 0
        parent = self.parent
        while parent:
            depth += 1
            parent = parent.parent
        return depth


# =============================================================================
# Product Model
# نموذج المنتجات
# =============================================================================

class Product(models.Model):
    """
    Main product model (e.g., "Summer Sneaker")
    نموذج المنتج الرئيسي
    """
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('Vendor'),
        help_text=_('البائع/الماركة')
    )
    
    # Category (new field)
    # الفئة (حقل جديد)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_('Category'),
        help_text=_('فئة المنتج')
    )
    
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Price in Syrian Pounds')
    
    # Product type (for filtering) - kept for backwards compatibility
    # نوع المنتج (للتصفية) - محفوظ للتوافق
    PRODUCT_TYPES = [
        ('shoes', 'Shoes'),
        ('bags', 'Bags'),
    ]
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        unique_together = ['vendor', 'slug']
    
    def __str__(self):
        return f"{self.vendor.name} - {self.name}"


class ProductVariant(models.Model):
    """
    Specific SKU with color, size, model
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    
    # Variant attributes
    color = models.CharField(max_length=50)
    color_hex = models.CharField(max_length=7, blank=True, help_text='Hex color code')
    size = models.CharField(max_length=20, blank=True, help_text='For shoes (e.g., 25, 30, 38)')
    model = models.CharField(max_length=100, blank=True, help_text='Model/Style name')
    
    # SKU (Stock Keeping Unit)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    
    # Inventory
    stock_quantity = models.PositiveIntegerField(default=0)
    
    # Pricing (can override base price)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Images
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    
    # Status
    is_available = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['color', 'size']
        verbose_name = 'Product Variant'
        verbose_name_plural = 'Product Variants'
    
    @property
    def final_price(self):
        """Returns the variant price or falls back to product base price"""
        return self.price_override if self.price_override else self.product.base_price
    
    def __str__(self):
        parts = [self.product.name, self.color]
        if self.size:
            parts.append(f"Size {self.size}")
        if self.model:
            parts.append(self.model)
        return " - ".join(parts)
