// lib/app/localization/l10n.dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

class AppL10n {
  static const supportedLocales = [
    Locale('ar'),
    Locale('en'),
  ];

  static const localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ];

  static Locale? localeResolutionCallback(Locale? locale, Iterable<Locale> supported) {
    if (locale == null) return const Locale('ar');
    for (final s in supported) {
      if (s.languageCode == locale.languageCode) return s;
    }
    return const Locale('ar');
  }
}

// Restoring Strings class for UI text (Pending full l10n implementation)
class Strings {
  static const String appName = 'يلا باي';
  static const String appNameEn = 'YallaBuy';
  static const String slogan = 'كل شي بدك ياه… يلا باي!';
  
  // Auth
  static const String login = 'تسجيل الدخول';
  static const String guest = 'تصفح كزائر';
  
  // Customer
  static const String cHome = 'الرئيسية';
  static const String cCategories = 'التصنيفات';
  static const String cCart = 'السلة';
  static const String cOrders = 'طلباتي';
  static const String cProfile = 'حسابي';
  static const String switchToVendor = 'التبديل إلى وضع البائع';
  
  // Vendor
  static const String vDashboard = 'اللوحة';
  static const String vOrders = 'الطلبات';
  static const String vProducts = 'منتجاتي';
  static const String vProfile = 'المتجر';
  static const String switchToCustomer = 'العودة لوضع العميل';
}
