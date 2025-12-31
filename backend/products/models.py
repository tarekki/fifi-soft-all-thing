from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from vendors.models import Vendor


# =============================================================================
# Validators
# المدققات
# =============================================================================

def validate_color_hex(value):
    """
    Validate hex color format, but allow empty values
    التحقق من صيغة hex color، لكن السماح بالقيم الفارغة
    """
    if value in (None, ''):
        return
    RegexValidator(r'^#[0-9A-Fa-f]{6}$', _('Invalid hex color'))(value)


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
        on_delete=models.SET_NULL,
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
        indexes = [
            models.Index(fields=['parent', 'is_active']),
            models.Index(fields=['slug']),
            models.Index(fields=['is_featured', 'is_active']),
        ]
    
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
        constraints = [
            models.UniqueConstraint(fields=["vendor", "slug"], name="uq_product_vendor_slug"),
        ]
        indexes = [
            models.Index(fields=['vendor', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_active', 'created_at']),
        ]
    
    def save(self, *args, **kwargs):
        """Generate unique slug from name if not provided"""
        if not self.slug:
            base = slugify(self.name)
            slug = base
            i = 2
            while Product.objects.filter(vendor=self.vendor, slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.vendor.name} - {self.name}"
    
    @property
    def primary_image(self):
        """Get primary product image"""
        primary = self.images.filter(is_primary=True).first()
        if primary:
            return primary
        # Fallback to first image if no primary set
        return self.images.first()
    
    @property
    def main_image_url(self):
        """Get main image URL for backward compatibility"""
        primary = self.primary_image
        if primary and primary.image:
            return primary.image.url
        # Fallback to first variant image if no product images
        first_variant = self.variants.filter(image__isnull=False).first()
        if first_variant and first_variant.image:
            return first_variant.image.url
        return None


# =============================================================================
# Product Image Model
# نموذج صور المنتج
# =============================================================================

class ProductImage(models.Model):
    """
    Product Image Model
    نموذج صور المنتج
    
    Supports multiple images per product with ordering and primary image selection.
    يدعم صور متعددة لكل منتج مع الترتيب واختيار الصورة الأساسية.
    
    Fields:
        - product: المنتج المرتبط
        - image: ملف الصورة
        - display_order: ترتيب العرض (0 = الأول)
        - is_primary: هل هي الصورة الأساسية؟
        - alt_text: نص بديل للصورة (لتحسين SEO)
    """
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_('Product'),
        help_text=_('المنتج المرتبط')
    )
    
    image = models.ImageField(
        upload_to='products/images/',
        verbose_name=_('Image'),
        help_text=_('صورة المنتج')
    )
    
    display_order = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Display Order'),
        help_text=_('ترتيب العرض (0 = الأول، الأصغر يظهر أولاً)')
    )
    
    is_primary = models.BooleanField(
        default=False,
        verbose_name=_('Is Primary'),
        help_text=_('هل هذه الصورة الأساسية للمنتج؟ (يجب أن تكون صورة واحدة فقط أساسية)')
    )
    
    alt_text = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Alt Text'),
        help_text=_('النص البديل للصورة (لتحسين SEO وإمكانية الوصول)')
    )
    
    # Timestamps
    # الطوابع الزمنية
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'created_at']
        verbose_name = _('Product Image')
        verbose_name_plural = _('Product Images')
        indexes = [
            models.Index(fields=['product', 'display_order']),
            models.Index(fields=['product', 'is_primary']),
        ]
    
    def save(self, *args, **kwargs):
        """
        Ensure only one primary image per product
        ضمان وجود صورة أساسية واحدة فقط لكل منتج
        """
        if self.is_primary:
            # Unset other primary images for this product
            ProductImage.objects.filter(
                product=self.product,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.product.name} - Image {self.display_order}"


class ProductVariant(models.Model):
    """
    Specific SKU with color, size, model
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    
    # Variant attributes
    color = models.CharField(max_length=50)
    color_hex = models.CharField(
        max_length=7,
        blank=True,
        validators=[validate_color_hex],
        help_text='Hex color code'
    )
    size = models.CharField(max_length=20, blank=True, help_text='For shoes (e.g., 25, 30, 38)')
    model = models.CharField(max_length=100, blank=True, help_text='Model/Style name')
    
    # SKU (Stock Keeping Unit)
    sku = models.CharField(max_length=100, unique=True, null=True, blank=True, help_text='Stock Keeping Unit (auto-generated if not provided)')
    
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
        indexes = [
            models.Index(fields=['product', 'is_available']),
        ]
    
    def save(self, *args, **kwargs):
        """Generate unique SKU if not provided"""
        if not self.sku:
            # Generate SKU from vendor, product, color, size, model
            # توليد SKU من البائع، المنتج، اللون، الحجم، الموديل
            sku_parts = [
                str(self.product.vendor_id),
                str(self.product_id),
                self.color or 'none',
                self.size or 'none',
                self.model or 'none'
            ]
            base = slugify('-'.join(sku_parts))[:70]
            sku = base or "sku"
            i = 2
            while ProductVariant.objects.filter(sku=sku).exclude(pk=self.pk).exists():
                sku = f"{base}-{i}"[:100]
                i += 1
            self.sku = sku.upper()
        super().save(*args, **kwargs)
    
    @property
    def final_price(self):
        """Returns the variant price or falls back to product base price"""
        return self.price_override if self.price_override is not None else self.product.base_price
    
    def __str__(self):
        parts = [self.product.name, self.color]
        if self.size:
            parts.append(f"Size {self.size}")
        if self.model:
            parts.append(self.model)
        return " - ".join(parts)
