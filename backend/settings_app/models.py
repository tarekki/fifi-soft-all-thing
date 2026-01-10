"""
Site Settings Models
نماذج إعدادات الموقع

This module contains all models related to site configuration and settings.
يحتوي هذا الملف على جميع النماذج المتعلقة بإعدادات وتكوين الموقع.

Models:
    - SiteSettings: إعدادات الموقع الأساسية (Singleton)
    - SocialLink: روابط السوشيال ميديا
    - ContactInfo: معلومات الاتصال
    - Language: اللغات المدعومة
    - NavigationItem: عناصر القوائم (Header/Footer)
    - TrustSignal: مؤشرات الثقة
    - PaymentMethod: طرق الدفع المتاحة
    - ShippingMethod: طرق الشحن المتاحة
"""

from django.db import models
from django.core.validators import (
    MinLengthValidator,
    MaxLengthValidator,
    URLValidator,
    RegexValidator
)
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


# =============================================================================
# Site Settings Model (Singleton Pattern)
# نموذج إعدادات الموقع (نمط Singleton - سجل واحد فقط)
# =============================================================================

class SiteSettings(models.Model):
    """
    Main Site Settings Model - Singleton Pattern
    نموذج إعدادات الموقع الرئيسية - نمط Singleton (سجل واحد فقط)
    
    This model stores core site configuration that applies globally.
    يخزن هذا النموذج الإعدادات الأساسية للموقع المطبقة عالمياً.
    
    Fields:
        - site_name: اسم الموقع (English)
        - site_name_ar: اسم الموقع (Arabic)
        - tagline: الشعار المختصر (English)
        - tagline_ar: الشعار المختصر (Arabic)
        - logo_url: رابط الشعار
        - favicon_url: رابط الأيقونة
        - description: وصف الموقع (English)
        - description_ar: وصف الموقع (Arabic)
        - meta_title: عنوان SEO
        - meta_description: وصف SEO
        - meta_keywords: كلمات SEO المفتاحية
        - contact_email: البريد الإلكتروني للتواصل
        - contact_phone: رقم الهاتف للتواصل
        - contact_whatsapp: رقم واتساب
        - address: العنوان (English)
        - address_ar: العنوان (Arabic)
        - google_maps_url: رابط خرائط جوجل
        - working_hours: ساعات العمل (English)
        - working_hours_ar: ساعات العمل (Arabic)
        - currency_code: رمز العملة (SYP)
        - currency_symbol: رمز العملة (ل.س)
        - is_maintenance_mode: وضع الصيانة
        - maintenance_message: رسالة الصيانة
    """
    
    class Meta:
        verbose_name = _("Site Settings")
        verbose_name_plural = _("Site Settings")
        # لا نسمح بأكثر من سجل واحد
        # Singleton pattern - only one record allowed
    
    # =========================================================================
    # Basic Site Information
    # معلومات الموقع الأساسية
    # =========================================================================
    
    site_name = models.CharField(
        max_length=100,
        default="Yalla Buy",
        verbose_name=_("Site Name (English)"),
        help_text=_("The site name displayed in header and title - English"),
        validators=[MinLengthValidator(2), MaxLengthValidator(100)]
    )
    
    site_name_ar = models.CharField(
        max_length=100,
        default="يلا باي",
        verbose_name=_("Site Name (Arabic)"),
        help_text=_("The site name displayed in header and title - Arabic"),
        validators=[MinLengthValidator(2), MaxLengthValidator(100)]
    )
    
    tagline = models.CharField(
        max_length=200,
        default="Order in Seconds",
        verbose_name=_("Tagline (English)"),
        help_text=_("Short slogan displayed under the logo - English"),
        blank=True
    )
    
    tagline_ar = models.CharField(
        max_length=200,
        default="اطلبها بثواني",
        verbose_name=_("Tagline (Arabic)"),
        help_text=_("Short slogan displayed under the logo - Arabic"),
        blank=True
    )
    
    # =========================================================================
    # Logo and Branding
    # الشعار والهوية البصرية
    # =========================================================================
    
    logo_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Logo URL"),
        help_text=_("Full URL to the site logo image (recommended: 200x60px PNG)")
    )
    
    logo_dark_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Logo URL (Dark Mode)"),
        help_text=_("Logo for dark mode/dark backgrounds")
    )
    
    favicon_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Favicon URL"),
        help_text=_("Full URL to the favicon image (recommended: 32x32px ICO/PNG)")
    )
    
    # =========================================================================
    # Site Description
    # وصف الموقع
    # =========================================================================
    
    description = models.TextField(
        default="Your one-stop shop for shoes and bags in Syria",
        verbose_name=_("Site Description (English)"),
        help_text=_("Full description of the site - English"),
        blank=True
    )
    
    description_ar = models.TextField(
        default="وجهتك الأولى للأحذية والحقائب في سوريا",
        verbose_name=_("Site Description (Arabic)"),
        help_text=_("Full description of the site - Arabic"),
        blank=True
    )
    
    # =========================================================================
    # SEO Settings
    # إعدادات تحسين محركات البحث
    # =========================================================================
    
    meta_title = models.CharField(
        max_length=70,
        default="Yalla Buy - Online Shopping in Syria",
        verbose_name=_("Meta Title"),
        help_text=_("SEO title for search engines (max 70 characters)"),
        blank=True
    )
    
    meta_title_ar = models.CharField(
        max_length=70,
        default="يلا باي - تسوق اونلاين في سوريا",
        verbose_name=_("Meta Title (Arabic)"),
        help_text=_("SEO title for search engines - Arabic"),
        blank=True
    )
    
    meta_description = models.CharField(
        max_length=160,
        default="Shop the latest shoes and bags from trusted vendors in Syria. Fast delivery, secure payment.",
        verbose_name=_("Meta Description"),
        help_text=_("SEO description for search engines (max 160 characters)"),
        blank=True
    )
    
    meta_description_ar = models.CharField(
        max_length=160,
        default="تسوق أحدث الأحذية والحقائب من بائعين موثوقين في سوريا. توصيل سريع ودفع آمن.",
        verbose_name=_("Meta Description (Arabic)"),
        help_text=_("SEO description for search engines - Arabic"),
        blank=True
    )
    
    meta_keywords = models.TextField(
        default="shoes, bags, online shopping, syria, yalla buy",
        verbose_name=_("Meta Keywords"),
        help_text=_("Comma-separated keywords for SEO"),
        blank=True
    )
    
    meta_keywords_ar = models.TextField(
        default="أحذية, حقائب, تسوق اونلاين, سوريا, يلا باي",
        verbose_name=_("Meta Keywords (Arabic)"),
        help_text=_("Comma-separated keywords for SEO - Arabic"),
        blank=True
    )
    
    # =========================================================================
    # Contact Information
    # معلومات الاتصال
    # =========================================================================
    
    # Phone number validator
    # مُحقق رقم الهاتف
    phone_regex = RegexValidator(
        regex=r'^\+?[0-9\s\-\(\)]{7,20}$',
        message=_("Enter a valid phone number (7-20 digits, may include +, spaces, hyphens)")
    )
    
    contact_email = models.EmailField(
        max_length=254,
        default="info@yallabuy.sy",
        verbose_name=_("Contact Email"),
        help_text=_("Main contact email address")
    )
    
    contact_phone = models.CharField(
        max_length=20,
        default="+963 11 123 4567",
        verbose_name=_("Contact Phone"),
        help_text=_("Main contact phone number"),
        validators=[phone_regex],
        blank=True
    )
    
    contact_whatsapp = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("WhatsApp Number"),
        help_text=_("WhatsApp number for customer support (with country code)"),
        validators=[phone_regex]
    )
    
    # =========================================================================
    # Address Information
    # معلومات العنوان
    # =========================================================================
    
    address = models.TextField(
        default="Damascus, Syria",
        verbose_name=_("Address (English)"),
        help_text=_("Physical address of the company - English"),
        blank=True
    )
    
    address_ar = models.TextField(
        default="دمشق، سوريا",
        verbose_name=_("Address (Arabic)"),
        help_text=_("Physical address of the company - Arabic"),
        blank=True
    )
    
    google_maps_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Google Maps URL"),
        help_text=_("Google Maps embed or link URL")
    )
    
    # =========================================================================
    # Working Hours
    # ساعات العمل
    # =========================================================================
    
    working_hours = models.CharField(
        max_length=200,
        default="Sunday - Thursday: 9:00 AM - 6:00 PM",
        verbose_name=_("Working Hours (English)"),
        help_text=_("Business working hours - English"),
        blank=True
    )
    
    working_hours_ar = models.CharField(
        max_length=200,
        default="الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً",
        verbose_name=_("Working Hours (Arabic)"),
        help_text=_("Business working hours - Arabic"),
        blank=True
    )
    
    # =========================================================================
    # Currency Settings
    # إعدادات العملة
    # =========================================================================
    
    currency_code = models.CharField(
        max_length=10,
        default="SYP",
        verbose_name=_("Currency Code"),
        help_text=_("ISO currency code (e.g., SYP, USD)")
    )
    
    currency_symbol = models.CharField(
        max_length=10,
        default="ل.س",
        verbose_name=_("Currency Symbol"),
        help_text=_("Currency symbol to display (e.g., ل.س, $)")
    )
    
    currency_position = models.CharField(
        max_length=10,
        choices=[
            ('before', _('Before price ($ 100)')),
            ('after', _('After price (100 $)')),
        ],
        default='after',
        verbose_name=_("Currency Position"),
        help_text=_("Where to display the currency symbol")
    )
    
    # =========================================================================
    # Maintenance Mode
    # وضع الصيانة
    # =========================================================================
    
    is_maintenance_mode = models.BooleanField(
        default=False,
        verbose_name=_("Maintenance Mode"),
        help_text=_("Enable maintenance mode to show maintenance page to visitors")
    )
    
    maintenance_message = models.TextField(
        default="We are currently performing maintenance. Please check back later.",
        verbose_name=_("Maintenance Message (English)"),
        help_text=_("Message to display during maintenance - English"),
        blank=True
    )
    
    maintenance_message_ar = models.TextField(
        default="نقوم حالياً بأعمال الصيانة. يرجى المحاولة لاحقاً.",
        verbose_name=_("Maintenance Message (Arabic)"),
        help_text=_("Message to display during maintenance - Arabic"),
        blank=True
    )
    
    # =========================================================================
    # Timestamps
    # التواريخ
    # =========================================================================
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))
    
    def __str__(self):
        return f"Site Settings - {self.site_name}"
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure Singleton pattern.
        تجاوز الحفظ لضمان نمط Singleton (سجل واحد فقط).
        """
        # If this is a new record and there's already one, prevent saving
        # إذا كان هذا سجل جديد وهناك سجل موجود، امنع الحفظ
        if not self.pk and SiteSettings.objects.exists():
            raise ValidationError(
                _("Only one SiteSettings instance is allowed. Please edit the existing one.")
            )
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """
        Get or create the singleton settings instance.
        الحصول على أو إنشاء السجل الوحيد للإعدادات.
        
        Returns:
            SiteSettings: The singleton settings instance
        """
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


# =============================================================================
# Social Links Model
# نموذج روابط السوشيال ميديا
# =============================================================================

class SocialLink(models.Model):
    """
    Social Media Links Model
    نموذج روابط السوشيال ميديا
    
    Stores social media links with icons and display order.
    يخزن روابط السوشيال ميديا مع الأيقونات وترتيب العرض.
    """
    
    class Meta:
        verbose_name = _("Social Link")
        verbose_name_plural = _("Social Links")
        ordering = ['order', 'name']
    
    # Predefined platform choices
    # خيارات المنصات المحددة مسبقاً
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('twitter', 'Twitter / X'),
        ('tiktok', 'TikTok'),
        ('youtube', 'YouTube'),
        ('linkedin', 'LinkedIn'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
        ('snapchat', 'Snapchat'),
        ('pinterest', 'Pinterest'),
        ('other', 'Other'),
    ]
    
    platform = models.CharField(
        max_length=20,
        choices=PLATFORM_CHOICES,
        verbose_name=_("Platform"),
        help_text=_("Social media platform")
    )
    
    name = models.CharField(
        max_length=50,
        verbose_name=_("Display Name"),
        help_text=_("Name to display (e.g., 'Follow us on Facebook')"),
        blank=True
    )
    
    url = models.URLField(
        max_length=500,
        verbose_name=_("URL"),
        help_text=_("Full URL to the social media page/profile"),
        blank=True,
        default=''
    )
    
    icon = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Icon"),
        help_text=_("Icon class name (e.g., 'fab fa-facebook') or emoji")
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order"),
        help_text=_("Order in which to display (lower = first)")
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Show this link on the site")
    )
    
    open_in_new_tab = models.BooleanField(
        default=True,
        verbose_name=_("Open in New Tab"),
        help_text=_("Open the link in a new browser tab")
    )
    
    def __str__(self):
        return f"{self.get_platform_display()} - {self.url[:50]}"
    
    def save(self, *args, **kwargs):
        """
        Auto-set icon based on platform if not provided.
        تعيين الأيقونة تلقائياً بناءً على المنصة إذا لم تُحدد.
        """
        if not self.icon:
            icon_map = {
                'facebook': 'fab fa-facebook-f',
                'instagram': 'fab fa-instagram',
                'twitter': 'fab fa-x-twitter',
                'tiktok': 'fab fa-tiktok',
                'youtube': 'fab fa-youtube',
                'linkedin': 'fab fa-linkedin-in',
                'telegram': 'fab fa-telegram',
                'whatsapp': 'fab fa-whatsapp',
                'snapchat': 'fab fa-snapchat-ghost',
                'pinterest': 'fab fa-pinterest',
            }
            self.icon = icon_map.get(self.platform, 'fas fa-link')
        
        if not self.name:
            self.name = self.get_platform_display()
        
        super().save(*args, **kwargs)


# =============================================================================
# Language Model
# نموذج اللغات
# =============================================================================

class Language(models.Model):
    """
    Supported Languages Model
    نموذج اللغات المدعومة
    
    Stores available languages for the site.
    يخزن اللغات المتاحة للموقع.
    """
    
    class Meta:
        verbose_name = _("Language")
        verbose_name_plural = _("Languages")
        ordering = ['order', 'name']
    
    code = models.CharField(
        max_length=10,
        unique=True,
        verbose_name=_("Language Code"),
        help_text=_("ISO language code (e.g., 'ar', 'en')")
    )
    
    name = models.CharField(
        max_length=50,
        verbose_name=_("Language Name (English)"),
        help_text=_("Language name in English")
    )
    
    native_name = models.CharField(
        max_length=50,
        verbose_name=_("Native Name"),
        help_text=_("Language name in its native script (e.g., 'العربية')")
    )
    
    flag_emoji = models.CharField(
        max_length=10,
        blank=True,
        verbose_name=_("Flag Emoji"),
        help_text=_("Country flag emoji (e.g., '🇸🇾')")
    )
    
    flag_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Flag Image URL"),
        help_text=_("URL to flag image (alternative to emoji)")
    )
    
    is_rtl = models.BooleanField(
        default=False,
        verbose_name=_("Is RTL"),
        help_text=_("Is this a right-to-left language")
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Is Default"),
        help_text=_("Is this the default language")
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Is this language available for selection")
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order"),
        help_text=_("Order in language selector (lower = first)")
    )
    
    def __str__(self):
        return f"{self.native_name} ({self.code})"
    
    def save(self, *args, **kwargs):
        """
        Ensure only one default language.
        ضمان وجود لغة افتراضية واحدة فقط.
        """
        if self.is_default:
            # Remove default from other languages
            Language.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


# =============================================================================
# Navigation Item Model
# نموذج عناصر القوائم
# =============================================================================

class NavigationItem(models.Model):
    """
    Navigation Menu Items Model
    نموذج عناصر قوائم التنقل
    
    Stores navigation items for header, footer, and sidebar menus.
    يخزن عناصر التنقل للهيدر والفوتر والقوائم الجانبية.
    """
    
    class Meta:
        verbose_name = _("Navigation Item")
        verbose_name_plural = _("Navigation Items")
        ordering = ['location', 'order', 'label']
    
    LOCATION_CHOICES = [
        ('header', _('Header Menu')),
        ('header_mobile', _('Header Mobile Menu')),
        ('footer_about', _('Footer - About')),
        ('footer_support', _('Footer - Support')),
        ('footer_legal', _('Footer - Legal')),
        ('sidebar', _('Sidebar Menu')),
    ]
    
    VISIBILITY_CHOICES = [
        ('all', _('All Users')),
        ('guest', _('Guests Only')),
        ('authenticated', _('Logged In Users')),
        ('customer', _('Customers Only')),
        ('vendor', _('Vendors Only')),
        ('admin', _('Admins Only')),
    ]
    
    location = models.CharField(
        max_length=20,
        choices=LOCATION_CHOICES,
        verbose_name=_("Location"),
        help_text=_("Where to display this menu item")
    )
    
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='children',
        verbose_name=_("Parent Item"),
        help_text=_("Parent menu item (for nested menus)")
    )
    
    label = models.CharField(
        max_length=100,
        verbose_name=_("Label (English)"),
        help_text=_("Menu item text - English")
    )
    
    label_ar = models.CharField(
        max_length=100,
        verbose_name=_("Label (Arabic)"),
        help_text=_("Menu item text - Arabic")
    )
    
    url = models.CharField(
        max_length=500,
        verbose_name=_("URL"),
        help_text=_("Link URL (can be relative like '/products' or absolute)")
    )
    
    icon = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_("Icon"),
        help_text=_("Icon class name or emoji")
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order"),
        help_text=_("Order in menu (lower = first)")
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Show this menu item")
    )
    
    visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default='all',
        verbose_name=_("Visibility"),
        help_text=_("Who can see this menu item")
    )
    
    open_in_new_tab = models.BooleanField(
        default=False,
        verbose_name=_("Open in New Tab"),
        help_text=_("Open link in a new browser tab")
    )
    
    highlight = models.BooleanField(
        default=False,
        verbose_name=_("Highlight"),
        help_text=_("Highlight this item (e.g., for promotions)")
    )
    
    highlight_color = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_("Highlight Color"),
        help_text=_("Color for highlighted item (hex or color name)")
    )
    
    def __str__(self):
        parent_str = f" → {self.label}" if self.parent else ""
        return f"[{self.get_location_display()}] {self.parent.label if self.parent else ''}{parent_str}"


# =============================================================================
# Trust Signal Model
# نموذج مؤشرات الثقة
# =============================================================================

class TrustSignal(models.Model):
    """
    Trust Signals Model
    نموذج مؤشرات الثقة
    
    Stores trust indicators like "Free Shipping", "Secure Payment", etc.
    يخزن مؤشرات الثقة مثل "شحن مجاني"، "دفع آمن"، إلخ.
    """
    
    class Meta:
        verbose_name = _("Trust Signal")
        verbose_name_plural = _("Trust Signals")
        ordering = ['order', 'title']
    
    icon = models.CharField(
        max_length=50,
        verbose_name=_("Icon"),
        help_text=_("Icon class name or emoji (e.g., '🚚', 'fas fa-truck')")
    )
    
    title = models.CharField(
        max_length=100,
        verbose_name=_("Title (English)"),
        help_text=_("Trust signal title - English")
    )
    
    title_ar = models.CharField(
        max_length=100,
        verbose_name=_("Title (Arabic)"),
        help_text=_("Trust signal title - Arabic")
    )
    
    description = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("Description (English)"),
        help_text=_("Short description - English")
    )
    
    description_ar = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("Description (Arabic)"),
        help_text=_("Short description - Arabic")
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order"),
        help_text=_("Order in display (lower = first)")
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Show this trust signal")
    )
    
    def __str__(self):
        return f"{self.icon} {self.title}"


# =============================================================================
# Payment Method Model
# نموذج طرق الدفع
# =============================================================================

class PaymentMethod(models.Model):
    """
    Payment Methods Model
    نموذج طرق الدفع
    
    Stores available payment methods and their configuration.
    يخزن طرق الدفع المتاحة وإعداداتها.
    """
    
    class Meta:
        verbose_name = _("Payment Method")
        verbose_name_plural = _("Payment Methods")
        ordering = ['order', 'name']
    
    FEE_TYPE_CHOICES = [
        ('none', _('No Fee')),
        ('fixed', _('Fixed Amount')),
        ('percentage', _('Percentage')),
    ]
    
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Code"),
        help_text=_("Unique code for this payment method (e.g., 'cod', 'visa')")
    )
    
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name (English)"),
        help_text=_("Payment method name - English")
    )
    
    name_ar = models.CharField(
        max_length=100,
        verbose_name=_("Name (Arabic)"),
        help_text=_("Payment method name - Arabic")
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_("Description (English)"),
        help_text=_("Description shown to customers - English")
    )
    
    description_ar = models.TextField(
        blank=True,
        verbose_name=_("Description (Arabic)"),
        help_text=_("Description shown to customers - Arabic")
    )
    
    instructions = models.TextField(
        blank=True,
        verbose_name=_("Instructions (English)"),
        help_text=_("Payment instructions for customers - English")
    )
    
    instructions_ar = models.TextField(
        blank=True,
        verbose_name=_("Instructions (Arabic)"),
        help_text=_("Payment instructions for customers - Arabic")
    )
    
    icon_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name=_("Icon URL"),
        help_text=_("URL to payment method icon/logo")
    )
    
    fee_type = models.CharField(
        max_length=20,
        choices=FEE_TYPE_CHOICES,
        default='none',
        verbose_name=_("Fee Type"),
        help_text=_("Type of fee for this payment method")
    )
    
    fee_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name=_("Fee Amount"),
        help_text=_("Fee amount (fixed) or percentage")
    )
    
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Minimum Order Amount"),
        help_text=_("Minimum order amount for this payment method")
    )
    
    max_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Maximum Order Amount"),
        help_text=_("Maximum order amount for this payment method")
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order"),
        help_text=_("Order in checkout (lower = first)")
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Is this payment method available")
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Is Default"),
        help_text=_("Pre-select this payment method in checkout")
    )
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def save(self, *args, **kwargs):
        """
        Ensure only one default payment method.
        ضمان وجود طريقة دفع افتراضية واحدة فقط.
        """
        if self.is_default:
            PaymentMethod.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


# =============================================================================
# Shipping Method Model
# نموذج طرق الشحن
# =============================================================================

class ShippingMethod(models.Model):
    """
    Shipping Methods Model
    نموذج طرق الشحن
    
    Stores available shipping methods and their configuration.
    يخزن طرق الشحن المتاحة وإعداداتها.
    """
    
    class Meta:
        verbose_name = _("Shipping Method")
        verbose_name_plural = _("Shipping Methods")
        ordering = ['order', 'name']
    
    RATE_TYPE_CHOICES = [
        ('free', _('Free Shipping')),
        ('flat', _('Flat Rate')),
        ('weight', _('By Weight')),
        ('price', _('By Order Price')),
    ]
    
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Code"),
        help_text=_("Unique code for this shipping method")
    )
    
    name = models.CharField(
        max_length=100,
        verbose_name=_("Name (English)"),
        help_text=_("Shipping method name - English")
    )
    
    name_ar = models.CharField(
        max_length=100,
        verbose_name=_("Name (Arabic)"),
        help_text=_("Shipping method name - Arabic")
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_("Description (English)"),
        help_text=_("Description shown to customers - English")
    )
    
    description_ar = models.TextField(
        blank=True,
        verbose_name=_("Description (Arabic)"),
        help_text=_("Description shown to customers - Arabic")
    )
    
    estimated_days_min = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Minimum Days"),
        help_text=_("Minimum estimated delivery days")
    )
    
    estimated_days_max = models.PositiveIntegerField(
        default=3,
        verbose_name=_("Maximum Days"),
        help_text=_("Maximum estimated delivery days")
    )
    
    rate_type = models.CharField(
        max_length=20,
        choices=RATE_TYPE_CHOICES,
        default='flat',
        verbose_name=_("Rate Type"),
        help_text=_("How shipping rate is calculated")
    )
    
    rate_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name=_("Rate Amount"),
        help_text=_("Shipping rate (flat rate or per unit)")
    )
    
    free_shipping_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Free Shipping Threshold"),
        help_text=_("Order amount for free shipping (leave empty if not applicable)")
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Display Order"),
        help_text=_("Order in checkout (lower = first)")
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
        help_text=_("Is this shipping method available")
    )
    
    is_default = models.BooleanField(
        default=False,
        verbose_name=_("Is Default"),
        help_text=_("Pre-select this shipping method in checkout")
    )
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def save(self, *args, **kwargs):
        """
        Ensure only one default shipping method.
        ضمان وجود طريقة شحن افتراضية واحدة فقط.
        """
        if self.is_default:
            ShippingMethod.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
    
    def get_estimated_delivery(self):
        """
        Get formatted estimated delivery string.
        الحصول على نص وقت التوصيل المتوقع.
        """
        if self.estimated_days_min == self.estimated_days_max:
            return f"{self.estimated_days_min} days"
        return f"{self.estimated_days_min}-{self.estimated_days_max} days"

