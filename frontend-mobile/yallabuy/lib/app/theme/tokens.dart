// lib/app/theme/tokens.dart
import 'package:flutter/material.dart';

class AppTokens {
  AppTokens._();

  // Palette - Updated to match User's app_theme.dart + Aliases for compatibility
  static const Color damascusRose = Color(0xFFC84B6A);
  static const Color aleppoOlive = Color(0xFF6E7F3A);
  static const Color mosaicTeal = Color(0xFF2AA6A1);
  static const Color background = Color(0xFFF7F3EE);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color basalt = Color(0xFF1E1B18);
  static const Color sand = Color(0xFFE8DDCF);
  static const Color brassGold = Color(0xFFC8A24A);

  // Old Aliases (Used in screens)
  static const Color primaryDamascusRose = damascusRose;
  static const Color secondaryAleppoOlive = aleppoOlive;
  static const Color accentMosaicTeal = mosaicTeal;
  static const Color backgroundLimestone = background;
  static const Color surfaceWhite = surface;
  static const Color textBasalt = basalt;
  static const Color mutedSand = sand;
  
  // Spacing & Radius - Mixed New/Old
  static const double s4 = 4.0;
  static const double s8 = 8.0;
  static const double s12 = 12.0;
  static const double s16 = 16.0;
  static const double s24 = 24.0;
  static const double s32 = 32.0;
  static const double s48 = 48.0;
  static const double s64 = 64.0;

  static const double r8 = 8.0;
  static const double r16 = 16.0;
  static const double r24 = 24.0;
  static const double rFull = 999.0;
  
  // New Aliases from app_theme
  static const double radiusL = 16.0;
  static const double spaceM = 12.0;
  static const double spaceL = 24.0;

  // Shadows
  static const List<BoxShadow> shadowSoft = [
    BoxShadow(
      color: Color(0x1A000000), // 10% opacity black
      blurRadius: 10,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> shadowFloating = [
    BoxShadow(
      color: Color(0x26000000), // 15% opacity
      blurRadius: 16,
      offset: Offset(0, 8),
    ),
  ];

  // Durations
  static const Duration d200 = Duration(milliseconds: 200);
  static const Duration d300 = Duration(milliseconds: 300);
  static const Duration d500 = Duration(milliseconds: 500);

  // Curves
  static const Curve curveFastOutSlowIn = Curves.fastOutSlowIn;
}
