# Generated manually
"""
Initial Data Migration
بيانات أولية

This migration creates default site settings data.
تنشئ هذه الـ migration بيانات إعدادات الموقع الافتراضية.
"""

from django.db import migrations


def create_initial_data(apps, schema_editor):
    """
    Create initial settings data.
    إنشاء بيانات الإعدادات الأولية.
    """
    SiteSettings = apps.get_model('settings_app', 'SiteSettings')
    Language = apps.get_model('settings_app', 'Language')
    SocialLink = apps.get_model('settings_app', 'SocialLink')
    NavigationItem = apps.get_model('settings_app', 'NavigationItem')
    TrustSignal = apps.get_model('settings_app', 'TrustSignal')
    PaymentMethod = apps.get_model('settings_app', 'PaymentMethod')
    ShippingMethod = apps.get_model('settings_app', 'ShippingMethod')
    
    # =========================================================================
    # Site Settings (Singleton)
    # إعدادات الموقع
    # =========================================================================
    
    if not SiteSettings.objects.exists():
        SiteSettings.objects.create(
            pk=1,
            site_name='Yalla Buy',
            site_name_ar='يلا باي',
            tagline='Order in Seconds',
            tagline_ar='اطلبها بثواني',
            description='Your one-stop shop for shoes and bags in Syria',
            description_ar='وجهتك الأولى للأحذية والحقائب في سوريا',
            meta_title='Yalla Buy - Online Shopping in Syria',
            meta_title_ar='يلا باي - تسوق اونلاين في سوريا',
            meta_description='Shop the latest shoes and bags from trusted vendors in Syria. Fast delivery, secure payment.',
            meta_description_ar='تسوق أحدث الأحذية والحقائب من بائعين موثوقين في سوريا. توصيل سريع ودفع آمن.',
            contact_email='info@yallabuy.sy',
            contact_phone='+963 11 123 4567',
            address='Damascus, Syria',
            address_ar='دمشق، سوريا',
            currency_code='SYP',
            currency_symbol='ل.س',
            currency_position='after',
        )
    
    # =========================================================================
    # Languages
    # اللغات
    # =========================================================================
    
    languages_data = [
        {
            'code': 'ar',
            'name': 'Arabic',
            'native_name': 'العربية',
            'flag_emoji': '🇸🇾',
            'is_rtl': True,
            'is_default': True,
            'order': 1,
        },
        {
            'code': 'en',
            'name': 'English',
            'native_name': 'English',
            'flag_emoji': '🇬🇧',
            'is_rtl': False,
            'is_default': False,
            'order': 2,
        },
    ]
    
    for lang_data in languages_data:
        Language.objects.get_or_create(
            code=lang_data['code'],
            defaults=lang_data
        )
    
    # =========================================================================
    # Social Links
    # روابط السوشيال
    # =========================================================================
    
    social_links_data = [
        {
            'platform': 'facebook',
            'name': 'Facebook',
            'url': 'https://facebook.com/yallabuy',
            'icon': 'fab fa-facebook-f',
            'order': 1,
        },
        {
            'platform': 'instagram',
            'name': 'Instagram',
            'url': 'https://instagram.com/yallabuy',
            'icon': 'fab fa-instagram',
            'order': 2,
        },
        {
            'platform': 'whatsapp',
            'name': 'WhatsApp',
            'url': 'https://wa.me/963111234567',
            'icon': 'fab fa-whatsapp',
            'order': 3,
        },
        {
            'platform': 'telegram',
            'name': 'Telegram',
            'url': 'https://t.me/yallabuy',
            'icon': 'fab fa-telegram',
            'order': 4,
        },
    ]
    
    for link_data in social_links_data:
        SocialLink.objects.get_or_create(
            platform=link_data['platform'],
            defaults=link_data
        )
    
    # =========================================================================
    # Navigation Items - Header
    # عناصر التنقل - الهيدر
    # =========================================================================
    
    header_items = [
        {
            'location': 'header',
            'label': 'Home',
            'label_ar': 'الرئيسية',
            'url': '/',
            'icon': '🏠',
            'order': 1,
        },
        {
            'location': 'header',
            'label': 'Products',
            'label_ar': 'المنتجات',
            'url': '/products',
            'icon': '👟',
            'order': 2,
        },
        {
            'location': 'header',
            'label': 'Vendors',
            'label_ar': 'البائعون',
            'url': '/vendors',
            'icon': '🏪',
            'order': 3,
        },
        {
            'location': 'header',
            'label': 'Offers',
            'label_ar': 'العروض',
            'url': '/offers',
            'icon': '🔥',
            'order': 4,
            'highlight': True,
            'highlight_color': '#EF4444',
        },
    ]
    
    for item_data in header_items:
        NavigationItem.objects.get_or_create(
            location=item_data['location'],
            url=item_data['url'],
            defaults=item_data
        )
    
    # =========================================================================
    # Navigation Items - Footer About
    # عناصر التنقل - فوتر عن الموقع
    # =========================================================================
    
    footer_about_items = [
        {
            'location': 'footer_about',
            'label': 'About Us',
            'label_ar': 'من نحن',
            'url': '/about',
            'order': 1,
        },
        {
            'location': 'footer_about',
            'label': 'Careers',
            'label_ar': 'الوظائف',
            'url': '/careers',
            'order': 2,
        },
        {
            'location': 'footer_about',
            'label': 'Contact Us',
            'label_ar': 'تواصل معنا',
            'url': '/contact',
            'order': 3,
        },
    ]
    
    for item_data in footer_about_items:
        NavigationItem.objects.get_or_create(
            location=item_data['location'],
            url=item_data['url'],
            defaults=item_data
        )
    
    # =========================================================================
    # Navigation Items - Footer Support
    # عناصر التنقل - فوتر الدعم
    # =========================================================================
    
    footer_support_items = [
        {
            'location': 'footer_support',
            'label': 'Help Center',
            'label_ar': 'مركز المساعدة',
            'url': '/help',
            'order': 1,
        },
        {
            'location': 'footer_support',
            'label': 'Shipping Info',
            'label_ar': 'معلومات الشحن',
            'url': '/shipping',
            'order': 2,
        },
        {
            'location': 'footer_support',
            'label': 'Returns',
            'label_ar': 'الإرجاع',
            'url': '/returns',
            'order': 3,
        },
        {
            'location': 'footer_support',
            'label': 'FAQs',
            'label_ar': 'الأسئلة الشائعة',
            'url': '/faq',
            'order': 4,
        },
    ]
    
    for item_data in footer_support_items:
        NavigationItem.objects.get_or_create(
            location=item_data['location'],
            url=item_data['url'],
            defaults=item_data
        )
    
    # =========================================================================
    # Navigation Items - Footer Legal
    # عناصر التنقل - فوتر قانوني
    # =========================================================================
    
    footer_legal_items = [
        {
            'location': 'footer_legal',
            'label': 'Privacy Policy',
            'label_ar': 'سياسة الخصوصية',
            'url': '/privacy',
            'order': 1,
        },
        {
            'location': 'footer_legal',
            'label': 'Terms of Service',
            'label_ar': 'شروط الخدمة',
            'url': '/terms',
            'order': 2,
        },
        {
            'location': 'footer_legal',
            'label': 'Cookie Policy',
            'label_ar': 'سياسة ملفات تعريف الارتباط',
            'url': '/cookies',
            'order': 3,
        },
    ]
    
    for item_data in footer_legal_items:
        NavigationItem.objects.get_or_create(
            location=item_data['location'],
            url=item_data['url'],
            defaults=item_data
        )
    
    # =========================================================================
    # Trust Signals
    # مؤشرات الثقة
    # =========================================================================
    
    trust_signals_data = [
        {
            'icon': '🚚',
            'title': 'Free Shipping',
            'title_ar': 'توصيل مجاني',
            'description': 'On orders over 500,000 SYP',
            'description_ar': 'للطلبات فوق 500,000 ل.س',
            'order': 1,
        },
        {
            'icon': '🔒',
            'title': 'Secure Payment',
            'title_ar': 'دفع آمن',
            'description': 'Multiple payment options',
            'description_ar': 'خيارات دفع متعددة',
            'order': 2,
        },
        {
            'icon': '🔄',
            'title': 'Easy Returns',
            'title_ar': 'إرجاع سهل',
            'description': '7 days return policy',
            'description_ar': 'سياسة إرجاع 7 أيام',
            'order': 3,
        },
        {
            'icon': '✅',
            'title': 'Verified Vendors',
            'title_ar': 'بائعون موثوقون',
            'description': 'All vendors are verified',
            'description_ar': 'جميع البائعين موثقون',
            'order': 4,
        },
    ]
    
    for signal_data in trust_signals_data:
        TrustSignal.objects.get_or_create(
            title=signal_data['title'],
            defaults=signal_data
        )
    
    # =========================================================================
    # Payment Methods
    # طرق الدفع
    # =========================================================================
    
    payment_methods_data = [
        {
            'code': 'cod',
            'name': 'Cash on Delivery',
            'name_ar': 'الدفع عند الاستلام',
            'description': 'Pay when you receive your order',
            'description_ar': 'ادفع عند استلام طلبك',
            'instructions': 'Please prepare the exact amount',
            'instructions_ar': 'يرجى تحضير المبلغ المطلوب',
            'fee_type': 'none',
            'is_default': True,
            'order': 1,
        },
        {
            'code': 'syriatel_cash',
            'name': 'Syriatel Cash',
            'name_ar': 'سيريتل كاش',
            'description': 'Pay using Syriatel Cash',
            'description_ar': 'ادفع باستخدام سيريتل كاش',
            'fee_type': 'none',
            'order': 2,
        },
        {
            'code': 'mtn_cash',
            'name': 'MTN Cash',
            'name_ar': 'MTN كاش',
            'description': 'Pay using MTN Cash',
            'description_ar': 'ادفع باستخدام MTN كاش',
            'fee_type': 'none',
            'order': 3,
        },
    ]
    
    for method_data in payment_methods_data:
        PaymentMethod.objects.get_or_create(
            code=method_data['code'],
            defaults=method_data
        )
    
    # =========================================================================
    # Shipping Methods
    # طرق الشحن
    # =========================================================================
    
    shipping_methods_data = [
        {
            'code': 'standard',
            'name': 'Standard Shipping',
            'name_ar': 'الشحن العادي',
            'description': 'Delivery within 3-5 business days',
            'description_ar': 'التوصيل خلال 3-5 أيام عمل',
            'estimated_days_min': 3,
            'estimated_days_max': 5,
            'rate_type': 'flat',
            'rate_amount': 25000,  # 25,000 SYP
            'free_shipping_threshold': 500000,  # Free over 500,000 SYP
            'is_default': True,
            'order': 1,
        },
        {
            'code': 'express',
            'name': 'Express Shipping',
            'name_ar': 'الشحن السريع',
            'description': 'Delivery within 1-2 business days',
            'description_ar': 'التوصيل خلال 1-2 يوم عمل',
            'estimated_days_min': 1,
            'estimated_days_max': 2,
            'rate_type': 'flat',
            'rate_amount': 50000,  # 50,000 SYP
            'order': 2,
        },
        {
            'code': 'pickup',
            'name': 'Store Pickup',
            'name_ar': 'الاستلام من المتجر',
            'description': 'Pick up from vendor location',
            'description_ar': 'استلم من موقع البائع',
            'estimated_days_min': 0,
            'estimated_days_max': 1,
            'rate_type': 'free',
            'rate_amount': 0,
            'order': 3,
        },
    ]
    
    for method_data in shipping_methods_data:
        ShippingMethod.objects.get_or_create(
            code=method_data['code'],
            defaults=method_data
        )


def reverse_initial_data(apps, schema_editor):
    """
    Reverse the initial data (for rollback).
    عكس البيانات الأولية (للتراجع).
    """
    # We don't delete data on reverse to preserve user modifications
    # لا نحذف البيانات عند التراجع للحفاظ على تعديلات المستخدم
    pass


class Migration(migrations.Migration):
    """
    Data migration for initial settings.
    ترحيل البيانات للإعدادات الأولية.
    """

    dependencies = [
        ('settings_app', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_data, reverse_initial_data),
    ]

