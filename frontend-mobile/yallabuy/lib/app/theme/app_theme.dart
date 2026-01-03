// lib/app/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'tokens.dart';

class AppTheme {
  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: AppTokens.damascusRose,
        onPrimary: AppTokens.surface,
        secondary: AppTokens.aleppoOlive,
        onSecondary: AppTokens.surface,
        tertiary: AppTokens.mosaicTeal,
        onTertiary: AppTokens.surface,
        error: Color(0xFFBA1A1A),
        onError: AppTokens.surface,
        background: AppTokens.background,
        onBackground: AppTokens.basalt,
        surface: AppTokens.surface,
        onSurface: AppTokens.basalt,
        surfaceVariant: AppTokens.sand,
        onSurfaceVariant: AppTokens.basalt,
      ),
      scaffoldBackgroundColor: AppTokens.background,
      textTheme: GoogleFonts.tajawalTextTheme().apply(
        bodyColor: AppTokens.basalt,
        displayColor: AppTokens.basalt,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppTokens.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppTokens.basalt),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppTokens.surface,
        selectedItemColor: AppTokens.damascusRose,
        unselectedItemColor: AppTokens.aleppoOlive,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTokens.damascusRose,
          foregroundColor: AppTokens.surface,
          elevation: 0,
          padding: const EdgeInsets.symmetric(
            horizontal: AppTokens.spaceL, 
            vertical: 16,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTokens.radiusL),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
      cardTheme: CardThemeData(
        color: AppTokens.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shadowColor: AppTokens.shadowSoft[0].color,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusL),
        ),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppTokens.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusL),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusL),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusL),
          borderSide: const BorderSide(
            color: AppTokens.damascusRose, 
            width: 1.5,
          ),
        ),
        contentPadding: const EdgeInsets.all(AppTokens.spaceL),
      ),
      dialogTheme: DialogThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusL),
        ),
      ),
    );
  }
}
