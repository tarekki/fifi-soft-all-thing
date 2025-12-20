from django.db import models
from django.utils.text import slugify


class Vendor(models.Model):
    """
    Represents a brand/vendor (e.g., Fifi, Soft)
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    logo = models.ImageField(upload_to='vendors/logos/', null=True, blank=True)
    description = models.TextField(blank=True)
    
    # Brand colors for dynamic theming
    primary_color = models.CharField(max_length=7, default='#000000', help_text='Hex color code (e.g., #E91E63)')
    
    # Commission rate (percentage)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, help_text='Commission percentage')
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Vendor'
        verbose_name_plural = 'Vendors'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
