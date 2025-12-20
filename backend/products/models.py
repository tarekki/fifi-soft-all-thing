from django.db import models
from vendors.models import Vendor


class Product(models.Model):
    """
    Main product model (e.g., "Summer Sneaker")
    """
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Price in Syrian Pounds')
    
    # Product type (for filtering)
    PRODUCT_TYPES = [
        ('shoes', 'Shoes'),
        ('bags', 'Bags'),
    ]
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES)
    
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
