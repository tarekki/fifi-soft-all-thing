// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app/theme/app_theme.dart';
import 'app/router/app_router.dart';
import 'app/localization/l10n.dart';
import 'app/mode/app_mode_controller.dart';

void main() {
  runApp(const ProviderScope(child: YallaBuyApp()));
}

class YallaBuyApp extends ConsumerWidget {
  const YallaBuyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch AppMode if needed
    final _ = ref.watch(appModeProvider);

    return MaterialApp.router(
      title: 'YallaBuy - يلا باي',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(), // User changed this to light()
      
      // Routing
      routerConfig: appRouter,
      
      // Localization (RTL Default)
      locale: const Locale('ar'),
      supportedLocales: AppL10n.supportedLocales,
      localizationsDelegates: AppL10n.localizationsDelegates,
      localeResolutionCallback: AppL10n.localeResolutionCallback,
    );
  }
}
